var mainApp = angular.module('mainApp', ['ui.bootstrap']);

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
            controller: 'LoginCtrl'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

mainApp.resolveUser = function($q, $route, $rootScope, $location, $timeout){
    var defer = $q.defer();
    chrome.storage.local.get('user', function (result) {
        $timeout(function(){
            // if not, redirect him to login page
            if(result.user == null){
                $timeout(function(){
                    $location.path('/login');
                });
                defer.reject();
                return;
            }

            $rootScope.user = result.user;
            defer.resolve(result.user);
        });
    });
    return defer.promise;
}

mainApp.filter('oneZeroToYesNo', function() {
    return function(input) {
        return input == 1 ? 'Yes' : 'No';
    };
});