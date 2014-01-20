
/*
 * GET users listing.
 */

var config = require('./config.js');

exports.list = function(req, res){
    res.send({
        "userlist": config.list().users
    });
};