var mongoose = require('mongoose')

var Books = new mongoose.Schema({
    name : String,
    blurb : String,
    release_date : { type: Date, default : Date.now },
    notified : Boolean,
    price_drop : Boolean,
    author_id : [{type: mongoose.Schema.Types.ObjectId, ref: 'Author'}],
    update_at : { type: Date, default : Date.now },
    work_id: {type: Number, 
        unique: true,
        required: true,},   
});

module.exports = mongoose.model ('Book', Books);
