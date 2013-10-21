function ActivityService(){};

ActivityService.prototype.newActivity = function(activity, callback){

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/activity",
        data: {
            activity_type_id: activity.activity_type_id,
            activity_content: activity.activity_content,
            book_name : SMARTREAD.book.name,
            user_id : activity.user_id
        }
    }).done(function(result) {
            callback(result);
    });

};