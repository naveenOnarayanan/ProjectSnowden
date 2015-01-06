/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var http = require('http');
http.post = require('http-post');
var path = require('path');
var open = require('open');
var os = require('os');
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

var config_path = __dirname + '/config/config.json';
var config = null;

if (fs.existsSync(config_path)) {
    // Local routing files
    var user = require(__dirname + '/routes/user');
    var main = require(__dirname + '/routes/main');
    var files = require(__dirname + '/routes/files');
    var config = require(__dirname + '/routes/config');

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

    // Verify IP with server on app load
    fs.readFile(config_path, 'utf8', function(err, data) {
        if (err) throw err;
        configData = JSON.parse(data);
        http.post('http://desolate-depths-5086.herokuapp.com/v1/register', {'user': configData.key, 'ip': getLocalIp()}, function(response) {
            console.log ("IP Updated");
        });
    });
} else {
    open(__dirname + '/config/setup/config.html');
    app.post('/config/setup', function(req, res) {
        if (req.body) {
            console.log("KEY: " + req.body.key);
            // Get local IP
            var localIp = getLocalIp();
            console.log("POSTING right now with IP: " + localIp);

            // http://desolate-depths-5086.herokuapp.com
            http.post('http://desolate-depths-5086.herokuapp.com/v1/register', {'user': req.body.key, 'ip': localIp}, function(response) {
                console.log(response);
                if (response.statusCode == 200) {
                    res.send(200); 
                    console.log('sent response');
                    fs.writeFileSync(config_path, JSON.stringify(req.body, null, 4));
                }
            });
        }
    });
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


function getLocalIp() {
    var interfaces = os.networkInterfaces();
    var localIp = null;
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == "IPv4" && !address.internal) {
                localIp = address.address;
                break;
            }
        }
    }

    return localIp;
}

