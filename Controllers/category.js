const Category = require('../models/category')
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
            message: `An error occured while retrieving the data`
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
                message: `An error occured while retreiving data ${error}`
            })
            return
        })
}

exports.addCategory = (req, res, next) => {
    let cate = new Category({
        id: req.body.id,
        name: req.body.name,
        color: req.body.color,
    })
    cate.save()
        .then(response => {
            res.status(201)
            res.json({
                message: `New Category added successfully!\n${response}`
            })
            return
        })
        .catch(error => {
            res.status(500)
            res.json({
                success: false,
                message: `An error occured while inserting new category ${error}`
            })
            return
        })
}

exports.updateCategory = (req, res, next) => {
    const id = req.params.id
    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    if (req.body) {
        Category.findByIdAndUpdate(id,
            {
                $set: req.body
            })
            .then(() => {
                res.status(200)
                res.json({
                    message: "Category updated successfully"
                })
                return
            })
            .catch(error => {
                res.status(500)
                res.json({
                    success: false,
                    message: `An error occured while updating the data ${error}`
                })
                return
            })
    }
    else {
        res.status(200)
        res.json({
            success: true,
            message: "No changes"
        })
        return
    }

}

exports.deleteCategory = (req, res, next) => {
    const id = req.params.id

    const info = Category.findByIdAndRemove(id)
        .then((category) => {
            if (category) {
                res.status(200)
                res.json({
                    message: `Category deleted successfully\n ${category}`
                })
                return
            }
            else {
                res.status(404)
                res.json({
                    success: false,
                    message: `category not found`
                })
                return
            }
        })
        .catch(error => {
            res.status(500)
            res.json({
                success: false,
                message: `An error occured while deleting the category ${error}`
            })
            return
        })
}