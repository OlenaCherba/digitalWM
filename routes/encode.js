var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var lsb = require('./lsbAlg');
var bodyParser = require('body-parser');

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
var imgData = Buffer.alloc(210971);
router.post('/', urlencodedParser, upload.single('image'), function (req, res) {
    var msg = req.body.messages;
   if(!req.file){
       res.status(401).json({error: 'Please provide an image'});
   }
   console.log(req.file);
   img = req.file.destination+req.file.filename;
   console.log(img);

    fs.readFile(img, function (err, data) {
        if(err){
            console.error(err);
        }
       imgData = data;
        processFile();
    });
    function processFile() {
        console.log(imgData);
        lsb.encode(imgData, msg, 55);
        console.log("Decode: "+lsb.decode(lsb.encode(imgData, msg), ));
    }
    console.log("imgData: "+imgData);
   res.redirect('/enc');
});

module.exports = router;




