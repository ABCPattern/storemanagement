const controller = require('../Controllers/product')
const auth = require('../authentication')

module.exports = server => {
  server.get('/product', [
    controller.getProduct])

  server.get('/product/:id', [
    controller.productInfo])

  server.post('/product', [
    auth.validJWTNeeded,
    controller.addProduct])

  server.put('/product/:pid', [
    auth.validJWTNeeded,
    controller.updateProduct
  ])

  server.del('/product/:pid', [
    auth.validJWTNeeded,
    controller.deleteProduct
  ])

  server.get('/product/count', [controller.productCount])

  server.get('/category/:id/product', [controller.getProductByCategory])
}