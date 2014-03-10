mainApp.controller('ErrorCtrl', function ($scope, $routeParams, $rootScope, user) {

    $scope.type = $routeParams.type;

    var response = mainApp.INTERCEPTOR_ERROR;

    mainApp.INTERCEPTOR_ERROR = null;

    if(response){
        $.ajax({
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'SgSC6oJUZC7IWcWGh7_0Ww',
                'message': {
                    'from_email': 'smartreadproject@gmail.com',
                    'to': [
                        {
                            'email': 'selmanhalid@gmail.com',
                            'name': 'Selman Kahya',
                            'type': 'to'
                        }
                    ],
                    'autotext': 'true',
                    'subject': 'Smart-Read | Server is Down!!',
                    'html': '<p>Server is down, please check it. Date: ' + new Date() + '<br/><br/> --- Type: ' + $scope.type + '</p>' +
                        '<p>Request method: ' + response.config.method + ' </p>' +
                        '<p>Request status: ' + response.status + ' </p>' +
                        '<p>Requested url: ' + response.config.url + ' </p>' +
                        '<p>User id: ' + user.user_id + ' </p>'
                }
            }
        });
    }
});