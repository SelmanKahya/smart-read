var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var activity = require('./routes/activity');
var http = require('http');
var path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// home
app.get('/', routes.index);

// get all activities
app.get('/activity', activity.readAll);

// get activity by id
app.get('/activity/:activityID', activity.read);

// create activity
app.put('/activity', activity.create);

// update activity by id
app.post('/activity/:activityID', activity.update);

// delete activity by id
app.delete('/activity/:activityID', activity.delete);

// create activity
app.get('/activity/user/:username', user.activity);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
