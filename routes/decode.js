var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    console.log("Decode page!");
    res.render('decode');
});
module.exports = router;




