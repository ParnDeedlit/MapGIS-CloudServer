"use strict";
var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var uploader = require('./js/uploader/uploader-node.js')('upload');

var app = express();

var createFolder = function (folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};

var uploadFolder = './upload/';

createFolder(uploadFolder);

// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    /* filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.fieldname + '-' + Date.now());  
    } */
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage })

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

function uploaderHandler(req, res, next) {
    var file = req.file;
    console.log('文件类型：%s', file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('文件大小：%s', file.size);
    console.log('文件保存路径：%s', file.path);
    res.send({ ret_code: '200' });
};

//app.post('/upload', upload.single('uploadflag'), uploaderHandler);

// Configure access control allow origin header stuff
var ACCESS_CONTROLL_ALLOW_ORIGIN = true;
// Handle uploads through Uploader.js
app.post('/upload', multipartMiddleware, function (req, res) {
    uploader.post(req, function (status, filename, original_filename, identifier) {
        console.log('POST', status, original_filename, identifier);
        if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "content-type")
        }
        setTimeout(function () {
            res.send(status);
        }, 500);
    });
});

// Handle status checks on chunks through Uploader.js
app.get('/upload', function (req, res) {
    uploader.get(req, function (status, filename, original_filename, identifier) {
        console.log('GET', status);
        if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
            res.header("Access-Control-Allow-Origin", "*");
        }

        res.status(status == 'found' ? 200 : 204).send(status);
    });
});

app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '100mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//app.use('/', express.static('./'));
// Host most stuff in the public folder
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/../../dist'));
app.use('/data', express.static('./data'));
app.use('/login', express.static('./login'));
app.get('/', function (req, res) {
    res.redirect('ui/index.html');
});

app.get('/data/:file', dataHandler);


app.listen(8877, function () {
    console.log("Website is http://localhost:8877");
});
