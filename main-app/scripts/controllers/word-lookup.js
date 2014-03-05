mainApp.controller('WordLookupCtrl', function ($scope, $rootScope, $location, $http, utilityService, user, userService, wordLookupService) {

    // get books that user read
    userService.books(function(result){
        $scope.books = result;
    });

    // get user word-lookups
    userService.wordLookups(function(result){
        $scope.words = result;
    });

    // change active book in the scope
    $scope.selectBook = function(book){
        $scope.selectedBook = book;
    }


    // delete particular word lookup data
    $scope.deleteWord = function(word){
        var header = "Delete Word Look-up";
        var message = "After deleting this word look-up data, we won't be able to use it while analyzing your reading activity. Are you sure you want to do this?";
        utilityService.yesNoModal(header, message, function(result) {
            if(result){
                wordLookupService.delete(word.word_lookup_id, function(result){
                    if(result.status){
                        var i = $scope.words.indexOf(word);
                        if(i != -1) {
                            $scope.words.splice(i, 1);
                        }
                    }
                });
            }
        });
    }

    // return lookup-words from the selected book
    $scope.getSelectedBookWords = function(){
        if($scope.selectedBook){
            return JSPath.apply('.{.book_name === $book_name}', $scope.words, {book_name: $scope.selectedBook.book_name});
        }
        else
            return $scope.words;
    }

    // start taking the quiz
    $scope.startWordLookupQuiz = function() {
        var words = $scope.getSelectedBookWords();

        if(words.length > 0){
            $rootScope.words = words;
            $location.path('/games/word-lookup-quiz');
        }
    };
});
