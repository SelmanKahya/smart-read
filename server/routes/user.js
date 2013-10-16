var config = require('../config.js');;
var activityModel = require('../models/activity.js');
var ActivityProvider = require('../providers/activityProvider').ActivityProvider;
var activityProvider = new ActivityProvider(config.dbConfig);

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
};