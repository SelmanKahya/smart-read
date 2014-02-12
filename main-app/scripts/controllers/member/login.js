mainApp.controller('LoginCtrl', function ($scope, $http, $timeout, $location, member, session) {

    // first logout the current user even if user already logged in
    session.end(function(){});

    // initially no errors, status is processing
    $scope.login_error = "";
    $scope.processing = false;

    // login button click event
    $scope.login = function(){

        if($scope.loginForm.$invalid)
            return;

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
                if(response){
                    $scope.user = null;
                    $scope.login_error = "Wrong credentials. Please check your username and password!";
                    $scope.processing = false;
                }

                else {
                    $scope.user = null;
                    $scope.login_error = "Server is not available, please try again later.";
                    $scope.processing = false;
                }
            }
        });
    }
});
