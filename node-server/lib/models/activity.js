// activity entity
exports.Activity = function (username, type, content) {
    this.activity_username = username;
    this.activity_type = type;
    this.activity_content = content;
}