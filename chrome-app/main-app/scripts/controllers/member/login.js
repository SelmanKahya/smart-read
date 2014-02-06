mainApp.controller('LoginCtrl', function ($scope, $http, $timeout, $location, member, session) {

    // first logout the current user even if user already logged in
    session.end(function(){});

    // login button click event
    $scope.login = function(){

        if($scope.loginForm.$invalid)
            return;

        // after clicking on login button,
        // initially no errors, status is processing
        $scope.error = null;
        $scope.processing = true;

        member.login($scope.user, function(result, response){

            // request successful (status 200)
            if(result){

                // everything is fine
                if(response.status){
                    var user = response.result;

                    // credentials are correct, login successful, now start session
                    session.start(user, function(){
                        $location.path('/');
                    })
                }

                // request status is 200, but response.result is not OK (shouldn't happen)
                else {
                    alert('Error while logging in. Please contact system administrator.');
                }
            }

            // request failed (status not 200), most probably auth error
            else {
                $scope.user = null;
                $scope.error = "Wrong credentials. Please check your username and password!";
                $scope.processing = false;
            }
        });
    }
});
