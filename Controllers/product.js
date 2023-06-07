const Product = require('../models/product')
const Category = require('../models/category')
const mongoose = require('mongoose')
const Pagination = require('../models/pagination')
const math = require('mathjs')

exports.getProduct = async (req, res) => {
    const per_page = req.query.pagesize || 3
    const current_page = req.query.page || 1
    const doccount = await Product.countDocuments()
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

    const data = await Product.find().populate('category').sort({ _id: 1 }).limit(per_page).skip(skipitems)//output is promise hence use of then and catch method
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

exports.productInfo = (req, res, next) => {
    const id = req.params.id
    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    Product.findById(id).populate('category')
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

exports.addProduct = (req, res, next) => {
    const category = Category.findById(req.body.category)
    if (!category) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category"
        })
        return
    }
    let prod = new Product({
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.stock,
        dateCreated: req.body.dateCreated
    })
    prod.save()
        .then(response => {
            res.status(201)
            res.json({
                message: "New product added successfully!"
            })
            return
        })
        .catch(error => {
            res.status(500)
            res.json({
                success: false,
                message: `An error occured while inserting new product ${error}`
            })
            return
        })
}

exports.updateProduct = (req, res, next) => {
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
        Product.findByIdAndUpdate(id,
            {
                $set: req.body
            })
            .then(() => {
                res.status(200)
                res.json({
                    message: "Product updated successfully"
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

exports.deleteProduct = (req, res, next) => {
    const id = req.params.id
    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    Product.findByIdAndDelete(id)
        .then(() => {
            res.status(200)
            res.json({
                message: `Product deleted successfully`
            })
            return
        })
        .catch(error => {
            res.status(500)
            res.json({
                success: false,
                message: `An error occured while deleting the product ${error}`
            })
            return
        })
}

exports.productCount = async (req, res) => {
    const productcount = await Product.countDocuments();
    if (!productcount) {
        res.status(404)
        res.json({ success: false, message: "No product item is present" })
        return
    }
    else {
        res.status(200)
        res.json({ productcount: productcount })
    }
}

