var os = require('os')
/*
 * GET home page.
 */

exports.index = function(req, res){
    var incomingIp = req.ip;

    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4') {
                addresses.push(address.address)
            }
        }
    }

    if (addresses.indexOf(incomingIp) == -1) {
        res.send("Access Denied");
    } else {
        res.render('index', { title: 'Express' });
    }
};