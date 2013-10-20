var express = require('express');
var http = require('http');
var app = express();

// SET environment configuration
var config = require('./config/env');

// Endpoint handlers
var user = require('./functions/user');
var activity = require('./functions/activity');

// ROUTES
app.get('/activity', activity.readAll);
app.get('/activity/:activityID', activity.read);
app.post('/activity', activity.create);
app.post('/activity/:activityID', activity.update);
app.delete('/activity/:activityID', activity.delete);
app.get('/activity/user/:username', user.activity);

// Server is starting, hold on!
http.createServer(app).listen(3000, function(){
    console.log('Express server listening on port ' + app.get('port'));
});


