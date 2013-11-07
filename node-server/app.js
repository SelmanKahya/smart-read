var express = require('express');
var http = require('http');
var app = express();
var sockjs = require('sockjs');

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

// MEMBERSHIP Routes
app.post(   '/user/register', user.register);
app.post(   '/user/login', user.login);

// USER Routes
app.get(    '/user/:id/activity', user.activity);
app.get(    '/user/:id/word-lookup', user.lookup);
app.get(    '/user/:id/word-lookup/books', user.books);

// Server is starting, hold on!
var server = http.createServer(app);

server.listen(3000, function(){
    console.log('Express server listening on port ' + app.get('port'));
});

// open socket for chat
var connections = [];
var chat = sockjs.createServer();
chat.on('connection', function(conn) {

    connections.push(conn);

    var number = connections.length;
    var username = 'Guest ' + number;

    conn.write("Welcome to the chat room");

    conn.on('data', function(message) {

        var message = JSON.parse(message);

        if(message.type == 'newUser')  {

            username = message.data.user_first_name + " " + message.data.user_last_name;

            // tell other users that new user entered to room
            for (var ii=0; ii < connections.length; ii++) {
                if(connections[ii] != conn)
                    connections[ii].write(username + " entered to the room");
            }
        }

        if(message.type == 'sendingMessage'){

            for (var ii=0; ii < connections.length; ii++) {
                connections[ii].write(username + " says: " + message.data);
            }

        }
    });

    conn.on('close', function() {
        for (var ii=0; ii < connections.length; ii++) {
            connections[ii].write(username + " has disconnected");
        }
    });
});

chat.installHandlers(server, {prefix:'/chat'});

