'use strict';

var system = angular.module('service.session', []);

system.factory('session', function($http, $location, $rootScope, $timeout) {
    return {
        // checks chrome storage if user is already logged in
        // if yes, assign $rootScope.user and return user
        // otherwise return null
        check : function(callback){
            chrome.storage.local.get('user', function (result) {
                $timeout(function(){

                    // if yes, assign rootScope.user
                    if(result.user){
                        $rootScope.user = result.user;
                        callback(result.user);
                    }

                    // if not, return null
                    else
                        callback(null);
                });
            });
        },
        // starts session
        start : function(user, callback){
            chrome.storage.local.set({'user': user}, function(){
                $timeout(function(){
                    $rootScope.user = user;
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