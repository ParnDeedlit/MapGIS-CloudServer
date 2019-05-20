"use strict";
var fs = require('fs');

var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');

var upload = multer(); // for parsing multipart/form-data
var app = express();

function corsMiddleware(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    next();
}

function errCallback(err) {
    if (err) {
        console.log(err.message);
    }
}

function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

function dataHandler(req, res) {
    res.set('Access-Control-Allow-Origin', '*');
    var file = req.params.file;

    var rootpath = __dirname;
    var filepath = path.resolve(rootpath, "./data", file);

    var exist = fsExistsSync(filepath);
    console.log(`${filepath}` + "!!!!!!!!!!!!!!");
    if (exist) {
        console.log(`${filepath}' + 'file is exist!`);
        var pbf = fs.readFileSync(filepath);
        res.end(pbf);
    } else {
        console.log(`${filepath}' + 'file is not exist!`);
        res.sendStatus(500);
    }
};

app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '100mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use('/', express.static('./'));
app.use('/data', express.static('./data'));
app.use('/login', express.static('./login'));
app.get('/', function (req, res) {
    res.redirect('ui/index.html');
});

app.get('/data/:file', dataHandler);
//app.post('/upload/:file', dataHandler);

app.listen(8877, function () {
    console.log("Website is http://localhost:8877");
});
