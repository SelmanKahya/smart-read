mainApp.controller('DashboardCtrl', function ($scope, $http) {

    $http({method: 'GET', url: 'http://localhost:3000/user/1/activity'}).success(function(response, status, headers, config) {
        $scope.activities = response.result;
    });

});
