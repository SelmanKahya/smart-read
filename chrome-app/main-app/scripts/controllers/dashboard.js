mainApp.controller('DashboardCtrl', function ($scope, $http, $timeout, user, userService, analysisService, utilityService) {

    $scope.chartConfig = {};

    $scope.chartConfig.timeSpentByDates = {
        options:{
            chart: {
                type: 'spline'
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                month: '%e. %b',
                year: '%b'
            }
        },
        yAxis: {
            title: {
                text: 'Time Spent (mins)'
            },
            labels: {
                formatter: function() {
                    return Math.floor(this.value / 60) +'';
                }
            },
            min: 0
        },
        tooltip: {
            formatter: function() {
                return 'Time spent on ' + Highcharts.dateFormat('%e. %b', this.x) +': <b>'+ Math.round( (this.y/60)) +' mins</b>';
            }
        },
        series: [{
            name: 'Total time spent on each day',
            data: []
        }]
    };

    $scope.chartConfig.timeSpentByBooks = {
        options:{
            chart: {
                type: 'column'
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: [],
            labels: {
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Time Spent (minutes)'
            },
            labels: {
                formatter: function() {
                    return Math.floor(this.value / 60) +'';
                }
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {

            formatter: function() {
                return this.x + '<br/>Total time spent: <b>'+ Math.round( (this.y/60)) +' mins</b>';
            }
        },
        series: [{
            name: 'Time Spent',
            data: []
        }]
    };


    $scope.chartConfig.mostPopularCategories = {
        options:{
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            }
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
        series: [{
            type: 'pie',
            name: '',
            data: [
                ['Fiction ',   35.3],
                ['Nonfiction',       15.7],
                ['Literature',    25.2],
                ['Children',     13],
                ['Others',   10.8]
            ]
        }]
    }

    // get user activity
    userService.activity(user.user_id, function(result){

        $scope.activities = result;

        var activities = result;
        var stats =  analysisService.getBookStats(activities);
        var readingActivity =  analysisService.getReadingActivityByDates(stats);

        // init Total Time Spent By Dates
        $scope.chartConfig.timeSpentByDates.series[0].data = utilityService.convertToHighChartDatePair(readingActivity);

        // init Total Time Spent By Books chart
        $scope.chartConfig.timeSpentByBooks.xAxis.categories = JSPath.apply('.bookName', stats);
        $scope.chartConfig.timeSpentByBooks.series[0].data = JSPath.apply('.totalTimeSpent', stats);
    })
});
