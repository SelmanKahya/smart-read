var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ActivityProvider = function(config) {
    this.db = new Db('activity', new Server(config.host, config.port, {auto_reconnect: true}, {}), {safe: true});
    this.db.open(function(){});
};

ActivityProvider.prototype.getCollection = function(callback) {
    this.db.collection('activities', function(error, activity_collection) {
        if( error ) callback(error);
        else callback(null, activity_collection);
    });
};

ActivityProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, activity_collection) {
        if( error ) callback(error)
        else {
            activity_collection.find().toArray(function(error, results) {
                if( error ) callback(error)
                else callback(null, results)
            });
        }
    });
};

ActivityProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, activity_collection) {
        if( error ) callback(error);
        else {
            activity_collection.findOne({_id: activity_collection.db.bson_serializer.ObjectID.createFromHexString(id.toString())}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};

ActivityProvider.prototype.findByUsername = function(username, callback) {
    this.getCollection(function(error, activity_collection) {
        if( error ) callback(error);
        else {
            activity_collection.findOne({activity_username: username}, function(error, result) {
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};

ActivityProvider.prototype.save = function(activities, callback) {
    this.getCollection(function(error, activity_collection) {
        if( error ) callback(error)
        else {
            if( typeof(activities.length)=="undefined")
                activities = [activities];

            activity_collection.insert(activities, function() {
                callback(null, activities);
            });
        }
    });
};

ActivityProvider.prototype.update = function(id, activity, callback) {
    this.getCollection(function(error, activities) {
        if( error ) callback(error);
        else {
            activities.findAndModify({_id: activities.db.bson_serializer.ObjectID.createFromHexString(id)}, [['_id', 1]], {$set:activity}, {new:true}, function(error, activity) {
                if(error) callback(error);
                else callback(null, activity)
            });
        }
    });
};

ActivityProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, activity_collection) {
        if(error) callback(error);
        else {
            activity_collection.remove(
            {_id: activity_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, activity){
                if(error) callback(error);
                else callback(null, activity)
            });
        }
    });
};
exports.ActivityProvider = ActivityProvider;