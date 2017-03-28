var mongoose = require('mongoose')

var AuthorSchema = new mongoose.Schema({
    name : String,
    blurb : String,
    img : String,
    link: String,
    avg_rating: Number,
    ratings_count: Number,
    review_count: Number,
    notified : Boolean,
    update_at : { type: Date, default : Date.now },
    goodreads_id : {
        type: Number, 
        unique: true,
        required: true }
});

module.exports = mongoose.model ('Author', AuthorSchema);
