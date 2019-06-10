var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var lsb = require('./lsb');
var bloks = require('./blocks');
var bodyParser = require('body-parser');
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

var fileFilter = function (req, file, cb) {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/bmp' || file.mimetype === 'image/tiff'){
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

function setData(data){
    var jsn = {"seedTest":13};
    return jsn;
}
router.get('/', function (req, res) {
    console.log("Decode page!");
    var imageName = req.query.image;
    var alg = req.query.alg;
    var color = req.query.color;
    var seed = req.query.seed;
    if (!imageName) {
        res.status(401).json({error: 'Please provide an image'});
    }
    var imagePath = pathUpload + imageName;
    if(alg === "block"){
        bloks.decode(imagePath, parseInt(color), parseInt(seed), function (cb) {
            console.log("text: "+cb);
            res.send(JSON.stringify({"textResult":cb}));
        });
    }
    else if(alg === "lsb"){
        lsb.decode(imagePath, parseInt(color),function (cb) {
            console.log("text: "+cb);
            res.send(JSON.stringify({"textResult":cb}));
        });
    }
});

router.post('/',urlencodedParser, upload.single('image'), function (req, res) {
    var img ='';
    var text = '';
    //console.log(req.file);
    var alg = req.body.alg;
    var seed = req.body.seed;
    var key = req.body.color;
    if (!req.file) {
        res.status(401).json({error: 'Please provide an image'});
    }
    img = req.file.destination + req.file.filename;

    if(alg === "block"){
        bloks.decode(img, parseInt(key), parseInt(seed), function (cb) {
            console.log("text: "+cb);
            res.render('start.pug', {Text: cb});
        });
    }
    else if(alg === "lsb"){
        lsb.decode(img, parseInt(key),function (cb) {
            console.log("text: "+cb);
            res.render('start.pug', {Text: cb});
        });
    }
});

module.exports = router;




