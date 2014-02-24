mainApp.controller('ErrorCtrl', function ($scope, $routeParams, $rootScope) {

    $scope.type = $routeParams.type;

    if(!$rootScope.ErrorMailSent){
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
                    'html': 'Server is down, please check it. Date: ' + new Date() + ' --- Type: ' + $scope.type
                }
            }
        }).done(function(response) {
                $rootScope.ErrorMailSent = true;
            });
    }
});