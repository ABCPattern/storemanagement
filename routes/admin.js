const controller = require('../Controllers/admin')
const config = require('../config')
const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ")
    const token = bearer[1]
    jwt.verify(token, config.secret, (err, encoded) => {
      if (err) {
        return res.send("Invalid token")
      }
      else {
        next()
      }
    })
  }
  else {
    return res.send(401, { error: "Invalid token" })
  }
}

module.exports = server => {

  server.get('/admin', [controller.getAdmin])

  server.post('/loginadmin', [controller.loginAdmin])

  server.get('/admininfo/:id', [
    verifyToken,
    controller.adminInfo
  ])

  server.put('/admin/updateproduct', [
    verifyToken,
    controller.updateProduct
  ])

  server.del('/admin/deleteproduct', [
    verifyToken,
    controller.deleteProduct
  ])


}