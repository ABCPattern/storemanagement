const controller = require('../Controllers/admin')
const auth = require('../authentication')
const config = require('../config')
const jwt = require('jsonwebtoken')

module.exports = server => {

  server.get('/admin', [
    auth.validJWTNeeded,
    controller.getAdmin])

  server.get('/admin/:id', [
    auth.validJWTNeeded,
    controller.adminInfo
  ])

  server.put('/admin/:id', [
    auth.validJWTNeeded,
    controller.updateadmin
  ])

  server.del('/admin/:id', [
    auth.validJWTNeeded,
    controller.deleteadmin
  ])
  
}