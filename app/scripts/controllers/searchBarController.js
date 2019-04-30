angular.module('ethExplorer')
  .controller('searchCtrl', function ($scope) {
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
                console.log("nope");
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
        $location.path('/block/' + requestStr);
      }
  
      function goToAddrInfos(requestStr) {
        $location.path('/address/' + requestStr.toLowerCase());
      }
  
      function goToTxInfos(requestStr) {
        $location.path('/tx/' + requestStr);
      }
  
});


