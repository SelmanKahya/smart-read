// header controller
mainApp.controller('HeaderCtrl', function ($rootScope, $scope, $location, $window) {
    $scope.$location = $location;
    $scope.user = $rootScope.user;
    $scope.startReading = function(){
        $window.location.href = '../views/library.html';
    }
});