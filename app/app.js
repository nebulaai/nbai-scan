let IS_PROD = false;

let GETH_HOSTNAME = IS_PROD?"api.nbai.io":"192.168.88.217"; // put your IP address!
let GETH_RPCPORT = IS_PROD?443:8545; // for geth --rpcport GETH_RPCPORT
let APIUrl = IS_PROD?'https://api1.nbai.io/':'http://192.168.88.217:8093/'

const listPerPage = 20;
var APP_HOSTNAME = "See package.json --> scripts --> start: Change 'localhost'!!!";
var APP_PORT = "See package.json --> scripts --> start: Perhaps change '8000'";

// this is creating the corrected geth command
var WL = window.location;
var geth_command = "geth --rpc --rpcaddr " + GETH_HOSTNAME + " --rpcport " + GETH_RPCPORT + '\
 --rpcapi "web3,eth" ' + ' --rpccorsdomain "' + WL.protocol + "//" + WL.host + '"';

'use strict';

angular.module('ethExplorer', ['ngRoute', 'ui.bootstrap', 'filters', 'ngSanitize'])

    .config(['$routeProvider', '$locationProvider',
        function ($routeProvider, $locationProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'views/main.html',
                    controller: 'mainCtrl'
                }).
                when('/blocks/:blockId', {
                    templateUrl: 'views/blockInfos.html',
                    controller: 'blockInfosCtrl'
                }).
                when('/tx/:transactionId', {
                    templateUrl: 'views/transactionInfos.html',
                    controller: 'transactionInfosCtrl'
                }).
                when('/address/:addressId', {
                    templateUrl: 'views/addressInfos.html',
                    controller: 'addressInfosCtrl'
                }).
                when('/chain/', {
                    templateUrl: 'views/chainInfos.html',
                    controller: 'chainInfosCtrl'
                }).
                when('/accounts/', {
                    templateUrl: 'views/accounts.html',
                    controller: 'accountsCtrl'
                }).
                when('/uncleblocks/', {
                    templateUrl: 'views/uncleList.html',
                    controller: 'uncleListCtrl'
                }).
                when('/uncleblocks/:blockId', {
                    templateUrl: 'views/blockInfos.html',
                    controller: 'blockInfosCtrl'
                }).
                otherwise({
                    redirectTo: '/'
                });
            // $locationProvider.html5Mode(true);
        }
    ])
    .run(function ($rootScope) {
        var web3 = require('web3');

        if (IS_PROD)
            web3.setProvider(new web3.providers.HttpProvider("https://" + GETH_HOSTNAME + ":" + GETH_RPCPORT));
        else
            web3.setProvider(new web3.providers.HttpProvider("http://" + GETH_HOSTNAME + ":" + GETH_RPCPORT));

        $rootScope.web3 = web3;

        if (window.web3)
            window.web3 = web3;

        function sleepFor(sleepDuration) {
            var now = new Date().getTime();
            while (new Date().getTime() < now + sleepDuration) {
                /* do nothing */
            }
        }
        var connected = false;
        if (!web3.isConnected()) {
            $('#connectwarning').modal({
                keyboard: false,
                backdrop: 'static'
            })
            $('#connectwarning').modal('show')
        }
    });