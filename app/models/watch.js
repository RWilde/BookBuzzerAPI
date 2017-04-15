var mongoose = require('mongoose')

var WatchSchema = new mongoose.Schema({
    book_list : [{type: Number, unique: true}],
    user : [{type: mongoose.Schema.Types.ObjectId, ref : 'User'}]
});

module.exports = mongoose.model ('Watch', WatchSchema);