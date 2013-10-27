// header controller
mainApp.controller('HeaderCtrl', function ($scope, $location, $window) {
    $scope.$location = $location;

    $scope.startReading = function(){
        $window.location.href = '../views/library.html';
    }
});