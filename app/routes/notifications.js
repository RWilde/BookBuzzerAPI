var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var watch = require('../models/watch'); // get the mongoose model
var helper = require('../functions/helper.js');
bodyParser = require('body-parser');

//get watch books
router.get('/book', function (req, res, next) {
    
});

//post new book to watch
router.post('/book', function (req, res, next) {

});

//update book
router.put('/book', function (req, res) {

});

//delete book
route.delete('/book', function (req, res) {

});

module.exports = router;