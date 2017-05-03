var passport = require('passport');
var express = require('express');
var router = express.Router();
require('../../config/passport')(passport);
var jwt = require('jwt-simple');
var config = require('../../config/database');
var User = require('../models/user');

var mongoose = require('mongoose');
var watch = require('../models/watch'); // get the mongoose model
var helper = require('../functions/helper.js');
var checker = require('../functions/PriceChecker.js');
bodyParser = require('body-parser');
var book = require('../models/books');
var Buzzlist = require('../models/buzzlist');
var Author = require('../models/authors'); // get the mongoose model

//get watch books
router.get('/book', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);

    if (!token) return res.status(403).send({ success: false, msg: 'No token provided.' });
    watch.find({ user: user, list_name: name }, function (err, post) {
        if (err) return next(err);
        var books = []
        for (var bookList in post.book_list) {
            books.push(bookList.book_id);
        }

        book.find({ 'work_id': { $in: [books] } }, function (err, docs) {
            if (err) return next(err);
            return docs;
        });
    });

});

//post new book to watch
router.post('/book', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);
    console.log(req.body.list_name);

    if (!token) return res.status(403).send({ success: false, msg: 'No token provided.' });
    watch.findOne({ user: decoded._id }, function (err, watch_result) {
        if (err) console.log("1" + err);
        if (watch_result != null) {
            book.findOne({ work_id: req.body.id }, function (err, book_post) {
                if (err) console.log("2" + err)
                if (book_post != null) {
                    Buzzlist.findOne({ user: decoded._id, list_name: req.body.list_name }, function (err, list_post) {
                        if (err) console.log("3" + err)

                        if (list_post != null) {
                            var found = false;
                            var deleted = false;
                            for (var i = 0; i < list_post.book_list.length; i++) {
                                if (list_post.book_list[i] == req.body.id) {
                                    //remove book from watchlist
                                    helper.removeBookFromWatchList(decoded, req.body.id, res)
                                    found = true;
                                    deleted = true;
                                    break;
                                }
                            }
                            if (found == false) {
                                var book_id = { book_id: list_post._id };
                                Buzzlist.update({ _id: list_post._id }, { $push: { 'book_list': req.body.id } }, function (err, data) {
                                    if (err) console.log("4" + err);
                                    helper.updateWatch(req.body.id, decoded._id, res);
                                })
                            }
                            else if (deleted == false) {
                                helper.updateWatch(req.body.id, decoded._id, res);
                            }
                        }
                        else {
                            buzz = helper.returnBuzzListObjectFromJson(req.body.list_name, req.body.id, decoded._id)
                            buzz.book_list.push(req.body.id);
                            buzz.save(function (error, buzzlist_data) {
                                if (error) console.log("17" + error);
                                helper.updateWatch(req.body.id, decoded._id, res);
                            })
                        }
                    })
                }
                else {
                    var authorObjectIdArray = [];
                    var authorArray = []
                    bookId = helper.generateObjectId();
                    newBook = helper.returnNewBookObjectFromJSON(req.body, authorObjectIdArray, bookId)
                    for (var authorBook in req.body.authors) {
                        authorId = helper.generateObjectId();
                        newAuthor = helper.returnNewAuthorObjectFromJson(req.body.authors[authorBook], authorId);
                        authorArray.push(newAuthor);
                        newBook.author.push(req.body.authors[authorBook].id);

                        var id = req.body.authors[authorBook].id
                        authorObjectIdArray.push(id);
                    }
                    Author.collection.insertMany(authorArray, { ordered: false, safe: true }, function (err, mongooseDocuments) {
                        var books = [];
                        books.push(newBook)
                        newBook.save(function (error, buzzlist_date) {
                            if (err) console.log("7" + err)
                            Buzzlist.findOne({ user: decoded._id, list_name: req.body.list_name }, function (err, list_post) {
                                if (err) console.log("8" + err)
                                if (list_post != null) {
                                    console.log("113");

                                    var found = false;
                                    var deleted = false;
                                    for (var i = 0; i < list_post.book_list.length; i++) {
                                        console.log(list_post.book_list[i])
                                        if (list_post.book_list[i] == req.body.id) {
                                            //remove book from watchlist
                                            helper.removeBookFromWatchList(decoded, req.body.id, res)
                                            found = true;
                                            deleted = true;
                                            break;
                                        }
                                    }
                                    if (found === false) {
                                        var book_id = { book_id: list_post._id };
                                        Buzzlist.update({ _id: list_post._id }, { $push: { 'book_list': req.body.id } }, function (err, data) {
                                            if (err) console.log("4" + err);
                                            helper.updateWatch(req.body.id, decoded._id, res);
                                        })
                                    }
                                    else if (deleted == false) {
                                        helper.updateWatch(req.body.id, decoded._id, res);
                                    }
                                }
                                else {
                                    buzz = helper.returnBuzzListObjectFromJson(req.body.list_name, req.body.id, decoded._id)
                                    buzz.book_list.push(req.body.id);
                                    buzz.save(function (error, buzzlist_data) {
                                        if (error) console.log("19" + error);
                                        helper.updateWatch(req.body.id, decoded._id, res);
                                    })
                                }
                            })
                        })
                    })
                }
            })
        }
        else {
            book.findOne({ work_id: book.book_id }, function (err, book_post) {
                if (err) console.log("10" + err)
                if (book_post != null) {
                    newWatch = helper.returnWatchObjectFromJson(req.body, decoded._id)
                    console.log("163");

                    newWatch.save(function (error, new_list_data) {
                        if (error) console.log("11" + error);
                        res.json({ success: true });
                    })
                }
                else {
                    var authorObjectIdArray = [];
                    var authorArray = []
                    bookId = helper.generateObjectId();
                    newBook = helper.returnNewBookObjectFromJSON(req.body, authorObjectIdArray, bookId)
                    for (var authorBook in req.body.authors) {
                        authorId = helper.generateObjectId();
                        newAuthor = helper.returnNewAuthorObjectFromJson(req.body.authors[authorBook], authorId);
                        authorArray.push(newAuthor);
                        newBook.author.push(req.body.authors[authorBook].id);

                        var id = req.body.authors[authorBook].id
                        authorObjectIdArray.push(id);
                    }

                    Author.collection.insertMany(authorArray, { ordered: false, safe: true }, function (err, mongooseDocuments) {
                        var books = [];
                        books.push(newBook)
                        console.log("188");

                        newBook.save(function (error, buzzlist_date) {
                            if (err) console.log("12" + err)
                            Buzzlist.findOne({ user: decoded._id, list_name: req.body.list_name }, function (err, list_post) {
                                if (err) console.log("13" + err)
                                if (list_post != null) {
                                    console.log("195");
                                    helper.saveNewWatch(req.body.id, decoded._id, res);
                                }
                                else {
                                    console.log("224");
                                    buzz = helper.returnBuzzListObjectFromJson(req.body.list_name, req.body.id, decoded._id)
                                    buzz.save(function (error, buzzlist_data) {
                                        if (error) console.log("15" + error);
                                        helper.saveNewWatch(req.body.id, decoded._id, res);
                                    })
                                }
                            })
                        })
                    })
                }
            })
        }
    })
});


//update book
router.put('/book', function (req, res) {

});

//delete book
router.delete('/book/:id', function (req, res) {
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);
    var bookId = req.params.id;

    helper.removeBookFromWatchList(decoded, bookId, res);

});

//price checker
router.post('/price', passport.authenticate('jwt', { session: false }), function (req, res) {
    var token = helper.getToken(req.headers);
    var decoded = jwt.decode(token, config.secret);
    var bookId = req.params.id;

    var isbn = req.body.isbn

    var jsonArray = []
    User.findOne({ _id: decoded._id }, function (err, data) {
        //finds user
        if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
        if (!data) return res.status(403).send({ success: false, msg: 'no user found' });

        checker.checkPrice(res, isbn);
    })
});

module.exports = router;