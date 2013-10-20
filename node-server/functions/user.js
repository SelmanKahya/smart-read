var db = require('../lib/db.js');

/*
 * Activity CRUD operations
 */

// return activity by id
exports.activity = function(req, res){
    activityProvider.findByUsername(req.params.username, function(error, activity){
        if(!activity || activity.length == 0)
            res.send({});
        else
            res.render('userActivity', { username: req.params.username, activity: JSON.stringify(activity)});
            // res.send(activity);
    });

    db.execute('INSERT INTO user SET ?', {user_username: '1', user_first_name: '2', user_last_name : '3', user_created_date: '4'}, function(err, result){
        console.log(err);
        console.log(result);
    });
};