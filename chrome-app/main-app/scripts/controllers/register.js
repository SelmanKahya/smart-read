mainApp.controller('RegisterCtrl', function ($scope, $http, $location, $timeout) {

    $scope.register = function(){

        if($scope.signupForm.$invalid)
            return;

        $http.post('http://localhost:3000/user/register', $scope.user).success(function(response, status, headers, config) {
            $scope.processing = true;
            $scope.error = null;

            if(response.status){
                var user = response.result;
                chrome.storage.local.set({'user': user}, function(){
                    $timeout(function(){
                        $location.path('/');
                    });
                });
            }

            else {
                $scope.error = response.error;
                $scope.processing = false;
            }
        });
    }
});
