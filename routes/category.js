const controller = require('../Controllers/category')

module.exports = server => {
    //Display all category
    server.get('/category', [controller.getCategory])

    //Diaplay the customer by id
    server.get('/categoryinfo/:id', [controller.categoryInfo])

    //Add new customer
    server.post('/addcategory', [controller.addCategory])

    //update the customer
    server.put('/updatecategory/:id', [controller.updateCategory])

    //delete the customer
    server.del('/deletecategory/:id', [controller.deleteCategory])
}