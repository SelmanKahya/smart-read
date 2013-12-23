mainApp.controller('WordLookupQuizOnlineCtrl', function ($scope, $route, $rootScope, $http, $modal, $route, $location, lookupService, imageSearchService, $timeout, user) {

    $scope.status = '';

    var sock = new SockJS('http://localhost:3000/chat');

    $scope.history = '';

    $scope.messages = [];

    $scope.sendMessage = function() {
        // sock.send(JSON.stringify({type: 'message', action: 'new-user', user: user}));
        sock.send(JSON.stringify({type: 'message', action: 'send', data: $scope.messageText, user: user}));
        $scope.messageText = "";
    };

    $scope.quit = function() {
        sock.close();
        $route.reload();
    };

    sock.onmessage = function(e) {

        if(e.data == "You can chat with your opponent here."){


            $scope.status = "starting";

            $timeout(function(){

                $scope.status = "started";

            }, 5000);

            $scope.history = e.data + '\n';
        }

        else if(e.data == "disconnected"){
            $scope.status = "disconnected";
        }

        else if(e.data == "lost"){
            $scope.status = "lost";
        }

        else {
            // $scope.messages.push(e.data);
            $scope.history += e.data + '\n';
        }

        $scope.$apply();
    };

    $scope.findOpponent = function(){

        $scope.status = 'find-opponent';

        sock.send(JSON.stringify({type: 'game', action: 'find-opponent', user: user}));

    }

    $scope.start = function(){

        sock.send(JSON.stringify({type: 'game', action: 'start', user: user}));

    }


    $scope.showResult = function(){

        $scope.status = 'result';

        // check if the answer is correct
        if($scope.guess == 'system') {
            sock.send(JSON.stringify({type: 'game', action: 'won', user: user}));
            $scope.result = true;
        }

        else
            $scope.result = false;

    }



});