/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var open = require('open');
var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var config_path = './config/config.json';
var config = null;

if (fs.existsSync(config_path)) {
    // Local routing files
    var user = require('./routes/user');
    var main = require('./routes/main');
    var files = require('./routes/files');
    var config = require('./routes/config');

    app.get('/public/v1/uwp/userlist', user.list);
    app.get('/public/v1/uwp/filelist', files.fileList);
    app.get('/public/v1/uwp/files', files.files);
    app.get('/public/v1/uwp/stream', files.stream);
    app.get('/public/v1/uwp/download/', files.download);
    app.get('/public/v1/uwp/download/folder', files.downloadFolder);
    app.get('/config', config.sendList);
    app.get('/logs', files.logs);
    app.get('/', main.index);

    app.post('/public/v1/uwp/stream/complete', files.streamComplete);
} else {
    open('./config/setup/config.html');
    app.post('/config/setup', function(req, res) {
        if (req.body) {
            res.send(200);
            console.log('sent response');
            fs.writeFileSync(config_path, JSON.stringify(req.body, null, 4));
        }

    });
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
