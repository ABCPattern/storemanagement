const Category = require('../models/category')
const Product = require('../models/product')
const { User, Admin, SuperAdmin } = require('../models/user')
const mongoose = require('mongoose')
const Pagination = require('../models/pagination')
const math = require('mathjs')


exports.getCategory = async (req, res) => {
    const per_page = req.query.pagesize || 3
    const current_page = req.query.page || 1
    const doccount = await Category.countDocuments()
    const skipitems = (current_page - 1) * per_page
    const pages = Pagination(current_page, per_page, doccount)
    if (current_page <= 0) {
        res.status(400)
        res.json({
            success: false,
            message: "Bad request",
            "paginaton error": "Invalid page access"
        })
        return
    }
    if (current_page > math.ceil(doccount / per_page)) {
        res.status(400)
        res.json({
            success: false,
            message: "Bad request",
            "paginaton error": "Trying to access beyond page-limit"
        })
        return
    }
    const data = await Category.find().limit(per_page).skip(skipitems)//output is promise hence use of then and catch method
    if (!data) {
        res.status(500)
        res.json({
            success: false,
            message: `Internal server error occured while retrieving category data`
        })
        return
    }
    else {
        res.status(200)
        res.json({
            "data": data,
            "pagination": pages
        })
        return
    }
}

exports.categoryInfo = (req, res, next) => {
    const id = req.params.id
    console.log(id)
    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    Category.findById(id)
        .then(response => {
            res.status(200)
            res.json({
                response
            })
            return
        })
        .catch(error => {
            res.status(500)
            res.json({
                success: false,
                message: `Internal server error occured while retreiving category data ${error}`
            })
            return
        })
}

exports.addCategory = async (req, res) => {
    const username = req.decodetoken.username
    let user = await User.findOne({ username: username })
    if (!user) {
        res.status(404)
        res.json({
            success: false,
            message: "User does not exist"
        })
        return
    }
    const sid = user._id
    if (user.role != "Superadmin") {
        res.status(409)
        res.json({
            success: false,
            message: "Only Superadmin can add new category"
        })
        return
    }

    const categories = await Category.find({}).exec()
    if (req.body) {
        if (req.body.color) {
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].color == req.body.color) {
                    res.status(409)
                    res.json({
                        success: false,
                        message: `${req.body.color} already exists`
                    })
                    return
                }
            }
        }
    }
    else {
        res.status(200)
        res.json({
            success: true,
            message: "Please provide new data to add"
        })
        return
    }

    let cate = new Category({
        id: req.body.id,
        name: req.body.name,
        color: req.body.color,
    })
    const newcategory = await cate.save()
    if (!newcategory) {
        res.status(500)
        res.json({
            success: false,
            message: `Internal server error occured while adding new category`
        })
        return
    }
    else {
        res.status(201)
        res.json({
            success: true,
            message: `New Category added successfully!`
        })
        return
    }
}

exports.updateCategory = async (req, res) => {
    const id = req.params.id
    const username = req.decodetoken.username
    let user = await User.findOne({ username: username })
    if (!user) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid user"
        })
        return
    }
    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    if (user.role != "Superadmin") {
        res.status(409)
        res.json({
            success: false,
            message: "Only Superadmin can access the data"
        })
        return
    }
    const categories = await Category.find({}).exec()
    if (req.body) {
        if (req.body.color) {
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].color == req.body.color) {
                    res.status(409)
                    res.json({
                        success: false,
                        message: `${req.body.color} already exists`
                    })
                    return
                }
            }
        }
        const updatecategory = await Category.findByIdAndUpdate(id,
            {
                $set: req.body
            })
        if (!updatecategory) {
            res.status(500)
            res.json({
                success: false,
                message: `Internal server error occured while updating the category`
            })
            return

        }
        else {
            res.status(200)
            res.json({
                success: true,
                message: "Category updated successfully"
            })
            return
        }
    }
    else {
        res.status(200)
        res.json({
            success: true,
            message: "Please provide new data to update"
        })
        return
    }

}

exports.deleteCategory = async (req, res) => {
    const id = req.params.id
    const username = req.decodetoken.username
    let user = await User.findOne({ username: username })
    if (!user) {
        res.status(404)
        res.json({
            success: false,
            message: "User does not exist"
        })
        return
    }
    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    if (user.role != "Superadmin") {
        res.status(409)
        res.json({
            success: false,
            message: "Only Superadmin can access the data"
        })
        return
    }
    const category = await Category.findOne({ _id: id })
    const data = await Product.find({ category: id }).populate('category').exec()
    if (data == "") {
        const deletecategory = await Category.findByIdAndRemove(id)
        if (!deletecategory) {
            res.status(404)
            res.json({
                success: false,
                message: `Category does not exist`
            })
            return
        }
        else {
            res.status(200)
            res.json({
                message: `Category deleted successfully!`
            })
            return
        }
    }
    else {
        res.status(403)
        res.json({
            success: false,
            message: `Product are present for ${id}:${category.name}`
        })
    }

}

