'use strict';

var options = angular.module('service.options', []);

options.factory('serverOptions', function($rootScope) {
    return {
        getUrl : function(){
            if(!$rootScope.server)
                alert('Error while getting server options, please restart the application');
            else
                return $rootScope.server.url;

        }
    }
});