var db = require('../lib/db.js');
var resultModel = require('../lib/models/result.js');

// return user activities
exports.activity = function(req, res){
    var user_id = req.params.id;
    db.execute('SELECT * FROM activity WHERE user_id = ?', [user_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while getting word lookup data!'));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};

// return user activities
exports.lookup = function(req, res){
    var user_id = req.params.id;
    db.execute('SELECT * FROM word_lookup WHERE user_id = ?', [user_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, 'Error while getting word lookup data!'));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};