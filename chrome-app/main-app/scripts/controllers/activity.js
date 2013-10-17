mainApp.controller('ActivityCtrl', function ($scope, $http, sampleFactory) {

    $http({method: 'GET', url: 'http://localhost:3000/activity'}).success(function(data, status, headers, config) {
        $scope.activities = data;
    });

});
