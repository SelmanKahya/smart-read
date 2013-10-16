var trackApp = angular.module('trackApp', []);

/*
 ===========================================
                CONTROLLERS
 ===========================================
 */
// Main Angular controller for app.
function mainController($scope, $http, sampleFactory) {
    $scope.test = 'Hello world!';
    $scope.factory = sampleFactory;
}

mainController.$inject = ['$scope', '$http', 'sampleFactory'];


/*
 ===========================================
                SERVICES
 ===========================================
 */

trackApp.factory('sampleFactory', function() {
    return 'test';
});


/*
 ===========================================
                EVEMTS
 ===========================================
 */

// Init setup and attach event listeners.
document.addEventListener('DOMContentLoaded', function(e) {
    var closeButton = document.querySelector('#close-button');
    closeButton.addEventListener('click', function(e) {
        window.close();
    });
});
