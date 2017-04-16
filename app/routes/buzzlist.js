var passport = require('passport');
var express = require('express');
var router = express.Router();
require('../../config/passport')(passport);
var jwt = require('jwt-simple');
var config = require('../../config/database');

var mongoose = require('mongoose');
var Buzzlist = require('../models/buzzlist');
var Book = require('../models/books');
var User = require('../models/user');
var helper = require('../functions/helper.js');
var Author = require('../models/authors'); // get the mongoose model
var bodyParser = require('body-parser');

router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb' }));



//testing get all lists
router.get('/', function (req, res, next) {
  Buzzlist.find(function (err, data) {
    if (err) return next(err);
    res.json(data)
  })
});

//get booklist w token
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  if (!token) return res.status(403).send({ success: false, msg: 'No token provided.' });
  res.json(helper.getBuzzlistByUserAndName(decoded, req.list_name));
});

//post new book to buzzlist
router.post('/newbook', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  User.findOne({ _id: decoded._id }, function (err, data) {
    if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
    if (!data) return res.status(403).send({ success: false, msg: 'no user found' });

    list = helper.returnEmptyBuzzListObject(req, decoded._id);
    Buzzlist.findOne({ user: decoded._id, list_name: req.body.list_name }, function (err, list_post) {
      if (err) return res.status(403).send({ success: false, msg: 'error with finding list' });

      if (!list_post) {
        list.save(function (error, new_list_data) {
          helper.saveToBooklist(new_list_data, req, res);
        })
      }
      else helper.saveToBooklist(list_post, req, res);
    });
  });
});

//post new book to buzzlist
router.post('/shelfimport', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  var authorArray = [];
  var bookArray = [];
  var name;
  var shelves = req.body;
  for (var shelfName in shelves) {
    name = shelfName;
    var shelf = shelves[shelfName];
    var bookObjectIdArray = [];
    for (var bookShelf in shelf) {
      var authorObjectIdArray = [];
      bookId = helper.generateObjectId();
      newBook = helper.returnNewBookObjectFromJSON(shelf[bookShelf], bookId)

      for (var authorBook in shelf[bookShelf].authors) {
        authorId = helper.generateObjectId();
        newAuthor = helper.returnNewAuthorObjectFromJson(shelf[bookShelf].authors[authorBook], authorId);
        authorArray.push(newAuthor);
        newBook.author.push(shelf[bookShelf].authors[authorBook].id);
      }
      bookObjectIdArray.push(shelf[bookShelf].id);
      bookArray.push(newBook);
    }
    console.log(bookObjectIdArray);
  }

  User.findOne({ _id: decoded._id }, function (err, data) {
    if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
    if (!data) return res.status(403).send({ success: false, msg: 'no user found' });
    Buzzlist.findOne({ user: decoded._id, list_name: shelfName }, function (err, list_post) {
      if (err) return res.status(403).send({ success: false, msg: 'error with finding list' });
      Author.collection.insertMany(authorArray, { continueOnError: true, ordered: false, safe: true }, function (err, mongooseDocuments) {
        if (err) console.log("99" + err);
        Book.collection.insertMany(bookArray, { continueOnError: true, ordered: false, safe: true }, function (err, mongooseDocuments) {
          if (err) console.log("101" + err);
          if (list_post == null) {
            console.log("list found");
            list = helper.returnBuzzListObjectFromJson(name, bookObjectIdArray, decoded._id);
            list.save(function (error, new_list_data) {
              if (err) return res.status(403).send({ success: false, msg: 'error saving list' });
              res.json({ success: true })
            })
          }
          else {
            console.log("not found");
            list_post.update({'user': decoded._id, 'list_name' :name }, { $push: { 'book_list': bookObjectIdArray } }, function (err, data) {
              if (err) return res.status(403).send({ success: false, msg: 'error updating list' });
              res.json({ success: true })
            })
          }
        });
      });
    })

  });
})

//update general booklist w token
router.put("/", passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  helper.updateBuzzlistName(decoded._id, req.body.id, req.body.name, res);
})


//delete booklist w token     -- do i check if book exists somewhere else? and if it does delete it?
router.delete('/:id', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  helper.deleteBuzzlist(decoded._id, req.params.id, res)
})

//delete book from existing booklist w token
router.delete('/book/:buzzlistid/:book', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  helper.findBuzzlistAndRemoveBook(decoded._id, req.params.buzzlistid, req.params.book, res)
})

module.exports = router;


