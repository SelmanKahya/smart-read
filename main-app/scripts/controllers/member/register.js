mainApp.controller('RegisterCtrl', function ($scope, $http, $location, $timeout, member, session) {

    // register button click event
    $scope.register = function(){

        if($scope.signupForm.$invalid)
            return;

        $scope.processing = true;

        // make request
        member.register($scope.user, function(result, response){

            $scope.processing = false;

            if(result){

                $scope.error = null;

                if(response.status)
                    $scope.successful = true;

                else
                    $scope.error = response.error;
            }

            // request status is 200, but response.result is not OK (shouldn't happen)
            else {
                alert('Error while registering the user. Please contact system administrator.');
            }
        });
    }
});
