var mongoose = require('mongoose')

var BuzzListSchema = new mongoose.Schema({
    list_name : String,
    book_list : [{ book_id: {type: mongoose.Schema.Types.ObjectId, ref: 'books', required: true}}],
    user : [{type: mongoose.Schema.Types.ObjectId, ref : 'User'}]
    
})

module.exports = mongoose.model ('Buzzlist', BuzzListSchema);
