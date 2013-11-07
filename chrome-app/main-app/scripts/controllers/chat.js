
mainApp.controller('ChatCtrl', function ($rootScope, $scope, $location, $window, $timeout, user) {

    var sock = new SockJS('http://localhost:3000/chat');

    $timeout(function(){
        sock.send(JSON.stringify({type: 'newUser', data: user}));
    }, 1000);


    $scope.history = '';

    $scope.messages = [];

    $scope.sendMessage = function() {
        sock.send(JSON.stringify({type: 'sendingMessage', data: $scope.messageText}));
        $scope.messageText = "";
    };

    $scope.quit = function() {
        sock.close();
    };

    sock.onmessage = function(e) {
        // $scope.messages.push(e.data);
        $scope.history += e.data + '\n';
        $scope.$apply();
    };
});
