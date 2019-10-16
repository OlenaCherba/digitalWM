var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
var Jimp = require('jimp');
router.use(bodyParser.json());
var pathDownload = 'public/download/';
var pathUpload = 'public/upload/';
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

//подключение БД
var pg = require("pg");
var CON_STRING = process.env.DB_CON_STRING;
if (CON_STRING == undefined) {
    console.log("Error: Environment variable DB_CON_STRING not set!");
    process.exit(1);
}
pg.defaults.ssl = true;
var dbClient = new pg.Client(CON_STRING);
dbClient.connect();

//cecсия
var session = require("express-session");
router.use(session({
    secret: "This is a secret!",
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

var storage = multer.diskStorage({
    destination : function (req, res, cb) {
        cb(null, 'public/upload/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+file.originalname)
    }
});

var fileFilter = function (req, file, cb) {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/bmp' || file.mimetype === 'image/tiff' || file.mimetype ==='text/plain'){
        cb(null, true);
    }
    else {
        cb(new Error('Only png, bmp, tiff are allowed'), false);
    }
};

var upload = multer({
    storage: storage
    //fileFilter: fileFilter
}).fields([{name: 'textFile', maxCount: 1}, {name: 'image', maxCount: 1}]);

router.get('/', function(req, res, next) {
    res.render('login.pug');
});

router.get('/main', function(req, res, next) {
    res.render('mainpage.pug');
});

router.post('/', urlencodedParser, function (req, res, err) {
    var user = req.body.username;
    var password = req.body.password;

    dbClient.query("SELECT * FROM users", function (dbError, dbResponse) {
        for (var i = 0; i < dbResponse.rows.length; i++) {
            if ((user == dbResponse.rows[i].name) && (password == dbResponse.rows[i].password)) {
                req.session.user = user;
                console.log("pass " + password + " = " + dbResponse.rows[i].password);
                res.redirect('/main');
                console.log("correct!");
            } else {
                console.log("pass " + password + " = " + dbResponse.rows[i].password);
                console.log("Wrong!");
                res.render('login.pug', {
                    login_error: "Sorry, username and password do not match!"
                });
            }
        }
    });
});

router.get('/reg', function (req,res) {
    res.render('registration.pug');
});
router.post('/reg', urlencodedParser, function (req, res, err) {
    var username = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.confPassword;
    console.log("user:"+username+"pass"+password+"conf"+confirmPassword);
    if(password === confirmPassword){
        dbClient.query("INSERT INTO users (name, password) VALUES ($1, $2)", [username, password], function (dbError, dbResponse) {
            res.redirect('/main');
        });
    }
    else if(password != confirmPassword){
        res.redirect('/reg');
    }
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
            if(req.files['textFile'][0].mimetype === 'text/plain'){
                textFile = req.files['textFile'][0].filename;
            } else textFile= "err";
        }
        if(req.files.image){
            if(req.files['image'][0].mimetype === 'image/png'){
                image = req.files['image'][0].filename;
            } else image= "err";
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
