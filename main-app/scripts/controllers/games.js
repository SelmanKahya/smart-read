mainApp.controller('GamesCtrl', function ($scope, statsService) {

    $scope.stats = {
        synonyma: '',
        word_quiz: ''
    }

    statsService.getPlayed('synonyma', function(response){
        if(response.status)
            $scope.stats.synonyma = response.result[0].stats_value;
    });

    statsService.getPlayed('word_quiz', function(response){
        if(response.status)
            $scope.stats.word_quiz = response.result[0].stats_value;
    });

});