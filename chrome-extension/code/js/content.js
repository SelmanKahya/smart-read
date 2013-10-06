requirejs.config(requirejsConfig);

requirejs(['jquery', 'config', 'util/messaging', 'util/messagingClient'], function(   $,        config,   messaging,        client) {

    // uncomment the following line if content should be handling some requests
    // sent from background (when appropriate handler is implemented in
    // contentHandlers.js
    // messaging.contentInitialize();

    $(function() {

        client.sendBroadcast({ cmd: 'GetExtensionStatus' }, function(result) {

            // double click event
            var doubleClicked = function(){
                var keyword = window.getSelection().toString();
                $.ajax({
                    type: "PUT",
                    url: "http://localhost:3000/activity",
                    data: {type: 'dblclick', content: keyword}
                }).done(function(result) {});
            }

            // IF extension is started, attach all the events
            if(result.status){
                document.body.addEventListener('dblclick', doubleClicked);
            }
        });
    });
});