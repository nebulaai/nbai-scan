angular.module('ethExplorer')
    .controller('accountsCtrl', function ($scope, $http) {

        $scope.init = function () {
            getTopAccounts(50, 0);
            function getTopAccounts(limit, offset) {
                $http.get(APIUrl + 'wallets?limit=' + limit + '&offset=' + offset).then(
                    function successCallback(json) {
                        $scope.accounts = json.data.result;
                        for (let i = 0; i < limit; i++) {
                            $scope.accounts[i].index = i + 1 + offset
                        }
                    }, function errorCallback(response) {
                    }
                );
            }

            $scope.pageArr = [1, 2, 3, 4, 5];

            $scope.getTopAccounts = function (limit, offset) {
                $http.get(APIUrl + 'wallets?limit=' + limit + '&offset=' + offset).then(
                    function successCallback(json) {
                        $scope.accounts = json.data.Result;
                        for (let i = 0; i < limit; i++) {
                            $scope.accounts[i].index = i + 1 + offset
                        }
                    }, function errorCallback(response) {
                    }
                );
            }

        };
        $scope.init();

    });
