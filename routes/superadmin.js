const controller = require('../Controllers/superadmin')
const auth = require('../authentication')

module.exports = server => {
  server.get('/superadmin', [controller.getSuperadmin])

  server.post('/registration', [controller.insert])

  server.put('/updatepassword', [
    auth.validJWTNeeded,
    controller.updatepassword
  ])

  server.post('/auth', [
    auth.isPasswordMatch,
    auth.login
  ])

  server.get('/superadmininfo', [
    auth.validJWTNeeded,
    controller.superadmininfo
  ])

  server.put('/superadmin/addadmin', [
    auth.validJWTNeeded,
    controller.addadmin
  ])

  server.put('/updatesuperadmin/:id', [
    auth.validJWTNeeded,
    controller.updatesuperadmin
  ])

  server.put('/superadmin/updateadmin/:aid', [
    auth.validJWTNeeded,
    controller.updateadmin
  ])

  server.del('/superadmin/deleteadmin', [
    auth.validJWTNeeded,
    controller.deleteadmin
  ])

}