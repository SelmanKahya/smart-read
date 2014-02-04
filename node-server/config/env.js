var express = require('express');
var path = require('path');

app = express();

app.configure('development', function(){

    console.log('Running on development mode..');

    mysqlConfiguration = {
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'smart-read',
        port     : "3306",
        multipleStatements : true
    }
});


app.configure('server-test', function(){

    console.log('Running on server-test mode..');

    // app fog node-js server environment values
    var env = JSON.parse(process.env.VCAP_SERVICES);

    var credentials = env['mysql-5.1'][0].credentials;

    mysqlConfiguration = {
        host     : credentials.host,
        user     : credentials.username,
        password : credentials.password,
        database : credentials.name,
        port     : credentials.port,
        multipleStatements : true
    }
});