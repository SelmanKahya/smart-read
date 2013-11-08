// header controller
mainApp.controller('HeaderCtrl', function ($rootScope, $scope, $location, $window) {
    $scope.$location = $location;

    $rootScope.$watch('user', function(newVal, oldVal){
        $scope.user = $rootScope.user;
    });

    $scope.startReading = function(){
        $window.location.href = '../views/library.html';
    }

    $scope.logout = function (){
        chrome.storage.local.set({'user': null});
        $location.path('/login');
        $rootScope.user = null;
    }
});