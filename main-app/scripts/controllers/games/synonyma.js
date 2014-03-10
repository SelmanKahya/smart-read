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
    $scope.questions = {};
    $scope.questions = [];

    $scope.start = function(){
        $scope.status = $scope.flags.STATUSES.LOADING;

        synonymaService.getQuestions('easy', 25, function(response){
            if(response.status){
                $scope.question_index = 0;
                $scope.questions = response.result;
                $scope.question = $scope.questions[$scope.question_index];
                $scope.status = $scope.flags.STATUSES.PLAYING;
                $scope.step = $scope.flags.STEPS.QUESTION;
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

        $scope.step = $scope.flags.STEPS.RESULT;

        if(answer == choice)
            $scope.question.result = true;

        else
            $scope.question.result = false;

        $scope.question.user_choice = choice;
    }

    $scope.nextQuestion = function(){
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
});