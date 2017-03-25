var express     = require('express');
var router      = express.Router();

var mongoose    = require('mongoose');
var Author      = require('../models/authors.js');
var helper      = require('../functions/helper.js');

//get authors
router.get('/', function(req, res, next) {
  Author.find(function (err, books){
    if (err) return next(err);
    res.json(books)
  })
});

//get Author by id
router.get('/:id', function(req, res, next) {
  Author.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

//update author

//post author
router.post('/', function(req, res) {
  authorId = helper.getAuthorsIfExists(req, res);

  if (authorId != null)
    console.log("Everything worked " + authorId);
  else
    console.log("didnt work :(");
});

module.exports = router;
