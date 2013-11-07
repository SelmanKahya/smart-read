mainApp.controller('LoginCtrl', function ($scope, $http, $timeout, $location) {

    chrome.storage.local.set({'user': null});

    $scope.login = function(){

        if($scope.loginForm.$invalid)
            return;

        $scope.error = null;
        $scope.processing = true;

        $http.post('http://localhost:3000/user/login', $scope.user).success(function(response, status, headers, config) {
            if(response.status){
                var user = response.result;
                chrome.storage.local.set({'user': user}, function(){
                    $timeout(function(){
                        $location.path('/');
                    });
                });
            }
        }).error(function(response, status, headers, config){
                $scope.user = null;
                $scope.error = response.error;
                $scope.processing = false;
        });
    }
});
