const mongoose = require("mongoose")
const Schema = mongoose.Schema

const superadminSchema = new Schema({
    adminassign: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Admin',
        default: []
    }
})

module.exports = superadminSchema