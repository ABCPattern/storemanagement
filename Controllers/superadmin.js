const { User, Admin, SuperAdmin } = require('../models/user')
const Product = require('../models/product')
const Category = require('../models/category')
const config = require('../config')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

exports.getSuperadmin = async (req, res) => {
    const page = req.query.page || 2
    const pagesize = req.query.pagesize || 1
    const data = await SuperAdmin.find({}, '-password').populate('adminassign').skip(page).limit(pagesize)
    if(data == ""){
        res.status(400)
        res.json({
            success:false,
            message:"No superadmin exists"
        })
        return
    }
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

exports.addadmin = async (req, res) => {
    try {

        let admin = new Admin({
            username: req.body.uname,
            password: req.body.pass,
            name: req.body.name,
            role: req.body.role,
            categoryId: req.body.categoryId,
            address: req.body.address
        })

        const sadmin = await User.findOne({ _id: req.params.id })
        if (sadmin.role != "Superadmin") {
            res.status(409)
            res.json({
                success: false,
                message: "Only supeadmin allowed to add new admin"
            })
            return
        }
        const existadmin = await User.findOne({ username: req.body.uname })
        if (existadmin) {
            res.status(404)
            res.json({
                success: false,
                message: `${req.body.uname} already exist`
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
            const recent = await User.findOne().sort({ _id: -1 })
            console.log(recent._id)
            const updatesuperadmin = await SuperAdmin.updateOne(
                { _id: (req.params.id) },
                { $push: { adminassign: recent._id } }
            )
            if (updatesuperadmin) {
                res.status(200);
                res.json({
                    message: "Admin is added and Superadmin updated successfully",
                })
                return
            }
            else {
                res.status(500);
                res.json({
                    message: "Internal server error occured while adding new admin",
                })
                return
            }


        }
    }
    catch (error) {
        res.status(500);
        res.json({ success: false, message: `Internal server error occurred while adding new admin: ${error}` })
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
    const user = await User.findById(id)
    if (user.role != "Superadmin") {
        res.status(409)
        res.json({
            success: false,
            message: "Only superadmim is allowed"
        })
        return
    }
    try {
        const superadmin = await SuperAdmin.findOne({ _id: id })
        if (!superadmin) {
            res.status(404);
            res.json({
                success: false,
                message: "Superadmin not found"
            })
            return;
        }

        const adminassign = req.body.adminassign;

        if (typeof adminassign === "string") {
            const existadmin = await Admin.findOne({ _id: adminassign })
            if (!existadmin) {
                res.status(404)
                res.json({
                    success: false,
                    message: "Admin not found"
                })
                return
            }
            const data = await SuperAdmin.find({}).exec();

            data.forEach((sadmin) => {
                for (let i = 0; i < sadmin.adminassign.length; i++) {
                    if (sadmin.adminassign[i].toString() == adminassign.toString()) {
                        k = 1;
                        res.status(409)
                        res.json({
                            success: false,
                            message: `Superadmin already assigned for ${existadmin.username}`
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
            for (let x = 0; x < adminassign.length; x++) {
                const admin = await Admin.findOne({ _id: adminassign[x] })
                if (!admin) {
                    res.status(404)
                    res.json({
                        success: false,
                        message: "Admin not found"
                    })
                    return
                }
            }
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
            message: `Internal server error occurred while updating superadmin ${error}`
        })
        return
    }
}

exports.superadmininfo = async (req, res) => {
    const info = await SuperAdmin.findById(req.params.id).select('adminassign').populate('adminassign')
    if (!info) {
        res.status(500)
        res.json({ success: false, message: `Internal server error  occured while retrieving the superadmin data ${error}` })
        return
    }
    else {
        res.status(200)
        res.json({
            "data": info
        })
        return
    }
}


