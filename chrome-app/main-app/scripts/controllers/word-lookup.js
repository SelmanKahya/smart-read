mainApp.controller('WordLookupCtrl', function ($scope, $rootScope, $location, $http, user, userService) {

    // get books that user read
    userService.books(user.user_id, function(result){
        $scope.books = result;
    });

    // get user word-lookups
    userService.wordLookups(user.user_id, function(result){
        $scope.words = result;
    });

	// change active book in the scope
    $scope.selectBook = function(book){
        $scope.selectedBook = book;
    }

	// return lookup-words from the selected book
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

    // start taking the quiz
    $scope.startWordLookupQuiz = function() {
        $rootScope.words = $scope.getSelectedBookWords();
        $location.path('/word-lookup-quiz');
    };
});
