// request response model
exports.result = function (status, result ,error) {
    this.status = status;
    this.result = result;

    if(!error)
        this.error = [];
    else
        this.error = error;
}