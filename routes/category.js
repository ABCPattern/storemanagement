const controller = require('../Controllers/category')
const auth = require('../authentication')

module.exports = server => {
    //Display all category
    server.get('/category', [controller.getCategory])

    //Diaplay the customer by id
    server.get('/category/:id', [controller.categoryInfo])

    //Add new customer
    server.post('/category', [
        auth.validJWTNeeded,
        controller.addCategory])

    //update the customer
    server.put('/category/:id', [
        auth.validJWTNeeded,
        controller.updateCategory])

    //delete the customer
    server.del('/category/:id', [
        auth.validJWTNeeded,
        controller.deleteCategory])
}