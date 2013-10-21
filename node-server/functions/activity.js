var db = require('../lib/db.js');
var resultModel = require('../lib/models/result.js');

// return activity by id
exports.read = function(req, res){
    var activity_id = req.params.id;
    db.execute('SELECT * FROM activity WHERE activity_id = ?', [activity_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while getting activity!'));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};

// create an activity
exports.create = function(req, res){

    // object to be created
    var object = {
        activity_type_id: req.body.activity_type_id,
        activity_content: req.body.activity_content,
        activity_created_time: new Date(),
        book_name: req.body.book_name,
        user_id : req.body.user_id
    }

    db.execute('INSERT INTO activity SET ?', object, function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while creating an activity!'));

        else{
            object.activity_id = result.insertId;
            res.send(new resultModel.result(true, object));
        }
    });
};

// update activity
exports.update = function(req, res){

    // object to be modified
    var object = {
        activity_id: req.params.id,
        activity_type_id: req.body.activity_type_id,
        activity_content: req.body.activity_content,
        book_name: req.body.book_name,
        user_id: req.body.user_id
    }

    db.execute('UPDATE activity SET activity_type_id = ?, activity_content = ?, book_name = ? , user_id = ? WHERE activity_id = ?',
        [object.activity_type_id, object.activity_content, object.book_name, object.user_id, object.activity_id], function(err, result){

        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while updating the activity!'));

        else
            res.send(new resultModel.result(true, object));

    });
};

// delete activity
exports.delete = function(req, res){

    var activity_id = req.params.id;

    db.execute('DELETE FROM activity WHERE activity_id = ?', [activity_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while deleting the activity!'));

        else
            res.send(new resultModel.result(true, {}));
    });
};