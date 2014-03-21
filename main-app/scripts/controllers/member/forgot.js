mainApp.controller('ForgotCtrl', function ($scope, $http, $timeout, $location, member, session) {

    // first logout the current user even if user already logged in
    session.end(function(){});

    // initially no errors, status is processing
    $scope.send_error = "";
    $scope.processing = false;

    // send button click event
    $scope.send = function(){

        if($scope.sendForm.$invalid)
            return;

        $scope.processing = true;
        $scope.send_error = null;

        member.forgot($scope.email, function(result, response){

            $scope.processing = false;

            if(response.status)
                $scope.successful = true;

            else {
                $scope.email = "";
                $scope.send_error = response.error;
            }
        });
    }
});
