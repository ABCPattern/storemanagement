const mongoose = require("mongoose")
const Schema = mongoose.Schema

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    categoryId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Category',
        required: true,
        default:[]
    }
})

module.exports = adminSchema