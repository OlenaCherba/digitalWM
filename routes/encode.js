var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var lsb = require('./lsbPast');
var bloks = require('./blocks');
var bodyParser = require('body-parser');
var Jimp = require('jimp');

//var base64ToImage = require('base64-to-image');
var pathDownload = 'public/download/';

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

var fileFilter = function (req, file, cb) {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/bmp' || file.mimetype === 'image/tiff'){
        cb(null, true);
    }
    else {
        console.log("низя");
        cb(new Error('Only png, bmp, tiff are allowed'), false);
    }
};

var upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

router.get('/', function (req, res) {
    console.log("Encode page!");
    res.render('encode.pug');
});

var img = '';
//var imgData = Buffer.alloc(211021);
//var encodeImg = Buffer.alloc(211021);
router.post('/', urlencodedParser, upload.single('image'), function (req, res) {
    var msg = req.body.messages;
    var key = 0;
    if (req.body.color === '0') {
        key = 0;
    } else if (req.body.color === '1') {
        key = 1;
    } else if (req.body.color === '2') {
        key = 2;
    }
    if (!req.file) {
        res.status(401).json({error: 'Please provide an image'});
    }
    console.log(req.file);
    img = req.file.destination + req.file.filename;
    console.log(img);

    //lsb.encode(img, msg, key, req.file.filename);
    bloks.encode(img, msg, key, 13, 3, req.file.filename);

    res.render('encode.pug', {Image:pathDownload+req.file.filename });
});

module.exports = router;




