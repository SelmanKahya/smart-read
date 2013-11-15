mainApp.controller('WordLookupQuizOnlineCtrl', function ($scope, $rootScope, $http, $modal, $route, $location, lookupService, imageSearchService, $timeout, user) {

    // status results, handling front-end components
    $scope.flags = {
        STATUSES:{
            ONGOING:    0,
            FINISHED:   1
        },
        STEPS : {
            QUESTION:   0,
            RESULT:     1
        },
        HINT : {
            INACTIVE:   0,
            SHOWING:    1,
            LOADING:    2
        }
    };

    $scope.quiz = {
        step: 0,
        status: 0,
        wordCursor: 0,
        word: {},
        hint: {
            status: $scope.flags.HINT.INACTIVE,
            images: []
        },
        answer: {
            guess: '',
            result: false
        }
    };


    /*
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
*/

    try{

        var socket;
        var host = "ws://localhost:3000/chat";
        var socket = new WebSocket(host);

        message('<p class="event">Socket Status: '+socket.readyState);

        socket.onopen = function(){
            message('<p class="event">Socket Status: '+socket.readyState+' (open)');
        }

        socket.onmessage = function(msg){
            message('<p class="message">Received: '+msg.data);
        }

        socket.onclose = function(){
            message('<p class="event">Socket Status: '+socket.readyState+' (Closed)');
        }

    } catch(exception){
        message('<p>Error'+exception);
    }

    function message(msg){
        $scope.history += msg + '\n';

    }
});