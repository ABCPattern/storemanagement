const Admin = require('../models/admin')
const SuperAdmin = require('../models/superadmin')
const Product = require('../models/product')
const config = require('../config')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

exports.getSuperadmin = async (req, res) => {
    const page = req.query.page || 2
    const pagesize = req.query.pagesize || 1
    const data = await SuperAdmin.find({}, '-password').populate('adminassign').skip(page).limit(pagesize)
    if (!data) {
        res.status(400)
        res.json({
            success: false,
            message: "No data available"
        })
        return
    }
    else {
        res.status(200)
        res.json({
            "data": data
        })
        return
    }
}

exports.insert = (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    const saltrounds = 10

    SuperAdmin.findOne({ username: username })
        .then(response => {
            if (response) {
                res.status(400)
                res.json({
                    success: false,
                    message: `${username} already exists`
                })
                return
            }

            bcrypt.genSalt(saltrounds, (err, salt) => {
                if (err) {
                    res.status(400)
                    res.json({
                        success: false,
                        message: `Bad request ${err}`
                    })
                    return
                }

                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        res.status(400)
                        res.json({
                            success: false,
                            message: `Bad request ${err}`
                        })
                        return
                    }

                    req.body.password = hash;
                    const sadmin = new SuperAdmin(req.body);
                    sadmin.save()
                        .then(response => {
                            console.log(response);
                            res.status(201)
                            res.json({
                                message: `Registered Successfully id:${response._id}`
                            })
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500)
                            res.json({
                                success: false,
                                message: error.message
                            })
                        })
                })
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500)
            res.json({
                success: false,
                message: err
            })
            return
        })
}


exports.updatepassword = (req, res, next) => {
    try {
        const saltrounds = 10

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
                    console.log(req.query.id)
                    SuperAdmin.updateOne({ _id: req.query.id }, { $set: req.body })
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

    catch (error) {
        res.status(500)
        res.json({ errors: error })
        return
    }

}



exports.addadmin = async (req, res) => {
    try {

        let admin = new Admin({
            username: req.body.uname,
            password: req.body.pass,
            name: req.body.name,
            categoryId: req.body.categoryId,
            address: req.body.address
        })

        const sadmin = await SuperAdmin.findOne({ _id: req.query.id })
        const existadmin = await Admin.findOne({ username: req.body.uname })
        if (existadmin) {
            res.status(404)
            res.json({
                success: false,
                message: "Username already exist"
            })
            return
        }
        if (!sadmin) {
            res.status(404);
            res.json({
                success: false,
                message: "Superadmin not found"
            })
            return;
        }

        const newadmin = await admin.save()
        if (!newadmin) {
            res.status(500)
            res.json({
                success: false,
                message: "Admin not added"
            })
            return
        }
        else {
            const recent = await Admin.findOne().sort({ _id: -1 })

            await SuperAdmin.updateOne(
                { _id: req.query.id },
                { $push: { adminassign: recent._id } }
            )
            res.status(200);
            res.json({
                message: "Admin is added and Superadmin updated successfully",
            })
            return

        }
    }
    catch (error) {
        res.status(500);
        res.json({ success: false, message: `An error occurred while adding the data: ${error}` })
        return
    }
}

exports.updatesuperadmin = async (req, res) => {
    const id = req.params.id;
    let k = 0;

    if (!mongoose.isValidObjectId(id)) {
        res.status(404);
        res.json({
            success: false,
            message: "Invalid Admin id"
        })
        return
    }

    try {
        const superadmin = await SuperAdmin.findOne({ _id: id })
        if (!superadmin) {
            res.status(403);
            res.json({
                success: false,
                message: "Superadmin not found"
            })
            return;
        }

        const adminassign = req.body.adminassign;

        if (typeof adminassign === "string") {
            console.log("String");

            const data = await SuperAdmin.find({}).exec();

            data.forEach((sadmin) => {
                for (let i = 0; i < sadmin.adminassign.length; i++) {
                    if (sadmin.adminassign[i].toString() == adminassign.toString()) {
                        k = 1;
                        res.status(409)
                        res.json({
                            success: false,
                            message: `Superadmin already assigned for ${adminassign}`
                        })
                        return
                    }
                }
            })

            if (k !== 1) {
                await SuperAdmin.updateOne(
                    { _id: id },
                    { $push: { adminassign: adminassign } }
                )

                res.status(200);
                res.json({
                    message: "Superadmin updated successfully"
                })
                return
            }
        }

        if (Array.isArray(adminassign)) {
            const data = await SuperAdmin.find({}).exec();

            data.forEach((sadmin) => {
                for (let i = 0; i < sadmin.adminassign.length; i++) {
                    for (let j = 0; j < adminassign.length; j++) {
                        if (sadmin.adminassign[i].toString() == adminassign[j].toString()) {
                            k = 1;
                            res.status(409);
                            res.json({
                                success: false,
                                message: `Superadmin already assigned for ${adminassign[j]}`
                            })
                            return
                        }
                    }
                }
            })

            if (k !== 1) {
                await SuperAdmin.updateOne(
                    { _id: id },
                    { $push: { adminassign: { $each: adminassign } } }
                )

                res.status(200);
                res.json({
                    message: "Superadmin updated successfully",
                })
                return
            }
        }
    }
    catch (error) {
        res.status(500);
        res.json({
            success: false,
            message: `An error occurred while retrieving data ${error}`
        })
        return
    }
}

exports.superadmininfo = (req, res, next) => {
    SuperAdmin.findById(req.query.id).select('adminassign').populate('adminassign')
        .then(response => {
            res.status(200)
            res.json({
                "data": response
            })
            return
        })
        .catch(error => {
            res.status(500)
            res.json({ success: false, message: `Error occured while retrieving the data ${error}` })
            return
        })
}


exports.updateadmin = async (req, res) => {
    try {
        const aid = req.params.aid
        const id = req.query.id;
        let k = 0;
        const sadmin = await SuperAdmin.findOne({ _id: aid });
        const adminid = await Admin.findOne({ _id: req.query.id });

        if (!sadmin) {
            res.status(404);
            res.send("The superadmin not found");
            return;
        }
        if (!adminid) {
            res.status(404);
            res.send("Invalid Admin id");
            return;
        }

        for (let i = 0; i < sadmin.adminassign.length; i++) {
            if (id.toString() == sadmin.adminassign[i].toString()) {
                k = 1;
                await Admin.findByIdAndUpdate(
                    id,
                    { $set: req.body }
                )

                res.status(200);
                res.json({ message: "Admin updated successfully" });
                return;
            }
        }
        if (k !== 1) {
            res.status(403)
            res.json({
                message: "Update for this user is not allowed"
            })
            return
        }
    }
    catch (error) {
        res.status(500);
        res.send({ message: `An error occurred while updating the data: ${error}` })
        return
    }
}

exports.deleteadmin = async (req, res) => {
    try {
        const id = req.query.id;
        const aid = req.query.aid
        if (!mongoose.isValidObjectId(id)) {
            res.status(404);
            res.json({
                success: false,
                message: "Invalid Admin id"
            })
            return
        }
        const admin = await Admin.findById(id)
        if (!admin) {
            res.status(404)
            res.json({
                message: "Admin not found"
            })
            return
        }
        let k = 0;
        const sadmin = await SuperAdmin.findOne({ _id: aid });

        if (!sadmin) {
            res.status(404);
            res.json({
                message: "Superadmin not found"
            })
            return
        }

        for (let i = 0; i < sadmin.adminassign.length; i++) {
            if (id.toString() == sadmin.adminassign[i].toString()) {
                k = 1;
                if (!mongoose.isValidObjectId(id)) {
                    res.status(404);
                    res.json({
                        message: "Invalid Admin id"
                    })
                    return
                }
                await Admin.findByIdAndDelete(id);
                await SuperAdmin.findByIdAndUpdate(aid, { $pull: { adminassign: id } })
                res.status(200);
                res.json({ message: "Admin deleted successfully" });
                return;
            }
        }
        if (k !== 1) {
            res.status(403)
            res.json({
                message: "Delete for this user is not allowed"
            })
            return
        }
    }
    catch (error) {
        res.status(500);
        res.json({ message: `An error occurred while deleting the data: ${error}` })
        return
    }
}