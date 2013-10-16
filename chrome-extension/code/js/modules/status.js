define(function() {
    // current status of the extension
    // true: extension is tracking -- false: not tracking
    var status = false;
    var username = "";

    return {
        toggle: function() {
            status = !status;
        },
        getStatus: function() {
            return status;
        },
        getUsername: function() {
            return username;
        },
        setUsername: function(newUsername){
            username = newUsername;
        }
    };
});
