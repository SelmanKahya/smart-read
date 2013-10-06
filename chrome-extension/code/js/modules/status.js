define(function() {
    // current status of the extension
    // true: extension is tracking -- false: not tracking
    var status = false;

    return {
        toggle: function() {
            status = !status;
        },
        getStatus: function() {
            return status;
        }
    };
});
