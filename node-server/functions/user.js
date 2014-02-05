var db = require('../lib/db.js');
var resultModel = require('../lib/models/result.js');

// return user activities
exports.activity = function(req, res){
    var user_id = req.user.result.user_id;
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
    var user_id = req.user.result.user_id;
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
    var user_id = req.user.result.user_id;
    db.execute('SELECT DISTINCT(book_name) FROM activity WHERE activity_type_id = 1 AND user_id = ?', [user_id], function(err, result){
        if(err)
            res.send(500, new resultModel.result(false, {}, ['Error while getting books!']));

        else{
            res.send(new resultModel.result(true, result));
        }
    });
};