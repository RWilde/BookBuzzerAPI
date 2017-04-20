var mongoose = require('mongoose');

var User = require('../models/user'); // get the mongoose model
var Author = require('../models/authors'); // get the mongoose model
var Book = require('../models/books'); // get the mongoose model
var buzzlist = require('../models/buzzlist'); // get the mongoose model
var watch = require('../models/watch'); // get the mongoose model

var _this = module.exports = {

    getToken: function (headers) {
        if (headers && headers.authorization) {
            var parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    },

    generateObjectId: function () {
        var ObjectID = require('mongodb').ObjectID;
        return new ObjectID();
    },

    //check if author exists
    getAuthorsIfExists: function (req, res) {
        objectId = _this.generateObjectId();
        author = _this.returnAuthorObject(req, objectId);

        author.save(function (error, data) {
            if (error) {
                res.json(error);
            }
            else {
                res.json(data);
            }
        });
        return objectId;
    },

    returnAuthorObject: function (req, objectId) {
        return new Author(
            {
                _id: objectId,
                first_name: req.body.first_name,
                second_name: req.body.second_name,
                blurb: req.body.blurb,
                notified: req.body.notified,
                goodreads_id: req.body.goodreads_id
            });
    },

    returnNewAuthorObjectFromJson: function (req, objectId) {
        return new Author(
            {
                _id: objectId,
                name: req.name,
                blurb: null,
                img: req.img_url,
                link: req.link,
                avg_rating: req.avg_rating,
                ratings_count: req.ratings_count,
                review_count: req.txt_reviews_count,
                notified: false,
                update_at: { type: Date, default: Date.now },
                goodreads_id: req.id
            })
    },

    returnAuthorObjectFromJson: function (fName, sName, blurb, notified, goodreads, objectId) {
        return new Author(
            {
                _id: objectId,
                first_name: fName,
                second_name: sName,
                blurb: blurb,
                notified: notified,
                goodreads_id: goodreads
            });
    },

    returnBookObject: function (req, objectId, authorId) {
        return new Book({
            _id: objectId,
            name: req.body.name,
            blurb: req.body.blurb,
            release_date: req.body.release_date,
            notified: req.body.notified,
            price_drop: req.body.price_drop,
            author_id: authorId,
            work_id: req.body.work_id
        });
    },

    returnBookObjectFromJSON: function (name, blurb, notified, price_drop, work_id, objectId, authorId) {
        return new Book({
            _id: objectId,
            name: name,
            blurb: blurb,
            notified: notified,
            price_drop: price_drop,
            author_id: authorId,
            work_id: work_id
        });
    },

    returnNewBookObjectFromJSON: function (req, objectId) {
        return new Book({
            _id: objectId,
            name: req.title,
            blurb: req.description,
            release_date: req.date,
            notified: false,
            price_drop: false,
            work_id: req.id,
            isbn: req.isbn,
            isbn13: req.isbn13,
            text_reviews_count: req.txt_reviews_count,
            title: req.title,
            title_without_name: req.title_without_series,
            image_url: req.img_url,
            small_img: req.sml_img_url,
            link: req.link,
            format: req.format,
            edition_info: req.edition,
            publisher: req.publisher,
            avg_rating: req.avg_rating,
            ratings_count: req.ratings_counts,
            yearPublished: req.yearPublished
        });
    },

    returnEmptyBuzzListObject: function (req, token) {
        return new buzzlist({
            list_name: req.body.list_name,
            book_list: [],
            user: token
        })

    },

    returnBuzzListObject: function (req, token, bookArray) {
        return new buzzlist({
            list_name: req.body.list_name,
            book_list: bookArray,
            user: token
        })

    },

    returnBuzzListObjectFromJson: function (req, book, token) {
        return new buzzlist({
            list_name: req,
            book_list: book,
            user: token
        })

    },

    returnNotificationObjectFromJson: function (req, token, bookArray) {
        return new buzzlist({
            list_name: req,
            book_list: bookArray,
            user: token
        })
    },

    returnWatchObjectFromJson: function (req, token) {
        return new watch({
            list_name: req,
            user: token
        })
    },

    getBookIfExists: function (req, res, authorId) {
        objectId = _this.generateObjectId();
        book = _this.returnBookObject(req, objectId, authorId);

        book.save(function (error, data) {
        });

        return objectId;
    },

    getAuthor: function (id) {
        Author.find({ _id: id }, function (err, post) {
            if (err) return next(err);
            console.log(post);
            return post;
        });
    },

    getAuthorByGoodreadsId: function (id) {
        Author.findOne({ 'goodreads_id': id }, '_id', function (err, post) {
            console.log("author_id" + post);
            // if (err) return next(err);
            return post;
        });
    },

    saveBookAndAuthor: function (req) {
        Author.findOne({ 'goodreads_id': id }, '_id', function (err, post) {
            console.log("author_id" + post);
            // if (err) return next(err);
            return post;
        });
    },

    getBook: function (id) {
        Book.find({ work_id: id }, function (err, post) {
            if (err) return next(err);
            return post;
        });
    },

    getBuzzlistById: function (id) {
        buzzlist.find({ _id: id }, function (err, post) {
            if (err) return next(err);
            return post;
        });
    },

    getBuzzlist: function (id) {
        buzzlist.find({ _id: id }, function (err, post) {
            if (err) return next(err);
            var work_ids = []
            var author_ids = []
            for (var i = 0; i < post.length; i++) {
                for (var r = 0; r < post[i].book_list.length; r++) {

                    work_ids.push(post[i].book_list[r])
                }
            }
            var authors = []
            var result = []
            Book.find({ 'work_id': { $in: work_ids } }, function (err, books) {
                for (var t = 0; t < books.length; t++) {
                    for (var m = 0; m < books[t].author.length; m++) {
                        author_ids.push(books[t].author[m])
                    }
                }

                // console.log("helloooo" + author_ids);
                Author.find({ goodreads_id: { $in: author_ids } }, function (err, author) {
                    if (err) console.log("err" + err)
                    //console.log("helloooo" + author)
                    for (var n = 0; n < author.length; n++) {
                        // console.log("helloooo" + authors[n])
                        authors.push(author[n]);
                    }

                    for (var i = 0; i < books.length; i++) {
                        book = books[i]
                        authorForBook = []
                        for (var m = 0; m < author.length; m++) {
                            for (var r = 0; r < author_ids.length; r++) {
                                console.log("260" + author_ids[r])
                                console.log("261" + author[m])

                                if (author_ids[r] == author[m].goodreads_id) {
                                    authorForBook.push(authors[m])
                                }
                            }
                        }
                        var book = _this.createBookObjectForJson(book, authorForBook)
                        result.push(book)
                        // console.log( authorForBook)

                        // console.log("book" + book)
                        //console.log("authors" + authorForBook)
                    }
                    res.json({ success: true, token: 'JWT ' + token, "list": JSON.stringify(result) });

                })


            })

        });
    },

    getEverything: function (lists,res, token) {
        var work_ids = []
        var author_ids = []
        for (var i = 0; i < lists.length; i++) {
            for (var r = 0; r < lists[i].book_list.length; r++) {

                work_ids.push(lists[i].book_list[r])
            }
        }
        var authors = []
        var result = []
        Book.find({ 'work_id': { $in: work_ids } }, function (err, books) {
            for (var t = 0; t < books.length; t++) {
                for (var m = 0; m < books[t].author.length; m++) {
                    author_ids.push(books[t].author[m])
                }
            }
                console.log("hi "+author_ids)

            // console.log("helloooo" + author_ids);
            Author.find({ goodreads_id: { $in: author_ids } }, function (err, author) {
                if (err) console.log("err" + err)
                console.log("here")
                res.json({ success: true, token: 'JWT ' + token, "list": JSON.stringify(lists), "books": JSON.stringify(books), "authors": JSON.stringify(author) });
            })
        })
       // res.json({ success: true, token: 'JWT ' + token, "list": JSON.stringify(lists) });
    },

    createBookObjectForJson: function (book, author) {
        return new Object(
            {
                name: book.name,
                blurb: book.blurb,
                release_date: book.release_date,
                notified: book.notified,
                price_drop: book.price_drop,
                author: JSON.stringify(author),
                update_at: book.update_at,
                work_id: book.work_id,
                isbn: book.isbn,
                isbn13: book.isbn13,
                text_reviews_count: book.text_reviews_count,
                title: book.title,
                title_without_name: book.title_without_name,
                image_url: book.image_url,
                small_img: book.small_img,
                lrg_img: book.lrg_img,
                link: book.link,
                num_pages: book.num_pages,
                format: book.format,
                edition_info: book.edition_info,
                publisher: book.publisher,
                date: book.date,
                avg_rating: book.avg_rating,
                ratings_count: book.ratings_count,
                yearPublished: book.yearPublished
            })
    },

    getBuzzlistByUser: function (user) {
        buzzlist.find({ user: user }, function (err, post) {
            if (err) return next(err);
            return post;
        });
    },

    getBuzzlistByUserAndName: function (user, name) {
        buzzlist.find({ user: user, list_name: name }, function (err, post) {
            if (err) return next(err);
            return post;
        });
    },

    getListIfExists: function (req, res, token) {
        buzzlist.find({ user: token, list_name: req.body.list_name }, function (err, post) {
            if (err) return next(err);
            if (post) {
                return post;
            }
            else {
                return returnEmptyBuzzListObject(req, token)
            }
        });
    },

    saveToBooklist: function (list, req, res) {
        if (req.body.hasOwnProperty('book_list')) {
            //need an array of books
            var bookList = req.body.book_list;
            for (var i in bookList) {
                _this.findBookForBuzzlist(bookList[i], list);
            }
            res.json({ success: true, msg: 'everything worked' });
        }
        else res.json({ success: true, msg: 'everything worked' });
    },

    findBookForBuzzlist: function (book, list) {
        //var work_id = parseInt(book.work_id);
        Book.findOne({ work_id: book.work_id }, function (err, book_post) {
            if (err) return res.status(403).send({ success: false, msg: 'problem finding book' });

            //book doesnt exist, creates new book/author and adds to list
            if (!book_post) _this.createBookAndAddToList(book, list._id);
            //book does exist, uses book id to add to list
            else _this.updateBuzzlistWithNewBookId(list._id, book_post.id);
        });
    },

    createBookAndAddToList: function (book, list_id) {
        var bookId = _this.generateObjectId();
        var name = book.name;
        var blurb = book.blurb;
        var notified = book.notified;
        var price_drop = book.price_drop;
        var author_goodreads_id = book.author_goodreads_id;

        Author.findOne({ 'goodreads_id': author_goodreads_id }, '_id', function (err, post) {
            if (err) return res.status(403).send({ success: false, msg: 'problem when finding author' });
            if (!post) {
                var author_id = _this.generateObjectId();
                var author_first_name = book.author_first_name;
                var author_second_name = book.author_second_name;
                var author_blurb = book.author_blurb;
                var author_notified = book.author_notified;

                //author doesnt exist
                newAuthor = _this.returnAuthorObjectFromJson(author_first_name, author_second_name, author_blurb, author_notified, author_goodreads_id, author_id);
                newAuthor.save(function (err, data) {
                    if (err) return res.status(403).send({ success: false, msg: 'ca not save author' });
                })
            }
            else authorId = post._id;

            newBook = _this.returnBookObjectFromJSON(name, blurb, notified, price_drop, work_id, bookId, authorId);
            newBook.save(function (error, data) {
                if (error) return res.status(403).send({ success: false, msg: 'can not save book' });
                _this.updateBuzzlistWithNewBookId(list_id, data._id)

            })
        });
    },

    updateBuzzlistWithNewBookId: function (id, bookId, res) {
        var book_id = { book_id: bookId };
        buzzlist.update({ _id: id }, { $push: { 'book_list': book_id } }, function (err, data) {
            if (err) return res.status(403).send({ success: false, msg: 'can not update buzzlist with new book' });
        })
    },

    findBuzzlistAndRemoveBook: function (id, buzzlist_name, book, res) {
        User.findOne({ _id: id }, function (err, data) {
            //finds user
            if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
            if (!data) return res.status(403).send({ success: false, msg: 'no user found' });
            Book.findOne({ work_id: book }, function (err, book_post) {
                //finds book using goodreads id
                if (err) res.json({ success: true, msg: 'book didnt exist' });
                if (book_post != null) {
                    //updates buzzlist searching with list name and user token
                    buzzlist.update({ list_name: buzzlist_name, user: id }, { $pull: { "book_list": { book_id: book } } }, function (err) {
                        if (err) return res.status(403).send({ success: false, msg: 'unable to delete list + ' + err });
                        res.json({ success: true, msg: 'book successfully deleted' });
                    });
                }
                else {
                    res.json({ success: true, msg: 'book didnt exist' });
                }
            });
        });
    },

    deleteBuzzlist: function (id, listId, res) {
        User.findOne({ _id: id }, function (err, data) {
            if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
            if (!data) return res.status(403).send({ success: false, msg: 'no user found' });

            buzzlist.remove({ _id: listId }, function (err) {
                if (err) return res.status(403).send({ success: false, msg: 'unable to delete list' });
                res.json({ success: true, msg: 'Buzzlist successfully deleted' });
            });
        });
    },

    updateBuzzlistName: function (id, listId, name, res) {
        User.findOne({ _id: id }, function (err, data) {
            if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
            if (!data) return res.status(403).send({ success: false, msg: 'no user found' });
            console.log(listId)
            buzzlist.update({ _id: listId }, { list_name: name }, function (err) {
                if (err) return res.status(403).send({ success: false, msg: 'unable to change list name' });
                res.json({ success: true, msg: 'book name successfully changed' });
            });
        });
    },

    saveNewWatch: function (book_id, id, res) {
        newWatch = _this.returnWatchObjectFromJson(book_id, id);

        newWatch.book_list.push(book_id);
        console.log("here 1")
        newWatch.save(function (error, new_list_data) {
            if (error) console.log("9" + error);
            res.json({ success: true });
        })
    },

    updateWatch: function (book, id, res) {
        console.log("here")
        watch.update({ _id: id }, { $push: { 'book_list': book } }, function (err, data) {
            if (err) console.log("6" + err)
            console.log(data)
            res.json({ success: true });
        })
    },

    removeBookFromWatchList: function (decoded, bookId, res) {
        User.findOne({ _id: decoded._id }, function (err, data) {
            //finds user
            if (err) return res.status(403).send({ success: false, msg: 'error occured finding user' });
            if (!data) return res.status(403).send({ success: false, msg: 'no user found' });

            console.log(decoded._id + " " + bookId)
            watch.findOneAndUpdate({ user: decoded._id }, { $pull: { "book_list": bookId } }, function (err) {
                if (err) return res.status(403).send({ success: false, msg: 'unable to delete list + ' + err });
                res.json({ success: true });

            });

        });
    }

}
