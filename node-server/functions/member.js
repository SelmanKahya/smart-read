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
                res.send(new resultModel.result(false, {}, ['Username (' + user.user_email + ') already exists. Please register with another e-mail address!']));
        }
    });


};

//==================================================================
// route to test if the user is logged in or not
exports.loggedin = function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
};

// route to log in
exports.login = function(req, res) {
    res.send(req.user);
};

// route to log out
exports.logout = function(req, res) {
    req.logOut();
    res.send(200);
};
