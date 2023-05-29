const Category = require('../models/category')
const mongoose = require('mongoose')
const multer = require('multer')
module.exports = server =>{
    //Display all category
    server.get('/category', (req, res, next)=>{
        Category.find()//output is promise hence use of then and catch method
        .then(response => {
            res.json({
                response
            })
        })
        .catch(error => {
            res.json({
                message: `An error occured while retrieving the data ${error}`
            })
        })
    })

    //Diaplay the customer by id
    server.get('/categoryinfo/:id', (req, res, next) => {
        const id = req.params.id
        if(mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid category id")
        }
        Customer.findById(id)
        .then(response => {
            res.json({
                response
            })
        })
        .catch(error => {
            res.json({
                message: `An error occured while retreiving data ${error}`
            })
        })
    })

    //Add new customer
    server.post('/addcategory', (req, res, next)=>{
        let cate = new Category({
            id:req.body.id,
            name:req.body.name,
            color:req.body.color,
        })
        cate.save()
        .then(response => {
            res.json({
                message: " New Category added successfully!"
            })
        })
        .catch(error => {
            res.json({
                message: `An error occured while inserting new category ${error}`
            })
        })
    })

    //update the customer
    server.put('/updatecategory/:id', (req, res, next)=>{
        const id = req.params.id
        if(mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid category id")
        }
        Customer.findByIdAndUpdate(id, 
            {$set:
                {
                    id:req.body.id,
                    name:req.body.name,
                    color:req.body.color,
                }
            })
        .then(()=>{
            res.json({
                message:"Customer updated successfully"
            })
        })
        .catch(error=>{
            console.log(error)
            res.json({
                message:`An error occured while updating the data ${error}`
            })
        })
    })

    //delete the customer
    server.get('/deletecategory/:id', (req, res, next)=>{
        const id = req.params.id
        if(mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid category id")
        }
        const info = Category.findByIdAndRemove(id)
        // Customer.deleteOne({name: name})
        .then((category)=>{
            if(category){
                res.status(200)
                res.json({
                    message:`Customer deleted successfully\n ${info}`
                })
                return
            }
            else{
                res.status(404)
                res.json({
                    message: `category not found`
                })
                return
            }
        })
        .catch(error=>{
            res.status(400)
            res.json({
                message:`An error occured while deleting the customer ${error}`
            })
            return
        })
    })
}