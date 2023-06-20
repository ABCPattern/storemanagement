const controller = require('../Controllers/category')
const auth = require('../authentication')

module.exports = server => {
    //Display all category
    server.get('/category', [controller.getCategory])

    //Diaplay the customer by id
    server.get('/category/:id', [controller.categoryInfo])

    //Add new customer
    server.post('/user/:sid/category', [
        auth.validJWTNeeded,
        controller.addCategory])

    //update the customer
    server.put('/user/:sid/category/:id', [
        auth.validJWTNeeded,
        controller.updateCategory])

    //delete the customer
    server.del('/user/:sid/category/:id', [
        auth.validJWTNeeded,
        controller.deleteCategory])
}