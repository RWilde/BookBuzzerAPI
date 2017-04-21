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

var watch = require('../models/watch'); // get the mongoose model
var Notifications = require('../models/notifications'); // get the mongoose model
var helper = require('../functions/helper.js');
var bodyParser = require('body-parser');

//get watch books
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findOne({ _id: decoded._id }, function (err, data) {
        notification.find({ user: decoded._id }, function (err, post) {
            res.json(JSON.stringify(post));
        })
    })
});

//post new book to watch
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    console.log("here");
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);

    var notifications = req.body;
    var notificationArray = [];

    for (var i in notifications) {
        var n = notifications[i];
        var entry = new Object(
            {
                book_id: n.goodreadsId,
                type: n.type,
                message: n.message,
                read: n.read
            })
        console.log(entry)
        notificationArray.push(entry);
    }
    //notificationObject.book_list = notificationArray;
    var notificationObject = helper.CreateNotificationObject(decoded._id, notificationArray)

    User.findOne({ _id: decoded._id }, function (err, data) {
        Notifications.findByIdAndUpdate({ _id: decoded._id }, { $push: { 'book_list': notificationArray } }, function (err, result) {
            if (err) return res.json({ success: false, error: err })
            if (result) res.json({ success: true })
            else {
                notificationObject.save(function (err, post) {
                    if (err) res.json({ success: false })
                    else {
                        res.json({ success: true })
                    }
                })
            }
        });

    })
});

//update book when read
router.put('/id=:id&type=:type', passport.authenticate('jwt', { session: false }), function (req, res) {
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);

    var n = req.body;

    User.findOne({ _id: decoded._id }, function (err, data) {
        if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
        if (!data) return res.status(403).send({ success: false, msg: 'no user found' });
        //find out how to search nested model

        var entry = new Object(
            {
                book_id: n.id,
                type: n.type,
                message: n.message,
                read: n.read
            })

        Notifications.findByIdAndUpdate({ _id: decoded._id }, { $push: { 'book_list': entry } }, function (err, result) {
            if (err) return res.json({ success: false, error: err })
            res.json({ success: true })
        });
    })
});

//update book when read
router.put('/read/id=:id&type=:type', passport.authenticate('jwt', { session: false }), function (req, res) {
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);

    var bookId = req.params.id;
    var type = req.params.type;

    User.findOne({ _id: decoded._id }, function (err, data) {
        if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
        if (!data) return res.status(403).send({ success: false, msg: 'no user found' });
        //find out how to search nested model

        Notifications.findByIdAndUpdate({ _id: decoded._id, 'book_list.book_id': req.params.id, 'book_list.type' : type  }, { $push: { 'book_list.read': true } }, function (err, result) {
            if (err) return res.json({ success: false, error: err })
            res.json({ success: true })
        });
    })
});

//delete book
router.delete('/id=:id&type=:type', passport.authenticate('jwt', { session: false }), function (req, res) {
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);

    var bookId = req.params.id;
    var type = req.params.type;
    User.findOne({ _id: decoded._id }, function (err, data) {
        if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
        if (!data) return res.status(403).send({ success: false, msg: 'no user found' });
        //find out how to search nested model
        Notifications.findOne({ user: decoded._id }, function (err, post) {
            if (err) return res.json({ success: false, err: err })
            booklist = post.book_list;
            for (var i in booklist) {
                var book = booklist[i]
                if (book.book_id == bookId && book.type == type) {
                    Notificiat.findByIdAndUpdate(post._id, {
                        '$pull': {
                            'book_list': { '_id': new ObjectId(book._id) }
                        }
                    });
                }
            }
        })
    })
});

module.exports = router;