var BigNumber = require('bignumber.js');
let noTransaction = false;

angular.module('ethExplorer')
    .controller('transactionInfosCtrl', function ($rootScope, $scope, $location, $routeParams, $q, $http) {

        $scope.init = function () {
            $scope.txId = $routeParams.transactionId;
            if ($scope.txId !== undefined) {
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
               
                getStatus(blockNewest.number);
            }, function errorCallback(error) {
            });

        }

        function getSmart(limit){
            $http.get(APIUrl + 'events/' + $scope.txId + '?limit=' + limit).then(function successCallback(result) {
                console.log('result', result.data);
                if(limit === 0 && result.data.event_count !== 0){
                    getSmart(result.data.event_count)
                }
                else{
                    let contract_addresses_str = '';
                    let contract_addresses = [];
                    let temp_smarts = result.data.result;
                    temp_smarts.forEach(element => {
                        if(element.indexed_data){
                            element.indexed_data = JSON.parse(element.indexed_data);
                            element.indexed_data_keys = Object.keys(element.indexed_data);
                        }
                        if(element.data){
                            element.data = JSON.parse(element.data);
                            element.data_keys = Object.keys(element.data);
                        }                        
                        if(contract_addresses_str.indexOf(element.contract_address) == -1){
                            contract_addresses.push(element.contract_address);
                            contract_addresses_str += element.contract_address;
                        }
                    });
                    $scope.smarts = temp_smarts;
                    $scope.addresses = contract_addresses;
                    console.log('arr', contract_addresses);
                }
            }, function errorCallback(error) {

            });
        }

        function getStatus(latestId) {
            let urlWhole = APIUrl + 'transactions/' + $scope.txId;
            $http.get(urlWhole).then(function successCallback(resultObj) {
                let result = resultObj.data.result;
                $scope.result = result;

                if (result.block_hash !== undefined) {
                    $scope.blockHash = result.block_hash;
                }
                else {
                    $scope.blockHash = 'pending';
                }
                if (result.block_number !== undefined) {
                    $scope.blockNumber = result.block_number;
                }
                else {
                    $scope.blockNumber = 'pending';
                }
                $scope.from = result.t_from;
                $scope.gas = result.gas;
                $scope.gasPrice = web3.fromWei(new BigNumber(Number(result.gas_price)), "ether").toFormat(10) + " NBAI";
                $scope.hash = result.hash;
                $scope.input = result.input; // that's a string
                $scope.nonce = Number(result.nonce);
                $scope.to = result.t_to;
                $scope.transactionIndex = result.transactionIndex;
                $scope.ethValue = web3.fromWei(result.value, "ether");
                $scope.txprice = web3.fromWei(result.gas * result.gasPrice, "ether") + " NBAI";
                if ($scope.blockNumber !== undefined) {
                    $scope.conf = latestId - $scope.blockNumber;
                    if ($scope.conf === 0) {
                        $scope.conf = 'unconfirmed'; 
                    }
                }
                var newDate = new Date();
                newDate.setTime(Number(result.timestamp) * 1000);
                $scope.time = newDate.toUTCString();


            }, function errorCallback(error) {
                if(error.status == 400){

                    console.log('get');
                }
                // console.log(error);
            });
        }

        function getTransactionInfos() {
            var deferred = $q.defer();

            web3.eth.getTransaction($scope.txId, function (error, result) {
                if (!error) {
                    deferred.resolve(result);
                }
                else {
                    deferred.reject(error);
                }
            });
            return deferred.promise;

        }

    });
