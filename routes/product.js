const controller = require('../Controllers/product')

module.exports = server => {
    server.get('/product', [controller.getProduct])

    server.get('/productinfo/:id', [controller.productInfo])

    server.post('/addproduct', [controller.addProduct])

    server.put('/updateproduct/:id', [controller.updateProduct])

    server.del('/deleteproduct/:id', [controller.deleteProduct])

    server.get('/productcount', [controller.productCount])

    server.get('/product/category/:id', [controller.getProductByCategory])
}