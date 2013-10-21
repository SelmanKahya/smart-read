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

app.configure('production', function(){

    console.log('Running on production mode..');

    mysqlConfiguration = {
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'smart-read',
        port     : "3306",
        multipleStatements : true
    }
});