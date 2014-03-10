mainApp.controller('WordLookupCtrl', function ($scope, $rootScope, $location, $http, utilityService, user, userService, wordLookupService) {

    $scope.filter = {
        book: {},
        time: 0
    }

    $scope.filterBookChanged = function() {
        $scope.selectBook($scope.filter.book);
    }

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

        var words = [];

        // first apply the book filter
        if($scope.selectedBook){
            words = JSPath.apply('.{.book_name === $book_name}', $scope.words, {book_name: $scope.selectedBook.book_name});
        }
        else
            words = $scope.words;

        // now apply the time filter
        if($scope.filter.time != 0){
            var filter_date = new Date();
            filter_date.setDate(filter_date.getDate()-$scope.filter.time);
            var filtered_array = []

            for(var i = 0; i < words.length; i++){
                if(new Date(words[i].word_lookup_created_time) > filter_date)
                    filtered_array.push(words[i])
            }

            words = filtered_array;
        }

        return words;
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
