mainApp.controller('WordLookupQuizCtrl', function ($scope, $rootScope, $http, $modal, $route,
                                                   $location, lookupService, imageSearchService, $timeout, wordLookupService,
                                                   user, userService) {

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

    // init variables
    var words = $rootScope.words;
    $rootScope.words = null;

    // if doesn't have the words in rootScope, then get all word-lookups from the server
    if(!words){
        // get user word-lookups
        userService.wordLookups(function(result){
            $scope.quiz.word = result[0];
            $scope.quiz.words = result;
        });
    }

    else {
        $scope.quiz.word = words[0];
        $scope.quiz.words = words;
    }

    $scope.getDefinition = function(){
        lookupService.wordLookup($scope.quiz.word.word_lookup_word, function(result){
            $scope.quiz.word.lookupResult = result;
            $scope.quiz.word.lookupResult.listen = function(){
                if($scope.quiz.word.lookupResult.sound){
                angular.element('#lookup-listen-audio').get(0).load();
                angular.element('#lookup-listen-audio').get(0).play();
                }
            }
        });
    }

    $scope.getDefinition();

    // show meaning
    $scope.showResult = function(){

        // play the pronunciation
        $scope.quiz.word.lookupResult.listen();

        // check if the answer is correct
        if($scope.quiz.word.word_lookup_word == $scope.quiz.answer.guess)
            $scope.quiz.answer.result = true;
        else
            $scope.quiz.answer.result = false;

        // save word guess result
        $scope.quiz.word.word_lookup_quiz_taken = 1;
        $scope.quiz.word.word_lookup_quiz_result = $scope.quiz.answer.result ? 1 : 0;
        wordLookupService.save($scope.quiz.word, function(result) {});

        // reset hint
        $scope.quiz.hint.images = [];
        $scope.quiz.hint.status = $scope.flags.HINT.INACTIVE;

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
    $scope.nextQuestion = function(answer){
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
});