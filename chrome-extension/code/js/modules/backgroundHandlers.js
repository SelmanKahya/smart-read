define(['util/template', 'status'], function(template, status) {

    // Handler prototype:
    // function handle<REQUEST.CMD>(args, sender, sendResponse)
    //
    // See util/messaging.js for more details.
    //

    return {

        handleGetHtml: function(args, sender, sendResponse) {
            sendResponse(template.compileFromFile(args.template, args.data));
        },

        handleGetExtensionStatus: function(args, sender, sendResponse) {
            sendResponse({status: status.getStatus()});
        },

        handleToggleExtensionStatus: function(args, sender, sendResponse) {
            sendResponse({toggleFunc: status.toggle()});
        },

        handleSetExtensionUsername: function(args, sender, sendResponse) {
            sendResponse({username: status.setUsername(args.username)});
        },

        handleGetExtensionUsername: function(args, sender, sendResponse) {
            sendResponse({username: status.getUsername()});
        }
    };
});
