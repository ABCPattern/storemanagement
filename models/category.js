const mongoose = require("mongoose")
const Schema = mongoose.Schema

const categorySchema = new Schema({
    id: {
        type: String,
        required:true
    },
    name:{
        type: String,
        required:true
    },
    color:{
        type: String,
        required:true
    }
})

const Category = mongoose.model('Category', categorySchema)
module.exports = Category