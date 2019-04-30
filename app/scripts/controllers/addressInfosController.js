
angular.module('ethExplorer')
    .controller('addressInfosCtrl', function ($scope, $location, $routeParams, $q, $http) {
        $scope.init = function () {
            $scope.addressId = $routeParams.addressId;
            $scope.addressId = $scope.addressId.indexOf('0x') == 0 ? $scope.addressId.trim() : '0x' + $scope.addressId.trim();
            let addressId = $scope.addressId.toLowerCase();
            if (addressId !== undefined) {
                var pages;
                getAddressBalance()
                    .then(function (result) {
                        $scope.balance = web3.fromWei(result).toNumber();
                        getETHUSD();
                    });
                getCode()
                    .then(function (result) {
                        $scope.code = result;
                    });
                getTransactions()
                    .then(function (result) {
                        $scope.transactions = result;
                    });
                getTransactionsHistory(1);
            } else {
                $location.path("/");
            }

            function getAddressBalance() {
                var deferred = $q.defer();
                web3.eth.getBalance(addressId, function (error, result) {
                    if (!error) { deferred.resolve(result); }
                    else { deferred.reject(error); }
                });
                return deferred.promise;
            }


            function getETHUSD() {
                $http.get('https://api.coinmarketcap.com/v2/ticker/2692/').then(
                    function successCallback(json) {
                        var price = Number(json['data']['data']['quotes']['USD']['price']);
                        var balanceusd = price * $scope.balance;
                        $scope.balanceusd = balanceusd;
                    }, function errorCallback(response) {
                    }
                );
            }



            $scope.getTransactionsHistory = function (page) {
                offset = (page - 1) * listPerPage;
                $scope.currentPage.val = page;
                $scope.currentPageArr = [];
                if($scope.pages >= 5){
                    if($scope.currentPage.val > 2 && $scope.currentPage.val < $scope.pages - 1){
                        for (i = $scope.currentPage.val - 2; i < $scope.currentPage.val + 3; i++) {
                            $scope.currentPageArr.push(i);
                        }
                    }
                    else if ($scope.currentPage.val <= 2){
                        $scope.currentPageArr = [1, 2, 3, 4, 5];
                    }else{
                        $scope.currentPageArr = [$scope.pages - 4, $scope.pages - 3, $scope.pages - 2, $scope.pages - 1, $scope.pages];
                    }
                }else{
                    for (i = 1; i <= $scope.pages; i++) {
                        $scope.currentPageArr.push(i);
                    }
                }
                
                $http.get(APIUrl + 'transactions?addresses=' + addressId + '&limit=' + listPerPage + '&offset=' + offset).then(function successCallback(result) {
                    if (result) {
                        $scope.transactionsHistory = result.data.result;
                    }
                }, function errorCallback(error) {
                    console.log(error);
                });
            }

            function getTransactionsHistory(page) {
                $scope.currentPage = {
                    val: page
                };
                let offset = (page - 1) * listPerPage;
                $http.get(APIUrl + 'transactions?addresses=' + addressId + '&limit=' + listPerPage + '&offset=' + offset).then(function successCallback(result) {
                    if (result) {
                        $scope.transactionsHistory = result.data.result
                        $scope.pages = Math.ceil(result.data.tx_count / listPerPage);
                        $scope.pageArr = [];
                        for (i = 1; i <= $scope.pages; i++) {
                            $scope.pageArr.push(i);
                        }
                        $scope.currentPageArr = [];
                        if($scope.pages >= 5){
                            for (i = offset + 1; i < offset + 6; i++) {
                                $scope.currentPageArr.push(i);
                            }
                        }else{
                            for (i = 1; i <= $scope.pages; i++) {
                                $scope.currentPageArr.push(i);
                            }
                        }
                    }
                }, function errorCallback(error) {
                    console.log(error);
                });
            }

            function getAddressTransactionCount() {
                var deferred = $q.defer();
                web3.eth.getTransactionCount(addressId, function (error, result) {
                    if (!error) { deferred.resolve(result); }
                    else { deferred.reject(error); }
                });
                return deferred.promise;
            }

            function getCode() {
                var deferred = $q.defer();
                web3.eth.getCode(addressId, function (error, result) {
                    if (!error) { deferred.resolve(result); }
                    else { deferred.reject(error); }
                });
                return deferred.promise;
            }

            // TODO: not working yet:
            function getTransactions() {
                var deferred = $q.defer();
                return deferred.promise;

            }
        };
        $scope.init();

    });
