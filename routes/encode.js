var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var lsb = require('./lsbPast');
var blocks = require('./blocks');
var bodyParser = require('body-parser');
var Jimp = require('jimp');

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
});

router.get('/', function (req, res) {
    console.log("Encode page!");
    res.render('encode.pug');
});

var img = '';
//var imgData = Buffer.alloc(211021);
//var encodeImg = Buffer.alloc(211021);
router.post('/', urlencodedParser,  upload.fields([{name: 'text', maxCount: 1}, {name: 'image', maxCount: 1}]), function (req, res) {

    var seed = req.body.seed;
    var E = req.body.E;
    var key = req.body.color;
    if (!req.files.image) {
        res.status(401).json({error: 'Please provide an image'});
    }
    console.log(req.file);
    img = req.files['image'][0].destination + req.files['image'][0].filename;
    console.log(img);
    var msg = '';
    if(req.files.text){
        fs.readFile(pathUpload+req.files['text'][0].filename, function (err, data) {
            if(err){
                throw  err;
            }
            msg = data.toString();
            doEncode(msg);
        });

    } else if(req.body.messages) {
        msg = req.body.messages;
        doEncode(msg);
    }
    /*if (req.body.color === '0') {
        key = 0;
    } else if (req.body.color === '1') {
        key = 1;
    } else if (req.body.color === '2') {
        key = 2;
    }*/

    //lsb.encode(img, msg, key, req.file.filename);
    function doEncode(msg){
        blocks.encode(img, msg, parseInt(key), parseInt(seed), parseInt(E), req.files['image'][0].filename, function () {
            var fileName = req.files['image'][0].filename;
            res.render('encode.pug', {Image:fileName});
            fs.unlink(pathUpload+req.files['image'][0].filename, (err)=>{
                if(err) throw err;
            });
            fs.unlink(pathUpload+req.files['text'][0].filename, (err)=>{
                if(err) throw err;
            });
        });
    }

});

module.exports = router;
