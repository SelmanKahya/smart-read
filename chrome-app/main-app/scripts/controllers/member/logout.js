mainApp.controller('LogoutCtrl', function ($scope, $http, $timeout, $location, member, session) {
    // first logout the current user even if he already logged in
    session.end(function(){
        $location.path('/login');
    });
});
