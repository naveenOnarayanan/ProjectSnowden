var config = require('./config.js').list();
var fs = require('fs');
var mime = require('mime');
var fstream = require('fstream');
var tar = require('tar');
var zlib = require('zlib');
var crypto = require("crypto-js");

var logs = [];

exports.logs = function(req, res) {
    res.send({
        "logs": logs
    });
};

exports.streamComplete = function(req, res) {
    var path = req.query.path;
    var stat = fs.statSync(path);
    var total = stat.size;
    addLog("stream_file_complete", { "name": req.query.name, "path": path, "size": total }, req.ip, new Date().getTime());
    res.send(200);
}

exports.fileList = function(req, res) {
    var decryptedKey = crypto.AES.decrypt(decodeURI(req.query.key).replace(/\|/g, '=').replace(/~/g, '\+'), config.secret);
    console.log("Decrypted: " + decryptedKey.toString(crypto.enc.Utf8));
    if (decryptedKey.toString(crypto.enc.Utf8) == config.key) {
        res.send({
            filelist: config.folders
        });
    }
};

exports.files = function(req, res) {
    var decryptedKey = crypto.AES.decrypt(decodeURI(req.query.key).replace(/\|/g, '=').replace(/~/g, '\+'), config.secret);
    if (config.key == decryptedKey.toString(crypto.enc.Utf8)) {
        var path = req.query.path;
        res.send({
            files: getFiles(path)
        });
    }
}

exports.stream = function(req, res) {
    var decryptedKey = crypto.AES.decrypt(decodeURI(req.query.key).replace(/\|/g, '=').replace(/~/g, '\+'), config.secret);
    if (config.key == decryptedKey.toString(crypto.enc.Utf8)) {
        var path = req.query.path;
        var stat = fs.statSync(path);
        var total = stat.size;
        var mimeType = mime.lookup(path);
        var file;

        var addToLogs = true;

        for (var i = 0; i < logs.length; i++ ) {
            var time = new Date(logs[i].timestamp);
            var hours = time.getHours();
            var minutes = time.getMinutes();
            if (logs[i].event == "stream_file" && logs[i].data.name == req.query.name && logs[i].data.path == path && logs[i].server == req.ip && hours == new Date().getHours() && minutes == new Date().getMinutes()) {
                addToLogs = false;
            }
        }

        if (addToLogs) {
            addLog("stream_file", { "name": req.query.name, "path": path, "size": total }, req.ip, new Date().getTime());
        }

        if (req.headers.range) {
            var range = req.headers.range;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];

            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total-1;
            var chunksize = (end-start)+1;
         
            file = fs.createReadStream(path, {start: start, end: end});
            res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': mimeType });
            file.pipe(res);
        } else {
            res.setHeader("Content-Length", total);
            res.setHeader("Content-Type", mimeType);
            file = fs.createReadStream(path);
            file.pipe(res);
        }
    }
}

exports.downloadFolder = function(req, res) {
    var decryptedKey = crypto.AES.decrypt(decodeURI(req.query.key).replace(/\|/g, '=').replace(/~/g, '\+'), config.secret);
    if (config.key == decryptedKey.toString(crypto.enc.Utf8)) {
        var path = req.query.path;
        var filename = req.query.name;
        console.log(filename);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename + ".tar.gz");
        res.setHeader('Content-type', 'application/x-tgz');
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Set-Cookie', 'fileDownload=true; path=/');
        res.setHeader('Cache-Control', 'max-age=60, must-revalidate');

        addLog("file_download", { "name": req.query.name + ".tar.gz", "path": path}, req.ip, new Date().getTime());

        var reader = fstream.Reader({ 'path' : path, 'type' : 'Directory' })
        reader.pipe(tar.Pack())/* Convert the directory to a .tar file */
            .pipe(zlib.Gzip())/* Compress the .tar file */
            .pipe(res); // Write back to the response, or wherever else...

        reader.on('end', function() {
            addLog("file_download_complete", { "name": req.query.name + ".tar.gz", "path": path}, req.ip, new Date().getTime());
        });
    }
}

exports.download = function(req, res) {
    var decryptedKey = crypto.AES.decrypt(decodeURI(req.query.key).replace(/\|/g, '=').replace(/~/g, '\+'), config.secret);
    if (config.key == decryptedKey.toString(crypto.enc.Utf8)) {
        var path = req.query.path;
        var mimeType = mime.lookup(path);

        var stat = fs.statSync(path);

        res.setHeader('Content-disposition', 'attachment; filename=' + req.query.name);
        res.setHeader('Content-type', mimeType);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Set-Cookie', 'fileDownload=true; path=/');
        res.setHeader('Cache-Control', 'max-age=60, must-revalidate');

        addLog("file_download", { "name": req.query.name, "path": path, "size": stat.size }, req.ip, new Date().getTime());

        var stream = fs.createReadStream(path, { bufferSize: 64 * 1024 });
        stream.pipe(res);
        stream.on('end', function() {
            addLog("file_download_complete", { "name": req.query.name, "path": path, "size": stat.size}, req.ip, new Date().getTime());
        });
    }
};

exports.initConfig = function(res, req) {
    res.send(config);
}

function getFiles(folder) {
    var folders = [];
    var files = [];
    var directoryFiles = fs.readdirSync(folder);

    directoryFiles.forEach(function(file) {
        var path = folder + '/' + file
        var stat = fs.lstatSync(path);

        var size = stat.size / 1073741824;
        if (size > 1) {
            size = parseFloat(size).toFixed(2)
            size += " GB";
        } else if ((stat.size / 1048576) > 1) {
            size = parseFloat(stat.size / 1048576).toFixed(2) + " MB";
        } else if ((stat.size/ 1024) > 1) {
            size = parseFloat(stat.size / 1024).toFixed(2) +  " KB";
        } else {
            size = parseFloat(stat.size).toFixed(2) + " B";
        }

        var indexOfExt = path.lastIndexOf(".") + 1;

        var ext = (indexOfExt == 0) ? "" : path.substring(indexOfExt);

        if (stat.isDirectory()) {
            
            folders.push({
                "path": path,
                "ext": "",
                "type": "D",
                "size": "",
                "name": file
            });
        } else {
            files.push({
                "path": path,
                "ext": ext,
                "type": "F",
                "size": size,
                "name": file
            });
        }
    });

    return folders.concat(files);
}

function addLog(event, data, requestIP, time) {
    var user = "Unknown";
    config.users.forEach(function(item) {
        if (item.server.indexOf(requestIP) != -1) {
            user = item.name;
        }
    });

    logs.push({
        "event": event,
        "data": data,
        "user": user,
        "server": requestIP,
        "timestamp": time
    });
};

