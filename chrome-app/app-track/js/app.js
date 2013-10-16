var trackApp = angular.module('trackApp', []);

/*
 ===========================================
                CONTROLLERS
 ===========================================
 */

// home page for app
trackApp.controller('MainCtrl', function ($scope, $http, sampleFactory) {
    $scope.test = 'Hello world!';
    $scope.factory = sampleFactory;
});

// header controller
trackApp.controller('HeaderCtrl', function ($scope, $location) {
    $scope.$location = $location;
});

/*
 ===========================================
                SERVICES
 ===========================================
 */

trackApp.factory('sampleFactory', function() {
    return 'test';
});


/*
 ===========================================
                ROUTES
 ===========================================
 */

trackApp.config(function ($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .when('/activity', {
            templateUrl: 'views/activity.html',
            controller: 'MainCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

/*
 ===========================================
                EVEMTS
 ===========================================
 */

// Init setup and attach event listeners.
document.addEventListener('DOMContentLoaded', function(e) {
    var closeButton = document.querySelector('#close-button');
    closeButton.addEventListener('click', function(e) {
        window.close();
    });
});
