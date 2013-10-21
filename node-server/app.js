var express = require('express');
var http = require('http');
var app = express();

// all environments
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.set('port', process.env.PORT || 3000);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// SET environment configuration
var config = require('./config/env');

// Endpoint handlers
var user = require('./functions/user');
var activity = require('./functions/activity');
var wordLookup = require('./functions/word-lookup');

// ACTIVITY ROUTES
app.post(   '/activity', activity.create);
app.get(    '/activity/:id', activity.read);
app.post(   '/activity/:id', activity.update);
app.delete( '/activity/:id', activity.delete);

// WORD LOOKUP
app.post(   '/word-lookup', wordLookup.create);
app.get(    '/word-lookup/:id', wordLookup.read);
app.post(   '/word-lookup/:id', wordLookup.update);
app.delete( '/word-lookup/:id', wordLookup.delete);

// USER Routes
app.get(    '/user/:id/activity', user.activity);
app.get(    '/user/:id/word-lookup', user.lookup);

// Server is starting, hold on!
http.createServer(app).listen(3000, function(){
    console.log('Express server listening on port ' + app.get('port'));
});


