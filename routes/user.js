
/*
 * GET users listing.
 */

var config = require('./config.js');

var logs = [];

exports.list = function(req, res){
    res.send({
        "userlist": config.list().users
    });
};