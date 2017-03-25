var mongoose = require('mongoose')

var BeeListSchema = new mongoose.Schema({
    list_id : int,
    list_name : string, 
    author_list : { type : array, default : []}
})
module.exports = mongoose.model ('beelist', BeeListSchema);
