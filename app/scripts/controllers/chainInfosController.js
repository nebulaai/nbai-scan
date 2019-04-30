var BigNumber = require('bignumber.js');

angular.module('ethExplorer')
	.controller('chainInfosCtrl', function ($scope, $http, $location) {
		$scope.init = function () {
			$http.get(APIUrl + 'blocks?limit=2').then(function successCallback(result) {
				let json = result.data.result
				blockNewest = json[0];
				currentBN = blockNewest.number;
				if (blockNewest.number !== undefined) {
					if (blockNewest !== undefined) {
						fillForm();
					}
				}
			}, function errorCallback(error) {
			});
		};
		$scope.init();

		let interval = setInterval(fillForm, 10000);

		function fillForm() {
			if($location.$$path == '/chain/'){
				let blockNewest;
				let blockBefore;
				$http.get(APIUrl + 'blocks?limit=2').then(function successCallback(result) {
	
					let json = result.data.result;
					blockNewest = json[0];
					$scope.blockNum = blockNewest.number;
					blockBefore = json[1];
					getChainStatus(blockNewest, blockBefore);
				}, function errorCallback(error) {
	
				});
				$scope.isConnected = web3.isConnected();
				$scope.versionApi = web3.version.api;
				$scope.versionClient = web3.version.client;
				$scope.versionCurrency = web3.version.ethereum;
			}
			else{
				clearInterval(interval);
			}
		}

		function getChainStatus(blockNewest, blockBefore) {

			// difficulty
			$scope.difficulty = Number(blockNewest.difficulty);
			$scope.difficultyToExponential = $scope.difficulty.toExponential(3);

			$scope.totalDifficulty = Number(blockNewest.totalDifficulty);
			$scope.totalDifficultyToExponential = $scope.totalDifficulty.toExponential(3);
			$scope.difficulty_formatted = new BigNumber($scope.difficulty).toFormat(0)

			$scope.totalDifficultyDividedByDifficulty = $scope.totalDifficulty / $scope.difficulty;
			$scope.totalDifficulty_formatted = new BigNumber($scope.totalDifficulty).toFormat(0)

			$scope.AltsheetsCoefficient = $scope.totalDifficultyDividedByDifficulty / $scope.blockNum;

			// Gas Limit
			$scope.gasLimit = new BigNumber(blockNewest.gas_limit).toFormat(0);

			// Time
			var newDate = new Date();
			newDate.setTime(blockNewest.timestamp * 1000);
			$scope.time = newDate.toUTCString();

			$scope.secondsSinceBlock1 = blockNewest.timestamp - 1438226773;
			$scope.daysSinceBlock1 = ($scope.secondsSinceBlock1 / 86400).toFixed(2);

			// Average Block Times:

			if (blockBefore !== undefined) {
				$scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
			}

			$http.get(APIUrl + 'utility/blocktime').then(function successCallback(resultObj) {
				let result = resultObj.data;
				$scope.averages = result;
			}, function errorCallback(error) {

			});
		}
	});