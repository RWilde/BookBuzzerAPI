var mongoose = require('mongoose')

var Books = new mongoose.Schema({
    name : String,
    blurb : String,
    release_date : String,
    notified : Boolean,
    price_drop : Boolean,
    author_id : [{type: mongoose.Schema.Types.ObjectId, ref: 'Author'}],
    update_at : { type: Date, default : Date.now },
    work_id: {type: Number, 
        unique: true,
        required: true,},

    isbn: String,
    isbn13: String,
    text_reviews_count: Number,
    title: String,
    title_without_name: String,
    image_url: String,
    small_img: String,
    lrg_img: String,
    link : String,
    num_pages: Number,
    format: String,
    edition_info: String,
    publisher: String,
    date: String,
    avg_rating : Number,
    ratings_count : Number,
    yearPublished : Number
});

module.exports = mongoose.model ('Book', Books);
