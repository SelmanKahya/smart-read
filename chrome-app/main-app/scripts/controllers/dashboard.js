mainApp.controller('DashboardCtrl', function ($scope, $http, user) {

    $http({method: 'GET', url: 'http://localhost:3000/user/' + user.user_id + '/activity'}).success(function(response, status, headers, config) {
        $scope.activities = response.result;
    });

});
