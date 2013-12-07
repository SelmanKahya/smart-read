// import lib
var sockjs = require('sockjs');

// open socket for chat
var connections = [];
var socket = sockjs.createServer();

// init socket
exports.init = function(server){
    socket.on('connection', newConnection);
    socket.installHandlers(server, {prefix:'/chat'});
};

var newConnection = function(conn) {

    var number = connections.length;

    conn.id = number;

    conn.game = {
        looking: false,
        opponent: null
    };

    conn.on('data', function(message) {


        var message = JSON.parse(message);

        conn.user = message.user;

        var username = message.user.user_first_name + " " + message.user.user_last_name;

        if(message.type == 'message')  {

            if(message.action == 'new-user'){
                // tell users that new user entered to room
                for (var ii=0; ii < connections.length; ii++) {
                    connections[ii].write(username + " entered to the room");
                }
            }

            else if(message.action == 'send'){
                for (var ii=0; ii < connections.length; ii++) {
                    connections[ii].write(username + " says: " + message.data);
                }
            }
        }


        else if(message.type == 'game')  {

            if(message.action == 'find-opponent'){
                                    console.log(message.user.user_first_name, "looking for a match")
                conn.game.looking = true;

                for (var ii=0; ii < connections.length; ii++) {

                    var connection = connections[ii];

                    if(conn.id != connection.id && connection.game.looking)    {

                        conn.game.looking = false;
                        connection.game.looking = false;

                        conn.game.opponent = connection;
                        connection.game.opponent = conn;

                        conn.write("You can chat with your opponent here.");
                        connection.write("You can chat with your opponent here.");
                    }
                }
            }

            else if(message.action == 'start'){

            }

            else if(message.action == 'won'){
                conn.game.opponent.write('lost')
            }
        }

    });

    conn.on('close', function(){

        conn.game.looking = false;
        conn.game.opponent.game.looking = false;

        conn.game.opponent.write("disconnected");
    });

    connections.push(conn);
}