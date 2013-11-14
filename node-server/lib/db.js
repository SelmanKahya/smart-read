var mysql = require('mysql');

// create the pool
var pool  = mysql.createPool(GLOBAL.mysqlConfiguration);

if(!pool) {
    console.log ('Mysql pool error..');
    process.exit(1);
}

exports.execute = function (sql, object, callback) {

    // get a connection from the pool
    pool.getConnection(function(err, connection) {
        if (err) {

            console.log('DB POOL.CONNECTION ERROR:' + err);

            if(!connection)
                console.log('DB connection error')

            else
                connection.end();

            return;
        }
        else {
            // now execute the query
            connection.query(sql, object, function(err, result) {
                if(err)
                    callback(err)
                else
                    callback(null, result);


                // done with the connection.
                connection.release();
            });
        }
    });
}
