'use strict';

var api = angular.module('service.api', []);

api.factory('userService', function($http) {
    return {
        activity : function(user_id, callback){
            $http({method: 'GET', url: 'http://localhost:3000/user/' + user_id + '/activity'}).success(function(response, status, headers, config) {
                callback(response.result);
            });
        }
    }
});

api.factory('activityService', function($http) {
    return {

    }
});

api.factory('member', function($http) {
    return {
        login : function(user, callback){
            $http.post('http://localhost:3000/user/login', user).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });
        },
        register : function(user, callback){
            $http.post('http://localhost:3000/user/register', user).
                success(function(response) {
                    callback(true, response);
                }).error(function(response){
                    callback(false, response);
                });;
        }
    }
});

