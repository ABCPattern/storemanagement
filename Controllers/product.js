const Product = require('../models/product')
const { User, Admin, SuperAdmin } = require('../models/user')
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
            message: `Internal server error occured while retrieving product data`
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

exports.productInfo = async (req, res) => {
    const id = req.params.id

    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid product id"
        })
        return
    }

    const productinfo = await Product.findById(id).populate('category')
    if (productinfo) {
        res.status(200)
        res.json({
            success: true,
            data: productinfo
        })
        return
    }
    else {
        res.status(404)
        res.json({
            success: false,
            message: `Product not found`
        })
        return
    }
}

exports.addProduct = async (req, res) => {
    const sid = req.params.sid

    if (!mongoose.isValidObjectId(sid)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid user id"
        })
        return
    }
    let user = await User.findById(sid)
    if (!user) {
        res.status(404)
        res.json({
            success: false,
            message: "User not found"
        })
        return
    }
    if (user.role != "Superadmin") {
        res.status(409)
        res.json({
            success: false,
            message: "Only Superadmin can add new product"
        })
        return
    }
    if (!mongoose.isValidObjectId(req.body.category)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    const category = await Category.findById(req.body.category)

    if (!category) {
        res.status(404)
        res.json({
            success: false,
            message: "Category not found"
        })
        return
    }
    let prod = new Product(
        req.body
    )
    const newproduct = await prod.save()
    if (newproduct) {
        res.status(201)
        res.json({
            message: "New product added successfully!"
        })
        return
    }
    else {
        res.status(500)
        res.json({
            success: false,
            message: `Internal server error occured while adding a new product`
        })
        return
    }
}

exports.updateProduct = async (req, res) => {
    try {
      const uid = req.params.uid
      const pid = req.params.pid
      if (!mongoose.isValidObjectId(uid)) {
        res.status(404)
        res.json({
          success: false,
          message: "Invalid user id"
        })
        return
      }
      if (!mongoose.isValidObjectId(pid)) {
        res.status(404)
        res.json({
          success: false,
          message: "Invalid product id"
        })
        return
      }
      let k = 0;
      const user = await User.findOne({ _id: uid })
      const product = await Product.findOne({ _id: pid })
      if (!user) {
        res.status(404);
        res.json({
          success: false,
          message: "Admin not found"
        })
        return
      }
      if (!product) {
        res.status(404);
        res.json({
          success: false,
          message: "Product not found"
        })
        return
      }
      if (user.role == "Superadmin") {
        if (req.body) {
          const updateproduct = await Product.findByIdAndUpdate(pid,
            {
              $set: req.body
            })
          if (!updateproduct) {
            res.status(500)
            res.json({
              success: false,
              message: `Internal server error occured while updating the product`
            })
            return
          }
          else {
            res.status(200)
            res.json({
              success: true,
              message: "Product updated successfully"
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
      if (user.role == "Admin") {
        const admin = await Admin.findOne({ _id: uid })
        if (req.body) {
          for (let i = 0; i < admin.categoryId.length; i++) {
            if (lodash.isEqual(admin.categoryId[i], product.category)) {
              const updatedoc = await Product.findByIdAndUpdate(pid, { $set: req.body })
              if (updatedoc) {
                res.status(200)
                res.json({
                  success: true,
                  message: "Product updated successfully"
                })
              }
              else if (!updatedoc) {
                res.status(500)
                res.json({
                  success: false,
                  message: `Error occured while updating the data`
                })
                return
              }
            }
            else {
              res.status(409)
              res.json({
                success: false,
                message: `Update for ${pid}:${product.name} is not allowed`
              })
              return
            }
          }
        }
        else {
          res.status(403)
          res.json({
            success: false,
            message: "Please provide new data to update"
          })
          return
        }
      }
    }
    catch (error) {
      res.status(500);
      res.json({ success: false, message: `An error occurred while updating the data: ${error}` })
      return
    }
  }
  
  exports.deleteProduct = async (req, res) => {
    try {
      const uid = req.params.uid
      const pid = req.params.pid
      if (!mongoose.isValidObjectId(uid)) {
        res.status(404)
        res.json({
          success: false,
          message: "Invalid user id"
        })
        return
      }
      if (!mongoose.isValidObjectId(pid)) {
        res.status(404)
        res.json({
          success: false,
          message: "Invalid product id"
        })
        return
      }
      let k = 0;
      const user = await Admin.findOne({ _id: uid })
      const product = await Product.findOne({ _id: pid })
      if (!user) {
        res.status(404);
        res.json({
          success: false,
          message: "Admin not found"
        })
        return
      }
      if (!product) {
        res.status(404);
        res.json({
          success: false,
          message: "Product not found"
        })
        return
      }
      if (user.role == "Superadmin") {
        const deleteproduct = await Product.findByIdAndDelete(pid)
        if (!deleteproduct) {
          res.status(500)
          res.json({
            success: false,
            message: `Internal server error occured while deleting the product`
          })
          return
        }
        else {
          res.status(200)
          res.json({
            success: true,
            message: `Product deleted successfully`
          })
          return
        }
      }
      if (user.role == "Admin") {
        const admin = await Admin.findOne({ _id: uid })
        for (let i = 0; i < admin.categoryId.length; i++) {
          if (lodash.isEqual(admin.categoryId[i], product.category)) {
            k = 1
            const deleted_product = await Product.findByIdAndDelete(pid)
            if (!deleted_product) {
              res.status(500)
              res.json({
                success: false,
                message: "Internal server error occured while deleting the data"
              })
              return
            }
            res.status(200)
            res.json({ success: true, message: `Product deleted successfully\n ${deleted_product}` })
            return
          }
        }
        if (k != 1) {
          res.status(409)
          res.json({
            success: false,
            message: `Delete for ${pid}:${product.name} is not allowed`
          })
          return
        }
      }
  
  
    }
    catch (error) {
      res.status(500);
      res.json({ success: false, message: `An error occurred while updating the data: ${error}` })
      return
    }
  
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
        res.json({ success: true, productcount: productcount })
    }
}

exports.getProductByCategory = async (req, res) => {
    const id = req.params.id
    if (!mongoose.isValidObjectId(id)) {
        res.status(404)
        res.json({
            success: false,
            message: "Invalid category id"
        })
        return
    }
    const categoryid = await Category.findById(id)
    // console.log(categoryid)
    if (!categoryid) {
        res.status(404)
        res.json({
            success: false,
            message: "Category not found"
        })
        return
    }
    const data = await Product.find({ category: id }).populate('category').exec()
    // console.log(data)
    if (!data) {
        res.status(500)
        res.json({
            success: false,
            message: "Internal server error occured while retrieving product data"
        })
        return
    }
    res.status(200)
    res.json({
        "data": data
    })
    return
}