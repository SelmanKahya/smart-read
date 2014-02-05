var express = require('express');
var socket = require('./functions/socket.js');
var http = require('http');
var app = express();

// auth
// passport library
var passport = require('passport');
var passportStrategy = require('passport-local').Strategy;
var AUTH = require('./config/auth.js');
AUTH.init(passport, passportStrategy );

// all environments
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

// auth
app.use(express.session({ secret: AUTH.getSecretKey() }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization

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
var member = require('./functions/member');
var activity = require('./functions/activity');
var wordLookup = require('./functions/word-lookup');

// ACTIVITY ROUTES
app.post(   '/activity', AUTH.auth, activity.create);
app.get(    '/activity/:id', AUTH.auth, activity.read);
app.post(   '/activity/:id', AUTH.auth, activity.update);
app.delete( '/activity/:id', AUTH.auth, activity.delete);

// WORD LOOKUP
app.post(   '/word-lookup', AUTH.auth, wordLookup.create);
app.get(    '/word-lookup/:id', AUTH.auth, wordLookup.read);
app.post(   '/word-lookup/:id', AUTH.auth, wordLookup.update);
app.delete( '/word-lookup/:id', AUTH.auth, wordLookup.delete);

// MEMBERSHIP Routes
app.post(   '/member/register', member.register);
app.post(   '/member/login', passport.authenticate('local'), member.login);
app.get(    '/member/loggedin', member.loggedin);
app.post(   '/member/logout', member.logout);

// USER Routes
app.get(    '/user/activity', AUTH.auth, user.activity);
app.get(    '/user/word-lookup', AUTH.auth, user.lookup);
app.get(    '/user/word-lookup/books', AUTH.auth, user.books);

// Server is starting, hold on!
var server = http.createServer(app);

server.listen(process.env.VCAP_APP_PORT || 3000, function(){

    console.log('Express server listening on port ' + app.get('port'));

    // start socket
    socket.init(server);

});
