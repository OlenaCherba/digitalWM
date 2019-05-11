var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var lsb = require('./lsbPast');
var Jimp = require('jimp');
var bodyParser = require('body-parser');
//var base64ToImage = require('base64-to-image');
//var pathDownload = 'public/download/';

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
        //console.log("низя");
        cb(new Error('Only png, bmp, tiff are allowed'), false);
    }
};

var upload = multer({
    storage: storage,
    fileFilter: fileFilter
});
router.get('/', function (req, res) {
    console.log("Decode page!");
    res.render('decode');
});
var img ='';
router.post('/', urlencodedParser, upload.single('image'), function (req, res) {
    console.log(req.file);
    if (!req.file) {
        res.status(401).json({error: 'Please provide an image'});
    }

    img = req.file.destination + req.file.filename;
    console.log(lsb.decode(img, key));
    res.render('decode.pug');
});

module.exports = router;




