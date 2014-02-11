'use strict';

var api = angular.module('service.api', []);


api.factory('userService', function($http, serverOptions) {
    return {
        activity : function(callback){
            $http({method: 'GET', url: serverOptions.getUrl() + '/user/activity'}).success(function(response, status, headers, config) {
                callback(response.result);
            });
        },
        books : function(callback){
            $http({method: 'GET', url: serverOptions.getUrl() + '/user/word-lookup/books'}).success(function(response, status, headers, config) {
                callback(response.result);
            });
        },
        wordLookups : function(callback){
            $http({method: 'GET', url: serverOptions.getUrl() + '/user/word-lookup'}).success(function(response, status, headers, config) {
                callback(response.result);
            });
        }
    }
});

api.factory('activityService', function($http, serverOptions) {
    return {

    }
});

api.factory('wordLookupService', function($http, serverOptions) {
    return {
        save: function(word, callback){
            $http({
                url: serverOptions.getUrl() + "/word-lookup/" + word.word_lookup_id,
                method: "POST",
                data: word
            }).success(function(data, status, headers, config) {
                    callback(true);
                });
        }
    }
});

api.factory('member', function($http, serverOptions) {
    return {
        login : function(user, callback){
            $http({
                url: serverOptions.getUrl() + '/member/login',
                method: "POST",
                data: user
            }).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });
        },
        logout : function(callback){
            $http({
                url: serverOptions.getUrl() + '/member/logout',
                method: "POST"
            }).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });
        },
        isLoggedin : function(callback){
            $http({
                url: serverOptions.getUrl() + '/member/loggedin',
                method: "GET"
            }).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });
        },
        register : function(user, callback){
            $http({
                url: serverOptions.getUrl() + '/member/register',
                method: "POST",
                data: user
            }).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });
        }
    }
});

