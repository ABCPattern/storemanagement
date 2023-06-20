const controller = require('../Controllers/product')
const auth = require('../authentication')

module.exports = server => {
    server.get('/product', [controller.getProduct])

    server.get('/product/:id', [
        auth.validJWTNeeded,
        controller.productInfo])

    server.post('/product/user/:sid', [controller.addProduct])

    server.put('/user/:uid/product/:pid', [
        auth.validJWTNeeded,
        controller.updateProduct
      ])
    
      server.del('/user/:uid/product/:pid', [
        auth.validJWTNeeded,
        controller.deleteProduct
      ])

    server.get('/product/count', [controller.productCount])

    server.get('/category/:id/product', [controller.getProductByCategory])
}