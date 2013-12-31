// header controller
mainApp.controller('HeaderCtrl', function ($rootScope, $scope, $location, $window, member, session) {

    // required to display current page in header menu (class="active")
    $scope.$location = $location;

    // watch user, if it changes, update user in this scope
    $rootScope.$watch('user', function(){
        $scope.user = $rootScope.user;
    });

    // start reading button click event
    $scope.startReading = function(){
        $window.location.href = '../views/library.html';
    }

    // logout button click event
    $scope.logout = function (){

        // delete session info, use member service
        session.end(function(){
            $location.path('/login');
        })
    }
});