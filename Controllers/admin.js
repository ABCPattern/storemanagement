const Admin = require('../models/admin')
const Product = require('../models/product')
const config = require('../config')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Pagination = require('../models/pagination')
const math = require('mathjs')


exports.getAdmin = async (req, res) => {
  const per_page = req.query.pagesize || 3
  const current_page = req.query.page || 1
  const doccount = await Admin.countDocuments()
  const skipitems = (current_page - 1) * per_page
  // console.log(doccount)
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
  const data = await Admin.find().limit(per_page).skip(skipitems)//output is promise hence use of then and catch method
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

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body

  const admin = await Admin.findOne({ username: username })
  if (!admin) {
    res.status(404);
    res.json({
      success: false,
      message: "Admin not found"
    })
    return
  }
  if (admin && bcrypt.compare(password, admin.password)) {
    const token = jwt.sign({ username }, config.secret, { expiresIn: '1d' })
    res.status(200)
    res.json({
      "token": token
    })
    return
  }
  else {
    res.status(401)
    res.json({
      success: false,
      message: "Invalid username or password"
    })
    return
  }
}

exports.adminInfo = (req, res, next) => {
  const id = req.params.id
  if (!mongoose.isValidObjectId(id)) {
    res.status(404)
    res.json({
      success: false,
      message: "Invalid Admin id"
    })
    return
  }
  Admin.findById(id)
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

exports.updateProduct = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const id = req.query.id
    let k = 0;
    const admin = await Admin.findOne({ username: username })
    const product = await Product.findOne({ _id: id })
    //   console.log(product)
    let description, image, category, price, stock
    description = req.body.description || product.description
    image = req.body.image || product.image
    category = req.body.category || product.category
    price = req.body.price || product.price
    stock = req.body.stock || product.stock

    console.log(description, image, category, price, stock)
    if (!admin) {
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

    if (admin && bcrypt.compare(password, admin.password)) {

      if (lodash.isEqual(admin.categoryId, product.category)) {
        const updatedoc = await Product.findByIdAndUpdate(id, { $set: { description: description, image: image, category: category, price: price, stock: stock } })
        if (updatedoc) {
          res.status(200)
          res.json({
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
        res.status(403)
        res.json({
          success: false,
          message: "Update is not allowed"
        })
        return
      }
    } else {
      res.status(401);
      res.json({
        success: false,
        message: "Password is Wrong"
      })
      return;
    }
  } catch (error) {
    res.status(500);
    res.json({ success: false, message: `An error occurred while updating the data: ${error}` })
    return
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const id = req.query.id;
    const product = await Product.findById(id).exec()
    if (!product) {
      res.status(404)
      res.json({
        success: false,
        message: "Product not found"
      })
      return
    }
    let k = 0;
    const admin = await Admin.findOne({ username: username });

    if (!admin) {
      res.status(404);
      res.json({
        success: false,
        message: "Admin not found"
      })
      return;
    }

    if (admin && bcrypt.compare(password, admin.password)) {
      if (lodash.isEqual(admin.categoryId, product.category)) {
        k = 1;
        await Product.findByIdAndDelete(id)
        res.status(200);
        res.json({ message: "Product deleted successfully" });
        return;

      }
    } else {
      res.status(401);
      res.json({
        success: false,
        message: "Password is Wrong"
      });
      return;
    }

    if (k !== 1) {
      res.status(403)
      res.json({
        success: false,
        message: "Delete for this user is not allowed"
      })
      return
    }
  } catch (error) {
    res.status(500);
    res.json({ success: false, message: `An error occurred while deleting the data: ${error}` })
    return
  }
}