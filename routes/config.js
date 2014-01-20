var config = require('../config/config.json'); 

exports.list = function() {
  return config;
}

exports.folders = function(req, res) {
    res.send({
        "folders": config.folders
    });
}

exports.sendList = function(req, res) {
    res.send(config);
}