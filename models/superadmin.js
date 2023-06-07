const mongoose = require("mongoose")
var mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const superadminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    adminassign: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Admin',
        default: []
    }
})

const SuperAdmin = mongoose.model('SuperAdmin', superadminSchema)

module.exports = SuperAdmin
