'use strict';

var system = angular.module('service.utility', []);

system.factory('utilityService', function($http, $location, $rootScope, $timeout) {
    return {
        convertToHighChartDatePair : function(dates){
            var result = [];
            for(var i = 0; i < dates.length; i++){
                var d = new Date(dates[i].date);
                var d_utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                result.push([d_utc, dates[i].duration])
            }

            return result;
        }
    }
});