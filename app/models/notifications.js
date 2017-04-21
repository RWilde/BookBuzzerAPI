var mongoose = require('mongoose')

var BookNotifications = new mongoose.Schema({
    book_id : Number,
    type: String,
    message: String,
    read: Boolean
});

var NotificationsSchema = new mongoose.Schema({
    book_list : [{books: [BookNotifications]}],
    user : [{type: mongoose.Schema.Types.ObjectId, ref : 'User'}]
});

module.exports = mongoose.model ('Notifications', NotificationsSchema);