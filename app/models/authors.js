var mongoose = require('mongoose')

var AuthorSchema = new mongoose.Schema({
    first_name : String,
    second_name : String,
    blurb : String,
    notified : Boolean,
    update_at : { type: Date, default : Date.now },
    goodreads_id : {
        type: Number, 
        unique: true,
        required: true }
});

module.exports = mongoose.model ('Author', AuthorSchema);
