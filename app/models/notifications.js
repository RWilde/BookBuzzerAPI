var mongoose = require('mongoose')

var NotificationList = new mongoose.Schema({
    book_id : Number,
    type: String,
    message: String,
    read: Boolean
});

var NotificationsSchema = new mongoose.Schema({
    book_list : [NotificationList],
    user : [{type: mongoose.Schema.Types.ObjectId, ref : 'User'}]
});

module.exports = mongoose.model ('Notifications', NotificationsSchema);
