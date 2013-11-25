'use strict';

var api = angular.module('service.api', []);


api.factory('userService', function($http, serverOptions) {
    return {
        activity : function(user_id, callback){
            $http({method: 'GET', url: serverOptions.getUrl() + '/user/' + user_id + '/activity'}).success(function(response, status, headers, config) {
                callback(response.result);
            });
        },
        books : function(user_id, callback){
            $http({method: 'GET', url: serverOptions.getUrl() + '/user/' + user_id + '/word-lookup/books'}).success(function(response, status, headers, config) {
                callback(response.result);
            });
        },
        wordLookups : function(user_id, callback){
            $http({method: 'GET', url: serverOptions.getUrl() + '/user/' + user_id + '/word-lookup'}).success(function(response, status, headers, config) {
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
            $http.post(serverOptions.getUrl() + '/user/login', user).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });
        },
        register : function(user, callback){
            $http.post(serverOptions.getUrl() + '/user/register', user).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });;
        }
    }
});

