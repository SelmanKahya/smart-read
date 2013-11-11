mainApp.controller('DashboardCtrl', function ($scope, $http, user, userService) {

    // get user activity
    userService.activity(user.user_id, function(result){
        $scope.activities = result;
    })

});
