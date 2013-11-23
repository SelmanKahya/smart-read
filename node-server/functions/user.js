var db = require('../lib/db.js');
var resultModel = require('../lib/models/result.js');

// register a user
exports.register = function(req, res){

    // user to be created
    var user = {
        user_first_name: req.body.user_first_name,
        user_last_name: req.body.user_last_name,
        user_email: req.body.user_email,
        user_password: req.body.user_password,
        user_gender: req.body.user_gender,
        user_created_date: new Date()
    }


    db.execute('SELECT * FROM user WHERE user_email = ?', [user.user_email], function(err, result){

        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while logging in!]']));

        else{

            // if no user with given email
            if(result.length == 0){

                db.execute('INSERT INTO user SET ?', user, function(err, result){
                    if(err)
                        res.send(500, new resultModel.result(false, {}, 'Error while creating the user!'));

                    else{
                        user.user_id = result.insertId;
                        res.send(new resultModel.result(true, user));
                    }
                });
            }

            else
                res.send(new resultModel.result(false, {}, ['Username (' + user.user_email + ') already exist. Please register with another e-mail address!']));
        }
    });


};

// login user
exports.login = function(req, res){

    // user to be authenticated
    var user = {
        user_email: req.body.user_email,
        user_password: req.body.user_password
    }

    db.execute('SELECT * FROM user WHERE user_email = ? AND user_password = ?', [user.user_email, user.user_password], function(err, result){

        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while logging in!]']));

        else{
            if(result.length != 1){
                res.send(401, new resultModel.result(false, {}, ['Wrong credentials, please try again!']));
            }

            else
                res.send(new resultModel.result(true, result[0]));
        }
    });
};

// return user activities
exports.activity = function(req, res){
    var user_id = req.params.id;
    db.execute('SELECT * FROM activity WHERE user_id = ? ORDER BY activity_created_time ASC', [user_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while getting word lookup data!']));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};

// return word lookups
exports.lookup = function(req, res){
    var user_id = req.params.id;
    db.execute('SELECT word_lookup_id, word_lookup_word, word_lookup_quiz_taken, word_lookup_quiz_result, ' +
        'word_lookup_created_time, book_name, user_id, COUNT(word_lookup_id) AS word_lookup_count ' +
        'FROM word_lookup WHERE user_id = ? GROUP BY word_lookup_word', [user_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while getting word lookup data!']));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};

// return books that user read
exports.books = function(req, res){
    var user_id = req.params.id;
    db.execute('SELECT DISTINCT(book_name) FROM activity WHERE activity_type_id = 1 AND user_id = ?', [user_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while getting books!']));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};