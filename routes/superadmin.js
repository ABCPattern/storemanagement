const controller = require('../Controllers/superadmin')
const auth = require('../authentication')

module.exports = server => {
  server.get('/superadmin', [
    auth.validJWTNeeded,
    controller.getSuperadmin])

  server.post('/admin', [
    auth.validJWTNeeded,
    controller.addadmin
  ])

  server.get('/superadmin/:id', [
    auth.validJWTNeeded,
    controller.superadmininfo
  ])

  server.put('/superadmin/:id', [
    auth.validJWTNeeded,
    controller.updatesuperadmin
  ])

}