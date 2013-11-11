'use strict';

var system = angular.module('service.session', []);

system.factory('session', function($http, $location, $rootScope, $timeout) {
    return {
        start : function(user, callback){
            chrome.storage.local.set({'user': user}, function(){
                $timeout(function(){
                    callback(true);
                });
            });
        },
        end : function(callback){
            chrome.storage.local.set({'user': null}, function(){
                $timeout(function(){
                    $rootScope.user = null;
                    callback(true);
                });
            });
        }
    }
});