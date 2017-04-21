var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var watch = require('../models/watch'); // get the mongoose model
var Notification = require('../models/notifications'); // get the mongoose model
var helper = require('../functions/helper.js');
bodyParser = require('body-parser');

//get watch books
router.get('/book', passport.authenticate('jwt', { session: false }),function (req, res, next) {
    User.findOne({ _id: decoded._id }, function (err, data) {
        notification.find({user: decoded._id}, function(err, post)
        {
            res.json(JSON.stringify(post));
        })
    })
});

//post new book to watch
router.post('/book', passport.authenticate('jwt', { session: false }),function (req, res, next) {
    var notifications = req.body;
    var notificationArray = [];
    for(var i in notifications)
    {
        var n = notifications[i];
        notificationArray.push(helper.CreateNotificationObject(n));
    }

});

//update book whenm read
router.put('/id=:id&type=:type',passport.authenticate('jwt', { session: false }), function (req, res) {
    var bookId = req.params.id;
    var type = req.params.type;

    User.findOne({ _id: decoded._id }, function (err, data) {
    if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
    if (!data) return res.status(403).send({ success: false, msg: 'no user found' });
//find out how to search nested model
        Notification.findOne({})

    })
});

//delete book
route.delete('/book', passport.authenticate('jwt', { session: false }),function (req, res) {

});

module.exports = router;