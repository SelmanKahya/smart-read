requirejs.config(requirejsConfig);

requirejs(['jquery', 'util/messagingClient', 'config'], function($, client, config) {

    // shows start - stop button based on extension's current tracking status
    var hideStatusButtons = function(status){
        if(status){
            $("#status-start").hide();
            $("#status-stop").show();
        }
        else{
            $("#status-start").show();
            $("#status-stop").hide();
        }
    }

    var popupData = {
        appName: config.popup.appName,
        activityLink: config.popup.seeActivityLink
    };

    client.sendBroadcast({
        cmd: 'GetHtml',
        args: {
            template: 'popup',
            data: popupData
        }
    }, function(result) {
        if (result) {

            $(result).appendTo('body');

            var toggleStatus = function(){
                client.sendBroadcast({ cmd: 'ToggleExtensionStatus' }, function() {
                    client.sendBroadcast({ cmd: 'GetExtensionStatus' }, function(result) {
                        // toggle start stop button
                        hideStatusButtons(result.status);
                        // reload current page, so that extension can start tracking
                        chrome.tabs.reload(function(){});
                    });
                });
            }

            // attach events to start - stop tracking buttons
            client.sendBroadcast({ cmd: 'GetExtensionStatus' }, function(result) {
                $("#status-start").on( "click", toggleStatus);
                $("#status-stop").on( "click", toggleStatus);
                hideStatusButtons(result.status);
            });
        }
    });
});
