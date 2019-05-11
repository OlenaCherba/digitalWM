var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var lsb = require('./lsbPast');
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
    if (req.body.color === 0) {
        key = 0;
    } else if (req.body.color === 1) {
        key = 1;
    } else if (req.body.color === 2) {
        key = 2;
    }
    if (!req.file) {
        res.status(401).json({error: 'Please provide an image'});
    }
    console.log(req.file);
    img = req.file.destination + req.file.filename;
    console.log(img);

    lsb.encode(img, msg, key, req.file.filename);

    console.log(lsb.decode(pathDownload+'1557536775455duck.png', key));

    /*fs.open('public/download/'+req.file.filename, 'w',function (err, fd) {
            if(err) throw err;
             fs.write(fd, encodeImg, 0, encodeImg.length, null, function (err) {
                 if(err) throw err;
                 fs.close(fd, function () {
                     console.log("success");
                 })
             } );
         });*/
    /*fs.readFile(img, function (err, data) {
        if(err){
            console.error(err);
        }
        var imgData = Uint8ClampedArray.from(data);
       //imgData = data;
        processFile(imgData);
    });
    function processFile(data) {
        console.log(data);
        console.log("data: "+data);
        console.log("key"+key);
        //encodeImg = Buffer.from(lsb.encode(data, msg, key));
       // console.log(encodeImg);
        //console.log("Decode: "+lsb.decode(encodeImg, key));


        //console.log("encodeImg "+encodeImg);
        //encodeImg.mimeType = req.file.mimetype;
        /*fs.open('public/download/'+req.file.filename, 'w',function (err, fd) {
           if(err) throw err;
            fs.write(fd, encodeImg, 0, encodeImg.length, null, function (err) {
                if(err) throw err;
                fs.close(fd, function () {
                    console.log("success");
                })
            } );
        });*/
    /*var writeStream = fs.createWriteStream(pathDownload+req.file.filename);
    writeStream.write(encodeImg);
    writeStream.end();
    console.log(encodeImg.encoding);
    */

    /*var image = fs.readFile(img, function(err, data) {
        console.log("img data: "+data)
        fs.writeFile(pathDownload+'outputImage.png', data, 'binary', function (err) {
            if (err) {
                console.log("There was an error writing the image")
            }
            else {
                console.log("There file was written")
            }
        });
    });*/

    //var encodeImg = lsb.test(data);
    //console.log("img data: " + lsb.encode(data, msg, key));
    /*var image = fs.writeFile('public/download/'+req.file.filename, encodeImg,'binary', function (error) {
        //console.log("img data: "+encodeImg);
        console.log("decode: "+lsb.decode(encodeImg, key));
        if (error) {
            console.log("There was an error writing the image");
        } else {
            console.log("There file was written");
        }
    });*/

    res.render('encode.pug', {Image:pathDownload+req.file.filename });
});

module.exports = router;




