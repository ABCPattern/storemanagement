const { User, Admin, SuperAdmin } = require('../models/user')

const mongoose = require('mongoose')
const Pagination = require('../models/pagination')
const math = require('mathjs')
const config = require('../config')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

exports.insert = async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const role = req.body.role
    const saltrounds = 10
    if (role === "Superadmin") {
        const userinfo = await User.findOne({ username: username })
        if (userinfo) {
            res.status(409)
            res.json({
                success: false,
                message: `${username} already exists`
            })
            return
        }
        else {
            const salt = await bcrypt.genSalt(saltrounds)
            if (!salt) {
                res.status(500)
                res.json({
                    success: false,
                    message: "Error occured while registration"
                })
                return
            }
            else {
                const hash = await bcrypt.hash(password, salt)
                if (!hash) {
                    res.status(500)
                    res.json({
                        success: false,
                        message: "Error occured while registration"
                    })
                    return
                }
                req.body.password = hash;
                const sadmin = new SuperAdmin(req.body);
                const newsuperadmin = await sadmin.save()
                if (newsuperadmin) {
                    res.status(201)
                    res.json({
                        success: true,
                        message: `${username} Registered Successfully`
                    })
                    return
                }
                else {
                    res.status(500)
                    res.json({
                        success: false,
                        message: "Error occured while registration"
                    })
                    return
                }
            }
        }
    }
    else if (role === "Admin") {
        const userinfo = await User.findOne({ username: username })
        if (userinfo) {
            res.status(409)
            res.json({
                success: false,
                message: `${username} already exists`
            })
            return
        }
        else {
            const salt = await bcrypt.genSalt(saltrounds)
            if (!salt) {
                res.status(500)
                res.json({
                    success: false,
                    message: "Error occured while registration"
                })
                return
            }
            else {
                const hash = await bcrypt.hash(password, salt)
                if (!hash) {
                    res.status(500)
                    res.json({
                        success: false,
                        message: "Error occured while registration"
                    })
                    return
                }
                req.body.password = hash;
                const admin = new Admin(req.body);
                const newadmin = await admin.save()
                if (newadmin) {
                    res.status(201)
                    res.json({
                        success: true,
                        message: `${username} Registered Successfully`
                    })
                    return
                }
                else {
                    res.status(500)
                    res.json({
                        success: false,
                        message: "Error occured while registration"
                    })
                    return
                }
            }
        }
    }
}

exports.updatepassword = (req, res, next) => {
    try {
        const saltrounds = 10
        if (!req.body || !req.body.password) {
            res.status(404)
            res.json({
                success: false,
                message: "Please provide new password"
            })
            return
        }
        if (req.body.password) {
            bcrypt.genSalt(saltrounds, (err, salt) => {
                if (err) {
                    res.status(400)
                    res.json({
                        success: false,
                        message: "Bad request"
                    })
                    return
                }
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) {
                        res.status(400)
                        res.json({
                            success: false,
                            message: "Bad request"
                        })
                        return
                    }
                    else {
                        req.body.password = hash
                        User.updateOne({ _id: req.params.id }, { $set: req.body })
                            .then(response => {
                                res.status(200)
                                res.send({
                                    message: `Password updated Successfully`
                                })
                                return
                            })
                            .catch(error => {
                                res.status(500)
                                res.json({
                                    success: false,
                                    message: error
                                })
                                return
                            })
                    }
                })
            })
        }
    }
    catch (error) {
        res.status(500)
        res.json({ errors: error })
        return
    }
}

