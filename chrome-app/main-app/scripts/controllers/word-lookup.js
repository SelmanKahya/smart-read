mainApp.controller('WordLookupCtrl', function ($scope, $rootScope, $location, $http, user, userService) {

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

    // return lookup-words from the selected book
    $scope.getSelectedBookWords = function(){
        if($scope.selectedBook){
            return JSPath.apply('.{.book_name === $book_name}', $scope.words, {book_name: $scope.selectedBook.book_name});
        }
        else
            return $scope.words;
    }

    // return no quiz taken words from the selected book
    $scope.getNotQuizTakenWords = function(){
        return JSPath.apply('.{.word_lookup_quiz_result != 1}', $scope.getSelectedBookWords());
    }

    // start taking the quiz
    $scope.startWordLookupQuiz = function() {
        $rootScope.words = $scope.getNotQuizTakenWords();
        $location.path('/word-lookup-quiz');
    };
});
