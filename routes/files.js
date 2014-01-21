var config = require('./config.js').list();
var fs = require('fs');
var mime = require('mime');
var fstream = require('fstream');
var tar = require('tar');
var zlib = require('zlib');

exports.fileList = function(req, res) {
    if (req.query.key == config.key) {
        res.send({
            filelist: config.folders
        });
    }
};

exports.files = function(req, res) {
    if (config.key == req.query.key) {
        var path = req.query.path;
        res.send({
            files: getFiles(path)
        });
    }
}

exports.downloadFolder = function(req, res) {
    if (config.key == req.query.key) {
        var path = req.query.path;
        var filename = req.query.name;
        console.log(filename);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename + ".tar.gz");
        res.setHeader('Content-type', 'application/x-tgz');
        res.setHeader('Content-Encoding', 'gzip');

        fstream.Reader({ 'path' : path, 'type' : 'Directory' })
            .pipe(tar.Pack())/* Convert the directory to a .tar file */
            .pipe(zlib.Gzip())/* Compress the .tar file */
            .pipe(res); // Write back to the response, or wherever else...
    }
}

exports.download = function(req, res) {
    if (config.key == req.query.key) {
        var path = req.query.path;
        var mimeType = mime.lookup(path);

        var stat = fs.statSync(path);

        res.setHeader('Content-disposition', 'attachment; filename=' + req.query.name);
        res.setHeader('Content-type', mimeType);
        res.setHeader('Content-Length', stat.size);

        var stream = fs.createReadStream(path, { bufferSize: 64 * 1024 });
        stream.pipe(res);
    }
};

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