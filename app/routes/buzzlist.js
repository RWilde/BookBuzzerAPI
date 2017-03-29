var passport = require('passport');
var express = require('express');
var router = express.Router();
require('../../config/passport')(passport);
var jwt = require('jwt-simple');
var config = require('../../config/database');

var mongoose = require('mongoose');
var Buzzlist = require('../models/buzzlist');
var book = require('../models/books');
var User = require('../models/user');
var helper = require('../functions/helper.js');
var Author = require('../models/authors'); // get the mongoose model
var bodyParser = require('body-parser');

router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({limit: '50mb'}));

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
  //var data = req.body;
  
//var reqBody = req.request.body.toString();
//reqBody = JSON.parse(reqBody);

console.log(req.body);

  // User.findOne({ _id: decoded._id }, function (err, data) {
  //   if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
  //   if (!data) return res.status(403).send({ success: false, msg: 'no user found' });

  //   list = helper.returnEmptyBuzzListObject(req, decoded._id);
  //   Buzzlist.findOne({ user: decoded._id, list_name: req.body.list_name }, function (err, list_post) {
  //     if (err) return res.status(403).send({ success: false, msg: 'error with finding list' });

  //     if (!list_post) {
  //       list.save(function (error, new_list_data) {
  //         helper.saveToBooklist(new_list_data, req, res);
  //       })
  //     }
  //     else helper.saveToBooklist(list_post, req, res);
  //   });
  // });
});

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
router.delete('/book/:buzzlistid/:bookid', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  helper.findBuzzlistAndRemoveBook(decoded._id, req.params.buzzlistid, req.params.bookid, res)
})

module.exports = router;


