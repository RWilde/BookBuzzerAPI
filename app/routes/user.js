var passport = require('passport');
var express = require('express');
var router = express.Router();
require('../../config/passport')(passport);

var mongoose = require('mongoose');
var User = require('../models/user');
var Buzzlist = require('../models/buzzlist');
var helper = require('../functions/helper.js');
var jwt = require('jwt-simple');
var config = require('../../config/database');

// create a new user account (POST http://localhost:8080/api/signup)
router.post('/signup', function (req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({ success: false, msg: 'Please pass name and password.' });
  } else {
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    // save the user
    newUser.save(function (err) {
      if (err) {
        res.json({ success: false, msg: 'Username already exists.' });
        throw err;
      }
      res.json({ success: true, msg: 'Successful created new user.' });
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/authenticate', function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) throw err;
    if (!user) {
      console.log("user not found")
      return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // return the information including token as JSON
          Buzzlist.find({ user: user._id }, function (err, lists) {
            token = jwt.encode(user, config.secret);
            if (err) return res.json({ success: true, token: 'JWT ' + token });
            if (lists) {
              helper.getEverything(lists, res, token, user._id)
            }
            else {
              res.json({ success: true, token: 'JWT ' + token });
            }
          });
        } else {
          return res.status(403).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        }
      });
    }
  });
});

router.post('/authenticateGoodreads', function (req, res) {
  User.findOne({
    goodreads_id: req.body.goodreads_id
  }, function (err, user) {
    if (err) throw err;

    if (!user) {
      console.log("user not found")
      return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
      // check if password matches
      var token = jwt.encode(user, config.secret);
      // return the information including token as JSON
      res.json({ success: true, token: 'JWT ' + token });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
router.get('/memberinfo', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  console.log('the token: ' + token);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      email: decoded.email
    }, function (err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
      } else {
        res.json({ success: true, msg: 'Welcome in the member area ' + user.email + '!' });
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'No token provided.' });
  }
});

router.put('/updategoodreadsId', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);
  User.findOneAndUpdate({ _id: decoded._id }, { $set: { goodreads_id: req.body.goodreads_id } }, function (err, doc) {
    if (err) {
      return res.status(403).send({ success: false, msg: 'error saving goodreads_id' })
    }
  })
});

router.put('/updatename', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);
  User.findOneAndUpdate({ _id: decoded._id }, { $set: { name: req.body.name } }, function (err, doc) {
    if (err) return res.status(403).send({ success: false, msg: 'error saving goodreads_id' })
    User.findOne({ _id: decoded._id }, function (err, doc) {
      token = jwt.encode(doc, config.secret);
      res.json({ success: true, token: 'JWT ' + token });
    })
  })
});

router.put('/updatefacebookId', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOneAndUpdate({ email: decoded.email }, { $set: { facebook_id: req.body.facebook_id } }, function (err, doc) {
      if (err) {
        return res.status(403).send({ success: false, msg: 'error saving goodreads_id' })
      }
    })
  }
})

router.post('/signupgoodreads', function (req, res) {
  var newUser = new User({
    goodreads_id: req.body.goodreads_id
  });
  var token;

  User.findOne({
    goodreads_id: req.body.goodreads_id
  }, function (err, user) {
    if (err) throw err;
    if (!user) {
      newUser.save(function (err) {
        if (err) return res.status(403).send({ success: false, msg: 'unable to save user' });
        token = jwt.encode(newUser, config.secret);
        res.json({ success: true, token: 'JWT ' + token });
      });
    }
    else {
      Buzzlist.find({ user: user._id }, function (err, lists) {
        token = jwt.encode(user, config.secret);
        if (err) return res.json({ success: true, token: 'JWT ' + token });
        if (lists) {
          helper.getEverything(lists, res, token, user._id)
        }
        else {
          res.json({ success: true, token: 'JWT ' + token });
        }
      });
    }
  });
}),

  router.post('/signupfacebook', function (req, res) {
    if (!req.body.email || !req.body.password) {
      res.json({ success: false, msg: 'Please pass name and password.' });
    } else {
      var newUser = new User({
        facebook_id: req.body.facebook_id
      });
      // save the user
      newUser.save(function (err) {
        if (err) {
          return res.status(403).send({ success: false, msg: 'unable to save user' });
        }
        var token = jwt.encode(newUser, config.secret);
        // return the information including token as JSON
        res.json({ success: true, token: 'JWT ' + token });
      });
    }
  });

router.get('/sync', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = helper.getToken(req.headers);
  var decoded = jwt.decode(token, config.secret);

  User.findOne({ _id: decoded._id }, function (err, isMatch) {
    // return the information including token as JSON
    Buzzlist.find({ user: user._id }, function (err, lists) {
      token = jwt.encode(user, config.secret);
      if (err) return res.json({ success: true, token: 'JWT ' + token });
      if (lists) {
        helper.getEverything(lists, res, token, user._id)
      }
      else {
        res.json({ success: true, token: 'JWT ' + token });
      }
    });
  })
});

module.exports = router;