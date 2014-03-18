mainApp.controller('SynonymaCtrl', function ($scope, synonymaService, statsService) {

    // status flags, handling front-end components
    $scope.flags = {
        STATUSES:{
            STARTING:   0,
            LOADING:    1,
            PLAYING:    2,
            FINISHED:   3,
            ERROR:      4
        },
        STEPS : {
            QUESTION:   0,
            RESULT:     1
        }
    };

    $scope.level = 1;
    $scope.status = $scope.flags.STATUSES.STARTING;
    $scope.questions = [];
    $scope.time_spent = {
        started: 0,
        stopped: 0
    }

    $scope.start = function(){
        $scope.status = $scope.flags.STATUSES.LOADING;

        synonymaService.getQuestions('easy', 25, function(response){
            if(response.status){
                $scope.question_index = 0;
                $scope.questions = response.result;
                $scope.question = $scope.questions[$scope.question_index];
                $scope.status = $scope.flags.STATUSES.PLAYING;
                $scope.step = $scope.flags.STEPS.QUESTION;
                $scope.startTimer();
            }

            else {
                $scope.error = response.error;
                $scope.status = $scope.flags.STATUSES.ERROR;
            }

            // increment game played stat
            statsService.played('synonyma', function(response){});
        })
    }

    $scope.answer = function(answer, choice){
        $scope.stopTimer();

        $scope.step = $scope.flags.STEPS.RESULT;

        if(answer == choice)
            $scope.question.result = true;

        else
            $scope.question.result = false;

        $scope.question.user_choice = choice;

        // notify server, tell response time for each word
        var time = $scope.getTimeSpent() / 1000;
        synonymaService.saveQuestion(answer, time, $scope.question.result, function(response){});
    }

    $scope.nextQuestion = function(){
        $scope.startTimer();
        $scope.question_index++;

        if($scope.question_index == $scope.questions.length)
            $scope.status = $scope.flags.STATUSES.FINISHED;

        else {
            $scope.question = $scope.questions[$scope.question_index];
            $scope.step = $scope.flags.STEPS.QUESTION;
        }
    }

    $scope.finish = function(){
        $scope.question_index++;
        $scope.status = $scope.flags.STATUSES.FINISHED;
    }

    $scope.startTimer = function(){
        $scope.time_spent.started = Date.now();
    }

    $scope.stopTimer = function(){
        $scope.time_spent.stopped = Date.now();
    }

    $scope.getTimeSpent = function(){
        return $scope.time_spent.stopped - $scope.time_spent.started;
    }
});