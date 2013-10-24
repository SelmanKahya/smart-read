mainApp.controller('WordLookupCtrl', function ($scope, $http, $modal, $route, lookupService, imageSearchService, $timeout) {

    $scope.selectBook = function(book){
        $scope.selectedBook = book;
    }

    $scope.getSelectedBookWords = function(){
        if($scope.selectedBook){
            var result = [];
            for(var i = 0; i < $scope.words.length; i++){
                if($scope.selectedBook.book_name == $scope.words[i].book_name){
                    result.push($scope.words[i])
                }
            }
            return result;
        }
        else
            return $scope.words;
    }

    $http({method: 'GET', url: 'http://localhost:3000/user/1/word-lookup'}).success(function(response, status, headers, config) {
        $scope.words = response.result;
    });

    $http({method: 'GET', url: 'http://localhost:3000/user/1/word-lookup/books'}).success(function(response, status, headers, config) {
        $scope.books = response.result;
    });

    $scope.quizWords = function() {

        var notTakenQuiz = [];
        var words = $scope.getSelectedBookWords();

        angular.forEach(words, function(word){
            if(!word.word_lookup_quiz_taken)
                this.push(word);
        }, notTakenQuiz);

        return notTakenQuiz;
    };

    $scope.startQuiz = function(words) {

        var modalInstance = $modal.open({
            templateUrl: './views/partial/quiz.html',
            controller: ModalInstanceCtrl,
            resolve: {
                words: function () {
                    return words;
                }
            }
        });

        modalInstance.result.then(function () {
            $route.reload();
        });
    };

    var ModalInstanceCtrl = function ($scope, $modalInstance, words) {

        // init variables
        $scope.wordCursor = 0;
        $scope.words = words;
        $scope.word = $scope.words[0];
        $scope.showingResult = false;

        $scope.hint = {
            showing: false,
            loading: false,
            images: []
        };

        // show meaning
        $scope.showMeaning = function(word){
            $scope.showingResult = true;
            lookupService.wordLookup(word.word_lookup_word, function(result){
                $scope.word.lookupResult = result;
                if(result.sound){
                    $scope.word.lookupResult.listen = function(){
                        angular.element('#lookup-listen-audio').get(0).play();
                    }
                }
            });

            // hide the hint
            $scope.hint.showing = false;
        }

        $scope.giveHint = function(word){
            $scope.hint.showing = true;
            $scope.hint.loading = true;

            imageSearchService.search(word.word_lookup_word, function(result){
                $timeout(function() {
                    $scope.hint.loading = false;
                    $scope.hint.images = result;
                });
            });
        }

        // user clicks on correct or wrong
        $scope.answerQuestion = function(word, answer){

            word.word_lookup_quiz_taken = 1;
            word.word_lookup_quiz_result = answer ? 1 : 0;

            $http({
                url: "http://localhost:3000/word-lookup/" + word.word_lookup_id,
                method: "POST",
                data: word
            }).success(function(data, status, headers, config) {

                    console.log(data);

                    // reset hint
                    $scope.hint = {
                        showing: false,
                        loading: false,
                        images: []
                    };

                    // remove the answer for previous word
                    $scope.word.answer = '';

                    // show the next word
                    $scope.wordCursor++;
                    $scope.word = $scope.words[$scope.wordCursor];

                    // hide previous word's result screen
                    $scope.showingResult = false;

                    // if answered all the questions, finish the quiz
                    if($scope.words.length == $scope.wordCursor)
                        $scope.finished = true;

            });
        }

        $scope.finish = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    };


});
