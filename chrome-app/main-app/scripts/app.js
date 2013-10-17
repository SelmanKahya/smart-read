var mainApp = angular.module('mainApp', []);

/*
 ===========================================
                ROUTES
 ===========================================
 */

mainApp.config(function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .when('/activity', {
            templateUrl: 'views/activity.html',
            controller: 'ActivityCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});



/*
 ===========================================
                SERVICES
 ===========================================
 */

mainApp.factory('sampleFactory', function() {
    return 'test';
});
