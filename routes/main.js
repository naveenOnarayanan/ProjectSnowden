var os = require('os')
var config = require('./config.js').list();
/*
 * GET home page.
 */

exports.index = function(req, res){
    var incomingIp = req.ip;

    var interfaces = os.networkInterfaces();
    var addresses = config.whitelist;
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4') {
                addresses.push(address.address)
            }
        }
    }

    console.log(addresses);

    if (addresses.indexOf(incomingIp) == -1) {
        res.send("Access Denied");
    } else {
        res.render('index', { secret:  config.secret});
    }
};