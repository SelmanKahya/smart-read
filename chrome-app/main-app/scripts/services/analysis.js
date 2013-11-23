'use strict';

var analysis = angular.module('service.analysis', []);

analysis.factory('analysisService', function($http, $location, $rootScope, $timeout) {
    return {
        getStartedReadingActivities : function(activities){
            return JSPath.apply('.{.activity_type_id == 1}', activities);
        },

        getUniqueBookNames : function(activities){
            var readStartedActivities = this.getStartedReadingActivities(activities);
            var names = JSPath.apply('.book_name', readStartedActivities);
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
            var unique = names.filter( onlyUnique );
            return unique;
        },

        getBookStats : function(activities){

            var uniqueBookNames = this.getUniqueBookNames(activities);

            // if difference between two activity is more than 20 mins,
            // assume that user was away from keyboard and don't add up to total time spent
            var MAX_SECONDS_PER_PAGE = 1200;

            // statistics for each book will be stored here
            var bookStats = {}, readStats = [];

            // initialize book statistics for each book in activities list
            for(var i = 0; i < uniqueBookNames.length; i++){
                var bookName = uniqueBookNames[i];
                bookStats[bookName] = {bookName: bookName, lastActivity: '', totalTimeSpent: 0, readStats: []};
            }

            // iterate through activities and calculate total time spent
            for(var i = 0; i < activities.length; i++){

                var activity = activities[i];
                var bookStat = bookStats[activity.book_name];

                // mark the start time of reading particular book
                if(activity .activity_type_id == 1){
                    bookStat.lastActivity = new Date(activity.activity_created_time);
                }

                // page change, calculate difference between
                else if(activity .activity_type_id == 3){

                    // in case start reading activity wasn't captured when user started reading a book
                    if(bookStat.lastActivity == '')
                        bookStat.lastActivity = new Date(activity.activity_created_time);

                    var pageChangeTime = new Date(activity.activity_created_time);
                    var diff = Math.floor((pageChangeTime.getTime() - bookStat.lastActivity.getTime()) / 1000);

                    bookStat.readStats.push({duration: diff, date: new Date(activity.activity_created_time)});

                    if(diff > 0 && diff < MAX_SECONDS_PER_PAGE)
                        bookStat.totalTimeSpent += diff;

                    bookStat.lastActivity = pageChangeTime;
                }
            }

            // convert bookStats object to array
            var bookStatsArray = [];
            for (var key in bookStats) {
                if (bookStats.hasOwnProperty(key)) {
                    bookStatsArray.push(bookStats[key]);
                }
            }

            return bookStatsArray;
        },

        getReadingActivityByDates : function(stats){


            var generateDates = function(from, to){
                var generatedDates = [];
                var d = new Date(from);

                from.setHours(0);
                from.setMinutes(1);

                to.setHours(23);
                to.setMinutes(59);

                while(d < to){
                    generatedDates.push({duration: 0, date: new Date(d)});
                    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
                }

                return generatedDates;
            }

            var date_sort_asc = function (date1, date2) {
                // This is a comparison function that will result in dates being sorted in
                // ASCENDING order. As you can see, JavaScript's native comparison operators
                // can be used to compare dates. This was news to me.
                if (date1 > date2) return 1;
                if (date1 < date2) return -1;
                return 0;
            };

            var readingDates = JSPath.apply('.readStats{.date}.date', stats);
            readingDates = readingDates.sort(date_sort_asc);

            var to = new Date(readingDates[readingDates.length - 1]);
            var from = new Date(readingDates[0]);
            var generatedDates = generateDates(from, to);

            var readStats = JSPath.apply('.readStats{.date}', stats);

            for(var i = 0; i < generatedDates.length; i++){
                var generatedDate = generatedDates[i];

                for(var j = 0; j < readStats.length; j++){

                    var d = readStats[j].date;
                    if(d.sameDateAs(generatedDate.date)){
                        generatedDate.duration += readStats[j].duration;
                    }
                }
            }

            return generatedDates;
        }
    }
});