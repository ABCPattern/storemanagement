const controller = require('../Controllers/admin')
const auth = require('../authentication')
const config = require('../config')
const jwt = require('jsonwebtoken')

module.exports = server => {

  server.get('/admin', [controller.getAdmin])

  server.get('/admininfo/:id', [
    auth.validJWTNeeded,
    controller.adminInfo
  ])

  server.put('/superadmin/:sid/admin/:id', [
    auth.validJWTNeeded,
    controller.updateadmin
  ])

  server.del('/superadmin/:sid/admin/:id', [
    auth.validJWTNeeded,
    controller.deleteadmin
  ])


  
}