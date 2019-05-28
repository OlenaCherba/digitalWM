var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var lsb = require('./lsb');
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

router.get('/', urlencodedParser, function (req, res) {
    console.log("Encode page!");
    res.render('start.pug');
    //res.end(req.body);
});

router.post('/', urlencodedParser,  upload.fields([{name: 'text', maxCount: 1}, {name: 'image', maxCount: 1}]), function (req, res) {
    console.log("Encode page!");
    var img = '';
    var alg = req.body.alg;
    var seed = req.body.seed;
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

    function doEncode(msg){
        if(alg === "block"){
            blocks.encode(img, msg, parseInt(key), parseInt(seed), req.files['image'][0].filename, function () {
                var fileName = req.files['image'][0].filename;
                res.render('start.pug', {Image:fileName});
                fs.unlink(pathUpload+req.files['image'][0].filename, (err)=>{
                    if(err) throw err;
                });
                if(req.files.text){
                    fs.unlink(pathUpload+req.files['text'][0].filename, (err)=>{
                        if(err) throw err;
                    });
                }
            });
        }
        else if(alg === "lsb"){
            lsb.encode(img, msg, parseInt(key), req.files['image'][0].filename, function () {
                var fileName = req.files['image'][0].filename;
                res.render('start.pug', {Image:fileName});
                fs.unlink(pathUpload+req.files['image'][0].filename, (err)=>{
                    if(err) throw err;
                });
                if(req.files.text){
                    fs.unlink(pathUpload+req.files['text'][0].filename, (err)=>{
                        if(err) throw err;
                    });
                }
            });
        }
    }

});

module.exports = router;
