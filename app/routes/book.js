var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var book = require('../models/books');
var Author = require('../models/authors'); // get the mongoose model
var helper = require('../functions/helper.js');
bodyParser = require('body-parser');

//get books
///api/books
router.get('/', function (req, res, next) {
  book.find(function (err, books) {
    if (err) return next(err);
    res.json(books)
  })
});

//get book with bookid
///api/books/?id=58c6c4ecef4354bc318e914c
router.get('/:id', function (req, res, next) {
  book.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

//create book
router.post('/', function (req, res) {
  book.find({ work_id: req.body.id }, function (err, post) {
    if (err) return next(err);

    if (!post.length) {
      //book doesnt exist
      Author.findOne({ 'goodreads_id': req.body.goodreads_author_id }, '_id', function (err, post) {
        if (err) return next(err);
        newObjectId = helper.generateObjectId();
        if (!post) {
          //author doesnt exist
          authorId = helper.generateObjectId();
          newAuthor = helper.returnAuthorObject(req, newAuthorId);
          newAuthor.save(function (error, data) {
            if (error) console.log("there was an error");
          })
        }
        else {
          authorId = post._id;
        }
        newBook = helper.returnBookObject(req, newObjectId, authorId);
        newBook.save(function (error, data) {
          if (error) console.log("there was an error");
        })
        res.json(newbook);
      });
    }
  });
});

//update book

//delete book

module.exports = router;
