var config = require('../config.js');;
var activityModel = require('../models/activity.js');
var ActivityProvider = require('../providers/activityProvider').ActivityProvider;
var activityProvider = new ActivityProvider(config.dbConfig);

/*
 * Activity CRUD operations
 */

// return activity by id
exports.read = function(req, res){
    activityProvider.findById(req.params.activityID, function(error, activity){
        if(!activity || activity.length == 0)
            res.send({});
        else
            res.send(activity);
    });
};

// return all activity
exports.readAll = function(req, res){
    activityProvider.findAll(function(error, activities){
        if(activities.length == 0)
            res.send({});
        else
            res.send(activities);
    });
};

// create an activity
exports.create = function(req, res){
    var newActivity = new activityModel.Activity(req.body.username, req.body.type, req.body.content);

    activityProvider.save(newActivity, function(error, activity) {
        res.send(newActivity);
    });
};

// update activity
exports.update = function(req, res){

    if(!req.body.username || !req.body.type || !req.body.type)
        res.send({status: false});
    else {
        var activity = new activityModel.Activity(req.body.username, req.body.type, req.body.content);

        activityProvider.update(req.params.activityID, activity, function(error, activity) {
            res.send(activity);
        });
    }
};

// delete activity
exports.delete = function(req, res){
    activityProvider.delete(req.params.activityID, function(error, activity) {
        res.send({status: true});
    });
};