const mongoose = require("mongoose")
const mongooserole = require('mongoose-role')
const adminSchema = require("./admin")
const superadminSchema = require("./superadmin")
const Schema = mongoose.Schema
const role = require('mongoose-role')

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
}, {strict:true})

userSchema.plugin(role,{
    roles:['Superadmin', 'Admin'],
    accessLevels:{
        'Superadmin':['Superadmin', 'Admin'],
        'Admin':['Admin']
    }
})

const User = mongoose.model('User', userSchema)

const Admin = User.discriminator('Admin', adminSchema)

const SuperAdmin = User.discriminator('SuperAdmin', superadminSchema)


module.exports = {User, Admin, SuperAdmin}
