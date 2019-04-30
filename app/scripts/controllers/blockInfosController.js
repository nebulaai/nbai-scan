var BigNumber = require('bignumber.js');

angular.module('ethExplorer')
    .controller('blockInfosCtrl', function ($scope, $location, $routeParams, $q, $http) {
        $scope.blockType = $location.$$path.split('/')[1];

        $scope.init = function () {
            $scope.blockId = $routeParams.blockId;
            if ($scope.blockId !== undefined) {
                fillForm();
            }
            else {
                $location.path("/");
            }
        };

        $scope.init();
        setInterval(fillForm, 10000);

        function fillForm() {
            $http.get(APIUrl + 'blocks?limit=1').then(function successCallback(result) {
                let json = result.data.result;
                blockNewest = json[0];
                getBlockStatus(blockNewest.number);
            }, function errorCallback(error) {

            });
        }

        function hex2a(hexx) {
            var hex = hexx.toString(); //force conversion
            var str = '';
            for (var i = 0; i < hex.length; i += 2)
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));

            return str;
        }

        function getBlockStatus(latestId) {
            var regexpTx = /[0-9a-zA-Z]{64}?/; //New ETH Regular Expression for Addresses
            let regexpBlock = /[0-9]{1,7}?/;

            let urlWhole = APIUrl + $scope.blockType + '/' + $scope.blockId + '?value-type=block-';
            if (regexpTx.test($scope.blockId)) {
                urlWhole += 'hash'
            } else {
                urlWhole += 'number';
            }
            $http.get(urlWhole).then(function successCallback(resultObj) {
                let result = resultObj.data.result;
                $scope.result = result;
                // $scope.numberOfUncles = result.uncles.length;

                if (result.hash !== undefined) {
                    $scope.hash = result.hash;
                }
                else {
                    $scope.hash = 'pending';
                }
                if (result.miner !== undefined) {
                    $scope.miner = result.miner;
                }
                else {
                    $scope.miner = 'pending';
                }
                $scope.gasLimit = result.gas_limit;
                $scope.gasUsed = result.gas_used;
                $scope.nonce = result.nonce;
                var diff = ("" + result.difficulty).replace(/['"]+/g, '') / 1000000000000;
                $scope.difficulty = Number(result.difficulty);
                $scope.gasLimit = new BigNumber(result.gas_limit).toFormat(0); // that's a string
                $scope.gasUsed = new BigNumber(result.gas_used).toFormat(0);
                $scope.nonce = result.nonce;
                $scope.number = result.number;
                $scope.parentHash = result.parent_hash;
                $scope.uncledata = result.sha3Uncles;
                $scope.rootHash = result.stateRoot;
                $scope.blockNumber = result.number;
                $scope.CanonicalBlockNumber = result.CanonicalBlockNumber ? result.CanonicalBlockNumber : '';
                $scope.timestamp = new Date(result.timestamp * 1000).toUTCString();
                $scope.UncleBlockReward = result.UncleBlockReward / 1e18

                if (result.extraData) {
                    $scope.extraData = result.extraData.slice(2);
                    $scope.dataFromHex = hex2a(result.extraData.slice(2));
                }
                $scope.size = result.size;
                $scope.firstBlock = false;
                $scope.lastBlock = false;
                if ($scope.blockNumber !== undefined) {
                    if (currentLang == "en") {
                        $scope.conf = latestId - $scope.blockNumber + " Confirmations";
                    } else if (currentLang == 'ch') {
                        $scope.conf = latestId - $scope.blockNumber + " 确认";
                    }

                    if (latestId === $scope.blockNumber) {
                        if (currentLang == "en") {
                            $scope.conf = 'Unconfirmed';
                        } else if (currentLang == 'ch') {
                            $scope.conf = '未确认';
                        }
                        $scope.lastBlock = true;
                    }
                    if ($scope.blockNumber === 0) {
                        $scope.firstBlock = true;
                    }
                }

                $scope.transactions = result.Transactions;

                $scope.age = getUncleBlockAge(result.timestamp)
                function checkTimeDiff(num1, num2, str1, str2) {
                    let finalString = ''
                    switch (num2) {
                        case 0:
                            finalString = `${num1} ${str1} ago`
                            break
                        case 1:
                            finalString = `${num1} ${str1} ${num2} ${str2} ago`
                            break
                        default:
                            finalString = `${num1} ${str1} ${num2} ${str2}s ago`
                    }
                    console.log(finalString);
                    return finalString
                }
                function getUncleBlockAge(timestamp) {
                    let newDate = new Date()
                    let currentTimeStamp = newDate.getTime()
                    let daysString = ''
                    let hoursString = ''
                    let minutesString = ''

                    let diffSeconds
                    let finalString = ''
                    if (timestamp) {
                        diffSeconds = Math.abs(currentTimeStamp / 1000 - timestamp)
                        let days = Math.floor(diffSeconds / 86400)
                        let hours = Math.floor(diffSeconds / 3600) % 24
                        let minutes = Math.floor(diffSeconds / 60) % 60
                        let seconds = diffSeconds % 60
                        switch (true) {
                            case (days === 0 && hours === 0 && minutes === 0 && seconds !== 0):
                                finalString = `${seconds} secs ago`
                                break
                            case (days === 0 && hours === 0 && minutes !== 0):
                                finalString = (minutes === 1) ? `${minutes} min ago` : `${minutes} mins ago`
                                break
                            case (days === 0 && hours !== 0):
                                finalString = (hours === 1) ? checkTimeDiff(hours, minutes, 'hr', 'min') : checkTimeDiff(hours, minutes, 'hrs', 'min')
                                break
                            case (days !== 0):
                                finalString = (days === 1) ? checkTimeDiff(days, hours, 'day', 'hr') : checkTimeDiff(days, hours, 'days', 'hr')
                                break
                            default:
                                finalString = ''
                        }
                    }
                    return finalString
                }

            }, function errorCallback(error) {

            });
        }
    });
