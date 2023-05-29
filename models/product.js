const mongoose = require("mongoose")
const Schema = mongoose.Schema

const productSchema = new Schema({
    id: {
        type: String,
        required:true
    },
    name:{
        type: String,
        required:true
    },
    description:{
        type: String,
        required:true
    },
    image:{
        type: String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    price:{
        type: String,
        required:true
    },
    stock:{
        type: Number,
        required:true
    },
    dateCreated:{
        type:Date,
        default:Date.now
    }
})

const Product = mongoose.model('Product', productSchema)
module.exports = Product