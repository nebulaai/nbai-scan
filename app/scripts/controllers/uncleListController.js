angular.module('ethExplorer')
    .controller('uncleListCtrl', function ($scope, $http) {
        $scope.init = function (limit, offset) {

            getUncleList(1)

            function getUncleList(page) {
                $scope.currentPage = {
                    val: page
                };
                let offset = (page - 1) * listPerPage;
                $http.get(APIUrl + 'uncleblocks?limit=' + listPerPage + '&offset=' + offset)
                    .then(function successCallback(result) {
                        if (result) {
                            $scope.unclelist = result.data.result
                            $scope.pages = Math.ceil(result.data.uncleblock_count / listPerPage);
                            $scope.pageArr = [];
                            for (i = 1; i <= $scope.pages; i++) {
                                $scope.pageArr.push(i);
                            }
                            $scope.currentPageArr = [];
                            if ($scope.pages >= 5) {
                                for (i = offset + 1; i < offset + 6; i++) {
                                    $scope.currentPageArr.push(i);
                                }
                            } else {
                                for (i = 1; i <= $scope.pages; i++) {
                                    $scope.currentPageArr.push(i);
                                }
                            }

                            $scope.unclelist.map(item => {
                                // console.log(item)
                                getUncleBlockAge(item)
                            })
                        }
                    }, function errorCallback(error) {
                        console.log(error)
                    })
            }

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
                return finalString
            }

            function getUncleBlockAge(item) {
                let newDate = new Date()
                let currentTimeStamp = newDate.getTime()
                let daysString = ''
                let hoursString = ''
                let minutesString = ''

                let diffSeconds
                let finalString = ''
                if (item.timestamp) {
                    diffSeconds = Math.abs(currentTimeStamp / 1000 - item.timestamp)
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

                    item["age"] = finalString
                }
                return item
            }

            $scope.getUncleList = function (page) {
                offset = (page - 1) * listPerPage;
                $scope.currentPage.val = page;
                $scope.currentPageArr = [];
                if ($scope.pages >= 5) {
                    if ($scope.currentPage.val > 2 && $scope.currentPage.val < $scope.pages - 1) {
                        for (i = $scope.currentPage.val - 2; i < $scope.currentPage.val + 3; i++) {
                            $scope.currentPageArr.push(i);
                        }
                    } else if ($scope.currentPage.val <= 2) {
                        $scope.currentPageArr = [1, 2, 3, 4, 5];
                    } else {
                        $scope.currentPageArr = [$scope.pages - 4, $scope.pages - 3, $scope.pages - 2, $scope.pages - 1, $scope.pages];
                    }
                } else {
                    for (i = 1; i <= $scope.pages; i++) {
                        $scope.currentPageArr.push(i);
                    }
                }

                $http.get(APIUrl + 'uncleblocks?limit=' + listPerPage + '&offset=' + offset)
                    .then(function successCallback(result) {
                        if (result) {
                            $scope.unclelist = result.data.result
                            $scope.unclelist.map(item => {
                                getUncleBlockAge(item)
                            })
                        }
                    }, function errorCallback(error) {
                        console.log(error)
                    })
            }

        }
        $scope.init()

    })