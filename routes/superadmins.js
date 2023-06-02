const SuperAdmin = require('../models/superadmin')
const Admin = require('../models/admin')
// const restifyClients = require('restify-clients')
// const http = require('http')
const mongoose = require('mongoose')
const config = require('../config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const controller = require('./Contollers')
// let k = 0
// const client = restifyClients.createJsonClient({
//     url: 'http://localhost:3000' // Replace with the appropriate URL
//   });

module.exports = server =>{

    server.get('/superadmin', (req, res, next)=>{
        SuperAdmin.find({}, '-password').populate('adminassign')
        .then(response=>{
            res.status(200)
            res.json({
                response
            })
        })
        .catch(error=>{
            res.json({message:"Error occured while retreinving the data"})
        })
    })   

    server.post('/registration', [controller.insert])
    server.patch('/updatepassword', [
      controller.validJWTNeeded,
      controller.updatepassword
    ])
    
    server.post('/auth', [
      controller.isPasswordMatch,
      controller.login
    ])

    server.get('/superadmininfo', [
      controller.validJWTNeeded,
      controller.superadmininfo
    ])
    
    server.put('/superadmin/addadmin', [
      controller.validJWTNeeded,
      controller.addadmin
    ])

    server.patch('/updatesuperadmin', [
      controller.validJWTNeeded,
      controller.updatesuperadmin
    ])
  
    server.patch('/superadmin/updateadmin', [
      controller.validJWTNeeded,
      controller.updateadmin
    ])
    
    server.del('/superadmin/deleteadmin', [
      controller.validJWTNeeded,
      controller.deleteadmin
    ])

}