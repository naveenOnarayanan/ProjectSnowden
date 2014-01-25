/**
 * Module dependencies.
 */

var express = require('express');
var user = require('./routes/user');
var main = require('./routes/main');
var files = require('./routes/files');
var config = require('./routes/config');
var http = require('http');
var path = require('path');
var fs = require('fs');

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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/public/v1/uwp/userlist', user.list)

app.get('/public/v1/uwp/filelist', files.fileList);
app.get('/public/v1/uwp/files', files.files);
app.get('/public/v1/uwp/stream', files.stream);
app.get('/public/v1/uwp/download/', files.download);
app.get('/public/v1/uwp/download/folder', files.downloadFolder);

app.get('/config', config.sendList);
app.get('/logs', files.logs);

app.get('/', main.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
