var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('start');
});

/*router.get('/enc', function(req, res, next) {
    res.render('start');
});*/

/*router.get('/dec', function(req, res, next) {
    res.render('start');
});*/

module.exports = router;
