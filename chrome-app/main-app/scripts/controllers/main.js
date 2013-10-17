// home page for app
mainApp.controller('MainCtrl', function ($scope, $http, sampleFactory) {
    $scope.test = 'Hello world!';
    $scope.factory = sampleFactory;
});