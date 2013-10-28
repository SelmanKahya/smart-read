var mainApp = angular.module('mainApp', ['ui.bootstrap']);

mainApp.config(function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .when('/word-lookup', {
            templateUrl: 'views/word-lookup.html',
            controller: 'WordLookupCtrl'
        })
        .when('/activity', {
            templateUrl: 'views/activity.html',
            controller: 'ActivityCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

mainApp.filter('oneZeroToYesNo', function() {
    return function(input) {
        return input == 1 ? 'Yes' : 'No';
    };
});