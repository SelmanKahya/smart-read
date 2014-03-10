mainApp.controller('WordLookupQuizCtrl', function ($scope, $rootScope, $http, $modal, $route,
                                                   $location, dictionaryService, imageSearchService, $timeout, wordLookupService,
                                                   user, userService, $sce, utilityService, statsService) {

    // status flags, handling front-end components
    $scope.flags = {
        STATUSES:{
            ONGOING:    0,
            FINISHED:   1,
            NOTSTARTED: 2
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
        words: [],
        hint: {
            status: $scope.flags.HINT.INACTIVE,
            images: []
        },
        answer: {
            guess: '',
            result: false
        }
    };

    $scope.quiz.status = $scope.flags.STATUSES.NOTSTARTED;

    $scope.init = function(){

        // init variables
        var words = $rootScope.words;
        $rootScope.words = null;

        // if doesn't have the words in rootScope, then get all word-lookups from the server
        if(!words){
            // get user word-lookups
            userService.wordLookups(function(result){
                if(result.length == 0){
                    $location.path('/word-lookup')
                }

                else {
                    var shuffledWords = utilityService.shuffle(result);
                    $scope.quiz.word = shuffledWords[0];
                    $scope.quiz.words = shuffledWords;
                    $scope.startGame();
                }
            });
        }

        else {
            var shuffledWords = utilityService.shuffle(words);
            $scope.quiz.word = shuffledWords[0];
            $scope.quiz.words = shuffledWords;
            $scope.startGame();
        }
    }

    $scope.startGame = function(){

        $scope.quiz.status = $scope.flags.STATUSES.ONGOING;

        if($scope.quiz.words.length == 0)
            $location.path('/word-lookup');

        $scope.getDefinition();

        // increment game played stat
        statsService.played('word_quiz', function(response){});
    }

    $scope.getSafeUrl = function (url){
        return $sce.trustAsResourceUrl(url);
    }

    $scope.getDefinition = function(){
        var word = $scope.quiz.word.word_lookup_word;
        dictionaryService.definition(word, function(result){
            if(result.status){

                var response;

                try {
                    response = eval(result.result);
                } catch(e) {}

                $scope.quiz.word.lookupResult = response;
            }
        })
    }

    // show meaning
    $scope.showResult = function(){

        // check if the answer is correct
        if($scope.quiz.word.word_lookup_word.toLowerCase() == $scope.quiz.answer.guess.toLowerCase())
            $scope.quiz.answer.result = true;
        else
            $scope.quiz.answer.result = false;

        // save word guess result
        $scope.quiz.word.word_lookup_quiz_taken = 1;
        $scope.quiz.word.word_lookup_quiz_result = $scope.quiz.answer.result ? 1 : 0;
        wordLookupService.save($scope.quiz.word, function(result) {});

        // go to result step
        $scope.changeStep($scope.flags.STEPS.RESULT);
    }

    $scope.giveHint = function(){
        $scope.quiz.hint.status = $scope.flags.HINT.LOADING;
        imageSearchService.search($scope.quiz.word.word_lookup_word, function(result){
            $timeout(function() {
                $scope.quiz.hint.status = $scope.flags.HINT.SHOWING;
                $scope.quiz.hint.images = result;
            });
        });
    }

    // user clicks on correct or wrong
    $scope.nextQuestion = function(){

        // reset hint
        $scope.quiz.hint.images = [];
        $scope.quiz.hint.status = $scope.flags.HINT.INACTIVE;

        // remove the answer for previous word
        $scope.quiz.answer.guess = '';

        // hide previous word's result screen
        $scope.changeStep($scope.flags.STEPS.QUESTION);

        // show the next word
        $scope.quiz.wordCursor++;

        // if answered all the questions, finish the quiz
        if($scope.quiz.words.length == $scope.quiz.wordCursor)
            $scope.changeStatus($scope.flags.STATUSES.FINISHED);

        // otherwise time to ask next word
        else {
            $scope.quiz.word = $scope.quiz.words[$scope.quiz.wordCursor];
            $scope.getDefinition();
        }
    }

    $scope.changeStep = function (step) {
        $scope.quiz.step = step;
    };

    $scope.changeStatus = function (status) {
        $scope.quiz.status = status;
    };

    // time to take a quiz,
    // send words that user will be take quiz on
    $scope.quizWords = function() {
        var notTakenQuiz = [];
        var words = $scope.getSelectedBookWords();
        angular.forEach(words, function(word){
            if(!word.word_lookup_quiz_taken)
                this.push(word);
        }, notTakenQuiz);
        return notTakenQuiz;
    };

    $scope.finish = function () {
        $location.path('/word-lookup');
    };

    $scope.init();
});