var express = require('express');
var router = express.Router();
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

router.get('/', urlencodedParser, function (req, res) {
    //var msg = req.query.msg;
    var textFileName = req.query.textFile;
    var imageName = req.query.image;
    var alg = req.query.alg;
    var color = req.query.color;
    var seed = req.query.seed;

    if (!imageName) {
        res.status(401).json({error: 'Please provide an image'});
    }
    var imagePath = pathUpload + imageName;
    var msg = '';var imagePath = pathUpload + imageName;
    if(textFileName){
        fs.readFile(pathUpload+textFileName, function (err, data) {
            if(err){
                throw  err;
            }
            msg = data.toString();
            console.log(msg);
            doEncode(msg);
        });

    } else if(req.query.msg) {
        msg = req.query.msg;
        doEncode(msg);
    }

    function doEncode(msg){
        if(alg === "block"){
            blocks.encode(imagePath, msg, parseInt(color), parseInt(seed), imageName, function () {
                res.send(JSON.stringify({"imageResult":imageName}));
                fs.unlink(imagePath, (err)=>{
                    if(err) throw err;
                });
                if(textFileName){
                    fs.unlink(pathUpload+textFileName, (err)=>{
                        if(err) throw err;
                    });
                }
            });
        }
        else if(alg === "lsb"){
            lsb.encode(imagePath, msg, parseInt(color), imageName, function () {
                res.send(JSON.stringify({"imageResult":imageName}));
                fs.unlink(imagePath, (err)=>{
                    if(err) throw err;
                });
                if(textFileName){
                    fs.unlink(pathUpload+textFileName, (err)=>{
                        if(err) throw err;
                    });
                }
            });
        }
    }
    //res.end(req.body);
});

router.post('/', function (req, res) {

    /*if (!req.files.image) {
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
                //res.render('start.pug', {Image:fileName});
                res.send(seed);
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
    }*/

});

module.exports = router;
