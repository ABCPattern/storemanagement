const { User, Admin, SuperAdmin } = require('../models/user')
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
  const data = await Admin.find().populate('categoryId').limit(per_page).skip(skipitems)//output is promise hence use of then and catch method
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

exports.updateadmin = async (req, res) => {
  try {
      const sid = req.params.sid
      const id = req.params.id;
      let k = 0;
      const sadmin = await SuperAdmin.findOne({ _id: sid });
      const adminid = await Admin.findOne({ _id: id });

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
      if (req.body) {
          const updated_data = {
              "name": req.body.name,
              "address": req.body.address
          }
          for (let i = 0; i < sadmin.adminassign.length; i++) {
              console.log(sadmin.adminassign[i])
              if (id.toString() == sadmin.adminassign[i].toString()) {
                  console.log("dsvfj")
                  k = 1;
                  await Admin.findByIdAndUpdate(
                      id,
                      { $set: updated_data }
                  )
                  if (req.body.categoryId) {
                      const newcategoryId = req.body.categoryId

                      if (typeof newcategoryId === "string") {
                          for (let k = 0; k < adminid.categoryId.length; k++) {
                              if (newcategoryId.toString() == adminid.categoryId[k].toString()) {
                                  let category = await Category.findOne({ _id: newcategoryId })
                                  res.status(409)
                                  res.json({
                                      success: false,
                                      message: `Already assigned to category ${newcategoryId}:${category.name}`
                                  })
                                  return
                              }
                          }
                          const category = await Category.findOne({ _id: newcategoryId })
                          if (!category) {
                              res.status(404)
                              res.json({
                                  success: false,
                                  message: "Category not found"
                              })
                              return
                          }
                          console.log(newcategoryId)
                          await Admin.updateOne(
                              { _id: id },
                              { $push: { categoryId: newcategoryId } }
                          )

                          res.status(200);
                          res.json({
                              message: "Admin updated successfully"
                          })
                          return

                      }

                      if (Array.isArray(newcategoryId)) {

                          for (let x = 0; x < newcategoryId.length; x++) {
                              let category = await Category.findOne({ _id: newcategoryId[x] })
                              if (!category) {
                                  res.status(404)
                                  res.json({
                                      success: false,
                                      message: "Category not found"
                                  })
                                  return
                              }
                          }
                          for (let k = 0; k < adminid.categoryId.length; k++) {
                              for (let j = 0; j < newcategoryId.length; j++) {
                                  if (adminid.categoryId[k].toString() == newcategoryId[j].toString()) {
                                      let category = await Category.findOne({ _id: newcategoryId[j] })
                                      res.status(409)
                                      res.json({
                                          success: false,
                                          message: `Already assigned to category ${newcategoryId[j]}:${category.name}`
                                      })
                                      return
                                  }
                              }

                          }

                          await Admin.updateOne(
                              { _id: id },
                              { $push: { categoryId: { $each: newcategoryId } } }
                          )

                          res.status(200);
                          res.json({
                              message: "Admin updated successfully",
                          })
                          return

                      }
                  }

                  res.status(200);
                  res.json({ message: "Admin updated successfully" });
                  return;
              }

          }
          if (k !== 1) {
              res.status(409)
              res.json({
                  message: "Update for this user is not allowed"
              })
              return
          }
      }
      else {
          req.status(403)
          req.json({
              success: false,
              message: "Please provide new data to update"
          })
      }
  }
  catch (error) {
      res.status(500);
      res.send({ message: `Internal server error occurred while updating the admin: ${error}` })
      return
  }
}

exports.deleteadmin = async (req, res) => {
  try {
      const id = req.params.id;
      const sid = req.params.sid
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
      const sadmin = await SuperAdmin.findOne({ _id: sid });

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
              await SuperAdmin.findByIdAndUpdate(sid, { $pull: { adminassign: id } })
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
      res.json({ message: `Internal server error occurred while deleting the admin: ${error}` })
      return
  }
}
