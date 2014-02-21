'use strict';

var system = angular.module('service.utility', []);

system.factory('utilityService', function($http, $location, $rootScope, $modal, $timeout) {
    return {
        convertToHighChartDatePair : function(dates){
            var result = [];
            for(var i = 0; i < dates.length; i++){
                var d = new Date(dates[i].date);
                var d_utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                result.push([d_utc, dates[i].duration])
            }

            return result;
        },

        // Shows yes no modal box
        yesNoModal : function(header, message, callback){
            var modalInstance = $modal.open({
                templateUrl: 'views/partial/modal.html',
                controller: function ($scope, $modalInstance, header, message) {
                    $scope.header = header;
                    $scope.message = message;
                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    header: function () { return header; },
                    message: function () { return message; }
                }
            });

            modalInstance.result.then(function () {
                callback(true);
            }, function () {
                callback(false);
            });
        },

        shuffle: function(array){
            var shuffle = [];

            // copy array
            angular.copy(array, shuffle);

            // shuffle elements
            var i = shuffle.length;
            while (--i) {
                var j = Math.floor(Math.random() * (i + 1))
                var temp = shuffle[i];
                shuffle[i] = shuffle[j];
                shuffle[j] = temp;
            }

            // return mixed array
            return shuffle;
        }
    }
});