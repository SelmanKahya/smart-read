var express = require('express');
var path = require('path');
app = express();

// all environments
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

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

    app.set('port', 3000);

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

    app.set('port', process.env.PORT || 3000);

});