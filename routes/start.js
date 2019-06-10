var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
var Jimp = require('jimp');
router.use(bodyParser.json());
//var base64ToImage = require('base64-to-image');
var pathDownload = 'public/download/';
var pathUpload = 'public/upload/';

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

var storage = multer.diskStorage({
    destination : function (req, res, cb) {
        cb(null, 'public/upload/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+file.originalname)
    }
});

//|| file.mimetype === 'image/tiff'
var fileFilter = function (req, file, cb) {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/bmp'  || file.mimetype ==='text/plain'){
        cb(null, true);
    }
    else {
        cb(new Error('Only png, bmp, tiff are allowed'), false);
    }
};

var upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).fields([{name: 'textFile', maxCount: 1}, {name: 'image', maxCount: 1}]);


router.get('/', function(req, res, next) {
    res.render('start');
});


router.post('/enc', function (req, res) {
    console.log("start page!");
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        var textFile;
        var image;
        if(req.files.textFile){
            textFile = req.files['textFile'][0].filename
        }
        if(req.files.image){
            image = req.files['image'][0].filename
        }
        var fileObject = {"textFile": textFile, "image": image};
        res.send(JSON.stringify(fileObject));
        //res.end("File is uploaded");
    });
});
router.post('/dec', function (req, res) {
    console.log("start page!");
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        var textFile;
        var image;
        if(req.files.textFile){
            textFile = req.files['textFile'][0].filename
        }
        if(req.files.image){
            image = req.files['image'][0].filename
        }
        var fileObject = {"textFile": textFile, "image": image};
        res.send(JSON.stringify(fileObject));
        //res.end("File is uploaded");
    });
});
module.exports = router;
