mainApp.controller('RegisterCtrl', function ($scope, $http, $location, $timeout, member, session) {

    // register button click event
    $scope.register = function(){

        if($scope.signupForm.$invalid)
            return;

        // make request
        member.register($scope.user, function(result, response){

            if(result){
                $scope.processing = true;
                $scope.error = null;

                if(response.status){
                    var user = response.result;

                    // registration successful, now start session
                    session.start(user, function(){
                        $location.path('/');
                    })
                }

                else {
                    $scope.error = response.error;
                    $scope.processing = false;
                }
            }

            // request status is 200, but response.result is not OK (shouldn't happen)
            else {
                alert('Error while registering the user. Please contact system administrator.');
            }
        });
    }
});
