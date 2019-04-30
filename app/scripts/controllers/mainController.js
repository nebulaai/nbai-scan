var BigNumber = require('bignumber.js');

angular.module('ethExplorer')
  .controller('mainCtrl', function ($scope, $location, $http) {
    $scope.blocks = [];
    $scope.recenttransactions = [];
    let currentBN = web3.eth.blockNumber;

    getNewest((result) => {
      if (result) {
        getNew();
      }
      else {
        getWeb3New();
      }
    });

    $scope.processRequest = function () {
      var requestStr = $scope.ethRequest;

      if (requestStr !== undefined) {
        var regexpTx = /[0-9a-zA-Z]{64}?/;
        var regexpAddr = /^(0x)?[0-9a-f]{40}$/; //New ETH Regular Expression for Addresses
        var regexpBlock = /[0-9]{1,7}?/;

        var result = regexpTx.test(requestStr);

        if (result === true) {
          goToTxInfos(requestStr)
        }
        else {
          result = regexpAddr.test(requestStr.toLowerCase());
          if (result === true) {
            goToAddrInfos(requestStr.toLowerCase())
          }
          else {
            result = regexpBlock.test(requestStr);
            if (result === true) {
              goToBlockInfos(requestStr)
            }
            else {
              return null;
            }
          }
        }
      }
      else {
        return null;
      }
    };

    function goToBlockInfos(requestStr) {
      $location.path('/blocks/' + requestStr);
    }

    function goToAddrInfos(requestStr) {
      $location.path('/address/' + requestStr.toLowerCase());
    }

    function goToTxInfos(requestStr) {
      $location.path('/tx/' + requestStr);
    }

    function getNew() {
      updateBlockList();
      updateTXList();
      updateStats();
      getNewest((result) => {
        if($location.url() == '/'){
          if (result) {
            setTimeout(getNew, 10000);
          }
          else {
            setTimeout(getWeb3New, 10000);
          }
        }
      });
    }

    function getWeb3New() {
      if (currentBN !== web3.eth.blockNumber) {
        let diff = web3.eth.blockNumber - currentBN;
        currentBN = web3.eth.blockNumber;
        updateWeb3BlockList(diff);
        updateWeb3TXList(diff);
        updateWeb3Stats();
        $scope.$apply();
      }
      getNewest((result) => {
        if($location.url() == '/'){
          if (result) {
            setTimeout(getNew, 10000);
          }
          else {
            setTimeout(getWeb3New, 10000);
          }
        }
      });
    }

    function getNewest(callback) {
      if (currentLang != 'en') {
        setContent(currentLang);
      }
      let web3Newest = web3.eth.blockNumber;
      let blockNewest;
      $http.get(APIUrl + 'blocks?limit=1').then(function successCallback(result) {
        let json = result.data.result;
        blockNewest = json[0];
        if (Math.abs(web3Newest - blockNewest.number) < 5) {
          callback(true);
        }
        else {
          console.log('API problem, get result from web3', web3Newest - blockNewest.number);
          callback(false);
        }
      }, function errorCallback(error) {
        console.log(error);
        callback(false);
      });
    }

    function updateStats() {
      let blockNewest;
      let blockBefore;
      $http.get(APIUrl + 'blocks?limit=2').then(function successCallback(result) {
        let json = result.data.result;
        blockNewest = json[0];
        $scope.blockNum = blockNewest.number;
        blockBefore = json[1];
        getStatus(blockNewest, blockBefore);
      }, function errorCallback(error) {

      });

      // Block Explorer Info
      $scope.isConnected = web3.isConnected();

      $scope.versionApi = web3.version.api;
      $scope.versionClient = web3.version.client;
      $scope.versionCurrency = web3.version.ethereum; 

      // ready for the future:
      try { $scope.versionWhisper = web3.version.whisper; }
      catch (err) { $scope.versionWhisper = err.message; }
    }

    function getStatus(blockNewest, blockBefore) {

      if (blockNewest.number !== undefined) {
        if (blockNewest !== undefined) {

          // difficulty
          $scope.difficulty = Number(blockNewest.difficulty);
          $scope.difficultyToExponential = $scope.difficulty.toExponential(3);

          $scope.totalDifficulty = Number(blockNewest.totalDifficulty);
          $scope.totalDifficultyToExponential = $scope.totalDifficulty.toExponential(3);

          $scope.totalDifficultyDividedByDifficulty = $scope.totalDifficulty / $scope.difficulty;

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
        }
      }
    }

    function updateTXList() {
      $http.get(APIUrl + 'transactions?limit=10&offset=0').then(function successCallback(result) {
        $scope.recenttransactions = [];
        let json = result.data.result;
        json.forEach(element => {
          $scope.recenttransactions.push(element);
        });
      }, function errorCallback(error) {

      });
    }

    function updateBlockList() {
      $http.get(APIUrl + 'blocks').then(function successCallback(result) {
        $scope.blocks = [];
        let json = result.data.result;
        json.forEach(element => {
          $scope.blocks.push(element);
        });
      }, function errorCallback(error) {

      });

    }

    function updateWeb3Stats() {
      $scope.blockNum = web3.eth.blockNumber; 

      if ($scope.blockNum !== undefined) {

        var blockNewest = web3.eth.getBlock($scope.blockNum);
        // debugger

        if (blockNewest !== undefined) {

          // difficulty
          $scope.difficulty = blockNewest.difficulty;
          $scope.difficultyToExponential = blockNewest.difficulty.toExponential(3);

          $scope.totalDifficulty = blockNewest.totalDifficulty;
          $scope.totalDifficultyToExponential = blockNewest.totalDifficulty.toExponential(3);

          $scope.totalDifficultyDividedByDifficulty = $scope.totalDifficulty.dividedBy($scope.difficulty);
          $scope.totalDifficultyDividedByDifficulty_formatted = $scope.totalDifficultyDividedByDifficulty.toFormat(1);

          $scope.AltsheetsCoefficient = $scope.totalDifficultyDividedByDifficulty.dividedBy($scope.blockNum);
          $scope.AltsheetsCoefficient_formatted = $scope.AltsheetsCoefficient.toFormat(4);

          // large numbers still printed nicely:
          $scope.difficulty_formatted = $scope.difficulty.toFormat(0);
          $scope.totalDifficulty_formatted = $scope.totalDifficulty.toFormat(0);

          // Gas Limit
          $scope.gasLimit = new BigNumber(blockNewest.gasLimit).toFormat(0);

          // Time
          var newDate = new Date();
          newDate.setTime(blockNewest.timestamp * 1000);
          $scope.time = newDate.toUTCString();

          $scope.secondsSinceBlock1 = blockNewest.timestamp - 1438226773;
          $scope.daysSinceBlock1 = ($scope.secondsSinceBlock1 / 86400).toFixed(2);

          var blockBefore = web3.eth.getBlock($scope.blockNum - 1);
          if (blockBefore !== undefined) {
            $scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
          }
        }
      }

      $scope.isConnected = web3.isConnected();
      $scope.versionApi = web3.version.api;
      $scope.versionClient = web3.version.client;
      $scope.versionCurrency = web3.version.ethereum; 
      try { $scope.versionWhisper = web3.version.whisper; }
      catch (err) { $scope.versionWhisper = err.message; }
    }

    function updateWeb3TXList(diff) {
      var currentTXnumber = web3.eth.blockNumber;
      $scope.txNumber = currentTXnumber;
      if ($scope.recenttransactions.length < 10) {
        for (var i = 0; i < 10 && currentTXnumber - i >= 0; i++) {
          $scope.recenttransactions.push(web3.eth.getTransactionFromBlock(currentTXnumber - i));
        }
      }
      else {
        $scope.recenttransactions.splice(9, diff);
        for (var i = 0; i < diff; i++) {
          $scope.recenttransactions.splice(i, 0, web3.eth.getTransactionFromBlock(currentTXnumber));
        }
      }

    }

    function updateWeb3BlockList(diff) {
      var currentBlockNumber = web3.eth.blockNumber;
      $scope.blockNumber = currentBlockNumber;
      if ($scope.blocks.length < 10) {
        for (var i = 0; i < 10 && currentBlockNumber - i >= 0; i++) {
          $scope.blocks.push(web3.eth.getBlock(currentBlockNumber - i));
        }
      }
      else {
        $scope.blocks.splice(9, diff);
        for (var i = 0; i < diff; i++) {
          $scope.blocks.splice(0, 0, web3.eth.getBlock(currentBlockNumber));
        }
      }
    }



  });

angular.module('filters', []).
  filter('truncate', function () {
    return function (text, length, end) {
      if (isNaN(length))
        length = 10;

      if (end === undefined)
        end = "...";

      if (text.length <= length || text.length - end.length <= length) {
        return text;
      } else {
        return String(text).substring(0, length - end.length) + end;
      }
    };
  }).
  filter('diffFormat', function () {
    let n;
    return function (diffi) {
      if (isNaN(diffi)) return diffi;
      if (diffi < 1000000) {
        n = diffi / 1000000;
        return n.toFixed(3) + " M";
      }
      else if (diffi < 1000000000) {
        n = diffi / 1000000000;
        return n.toFixed(3) + " G";
      }
      else {
        n = diffi / 1000000000000;
        return n.toFixed(3) + " T";
      }
    };
  }).
  filter('stylize', function () {
    return function (style) {
      if (isNaN(style)) return style;
      var si = '<span class="btn btn-primary">' + style + '</span>';
      return si;
    };
  }).
  filter('stylize2', function () {
    return function (text) {
      if (isNaN(text)) return text;
      var si = '<i class="fa fa-exchange"></i> ' + text;
      return si;
    };
  }).
  filter('hashFormat', function () {
    return function (hashr) {
      if (isNaN(hashr)) return hashr;
      var n = hashr / 1000000000000;
      return n.toFixed(3) + " TH/s";
    };
  }).
  filter('gasFormat', function () {
    return function (txt) {
      if (!txt) return 0;
      if (isNaN(txt)) return txt;
      var b = new BigNumber(txt);
      return b.toFormat(0);
    };
  }).
  filter('BigNum', function () {
    return function (txt) {
      if (!/^\d+$/.test(txt)) return txt;
      if (!txt) return 0 + " NBAI";;
      if (isNaN(txt)) return txt;
      var b = new BigNumber(txt);
      var w = web3.fromWei(b, "ether");
      return w.toFormat(2) + " NBAI";
    };
  }).
  filter('gasPrice', function () {
    return function (txt) {
      if (!/^\d+$/.test(txt)) return txt;
      if (!txt) return 0 + " NBAI";;
      if (isNaN(txt)) return txt;
      var b = new BigNumber(txt);
      var w = web3.fromWei(b, "ether");
      return w.toFixed(8) + " NBAI";
    };
  }).
  filter('sizeFormat', function () {
    return function (size) {
      if (isNaN(size)) return size;
      var s = size / 1000;
      return s.toFixed(3) + " kB";
    };
  }).
  filter('toNumber', function () {
    return function (txt) {
      if (isNaN(txt)) return txt;
      return Number(txt);
    };
  }).
  filter('toEth', function () {
    return function (txt) {
      if (isNaN(txt)) return txt;
      return web3.fromWei(Number(txt), "ether");
    };
  }).
  filter('balance', function ($filter) {
    return function (txt) {
      if (!txt) return 0 + " NBAI";;
      if (isNaN(txt)) return txt;
      var n = parseInt(txt) / 1000000000000000000;
      var b = $filter('currency')(n, '', 2);
      return b + " NBAI";
    };
  }).
  filter('Name', function () {
    return function (txt) {
      txt = txt.replace(/[^a-zA-Z]/g, '');
      txt = txt.charAt(0).toUpperCase() + txt.substring(1, txt.length);
      txt = txt.replace(/([A-Z])/g, ' ' + "$1");
      return txt;
    };
  });


let saveLang;
$(document).ready(function () {
  saveLang = localStorage.getItem('lang');
});


//////////////////////////////////translation


let translations;

let currentLang = saveLang ? saveLang : "en";
$.getJSON("scripts/controllers/translation.json", function (data) {
  translations = data;
  if(currentLang != 'en'){
    setContent(currentLang);
  }
});

function setContent(lang = "en") {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  for (var x = 0; keys = Object.keys(translations[lang]), x < keys.length; x++) {
    $(".translate-" + keys[x].toDash())
    .text("")
    .append(translations[lang][keys[x]]);
  }
}

// make language setting choice item color
$(document).ready(function () {
    $("#lang-en").click(function () {
        $("#lang-en").css("color","#3323e1");
        $("#lang-ch").css("color","#FFF");
      });
    $("#lang-ch").click(function () {
      $("#lang-en").css("color","#FFF");
      $("#lang-ch").css("color","#3323e1");
    });
});


String.prototype.toDash = function () {
  return this.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
};






