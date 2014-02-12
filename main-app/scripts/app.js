'use strict';

var mainApp = angular.module('mainApp', ['service.api', 'service.session', 'service.outsider', 'service.analysis', 'service.utility', 'service.options', 'ui.bootstrap', 'highcharts-ng', 'ngCookies', 'ngRoute']);

mainApp.config(function ($routeProvider, $httpProvider) {

    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.responseInterceptors.push(function($q, $location) {
        return function(promise) {
            return promise.then(
                // Success: just return the response
                function(response){
                    return response;
                },
                // Error: check the error status to get only the 401
                function(response) {
                    if (response.status === 401)
                        $location.url('/login');
                    return $q.reject(response);
                }
            );
        }
    });
    //================================================

    $httpProvider.defaults.withCredentials = true;

    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/contact', {
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/word-lookup', {
            templateUrl: 'views/word-lookup.html',
            controller: 'WordLookupCtrl',
            resolve: { user: mainApp.resolveUser }
        })


        .when('/word-lookup-quiz', {
            templateUrl: 'views/games/word-lookup-quiz.html',
            controller: 'WordLookupQuizCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/word-game', {
            templateUrl: 'views/games/word-game.html',
            controller: 'WordLookupQuizOnlineCtrl',
            resolve: { user: mainApp.resolveUser }
        })


        .when('/login', {
            templateUrl: 'views/member/login.html',
            controller: 'LoginCtrl'
        })
        .when('/logout', {
            templateUrl: 'views/member/logout.html',
            controller: 'LogoutCtrl'
        })
        .when('/register', {
            templateUrl: 'views/member/register.html',
            controller: 'RegisterCtrl'
        })


        .otherwise({
            redirectTo: '/'
        });

});

// EXTEND Classes here
mainApp.config(function ($routeProvider) {

    // check if dates are the same
    // it only checks: (day, month and year)
    Date.prototype.sameDateAs = function(pDate){
        return ((this.getFullYear()==pDate.getFullYear())&&(this.getMonth()==pDate.getMonth())&&(this.getDate()==pDate.getDate()));
    }

});

mainApp.run(function ($rootScope) {
    // var server = {mode: 'local', url: 'http://localhost:3000'};
    var server = {mode: 'server', url: 'http://smart-read-api.aws.af.cm'};
    chrome.storage.local.set({'server': server}, function(){});
    $rootScope.server = server;
});

mainApp.resolveUser = function($q, $route, $rootScope, $location, session){
    var defer = $q.defer();

    // if already have $rootScope.user, just return it
    if($rootScope.user){
        defer.resolve($rootScope.user)
    }

    // otherwise check if chrome storage has user session info
    else {
        session.check(function(user){
            // if it has, then return it
            if(user)
                defer.resolve(user);

            // otherwise, redirect to login
            else {
                defer.reject();
                $location.path('/login');
            }
        });
    }

    return defer.promise;
}

mainApp.filter('oneZeroToYesNo', function() {
    return function(input) {
        return input == 1 ? 'Yes' : 'No';
    };
});

mainApp.filter('oneZeroToSuccessFail', function() {
    return function(input) {
        return input == 1 ? 'Success' : 'Fail';
    };
});