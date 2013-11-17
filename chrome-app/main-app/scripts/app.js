'use strict';

var mainApp = angular.module('mainApp', ['service.api', 'service.session', 'service.outsider', 'ui.bootstrap']);

mainApp.config(function ($routeProvider) {

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
        .when('/word-lookup', {
            templateUrl: 'views/word-lookup.html',
            controller: 'WordLookupCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/activity', {
            templateUrl: 'views/activity.html',
            controller: 'ActivityCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/word-lookup-quiz', {
            templateUrl: 'views/word-lookup-quiz.html',
            controller: 'WordLookupQuizCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/word-lookup-quiz/online', {
            templateUrl: 'views/word-lookup-quiz-online.html',
            controller: 'WordLookupQuizOnlineCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/chat', {
            templateUrl: 'views/chat.html',
            controller: 'ChatCtrl',
            resolve: { user: mainApp.resolveUser }
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/logout', {
            templateUrl: 'views/logout.html',
            controller: 'LogoutCtrl'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
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