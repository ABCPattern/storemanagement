const Product = require('../models/product')
const Category = require('../models/category')
const mongoose = require('mongoose')
const multer = require('multer')
module.exports = server =>{
    //Display all customer
    server.get('/product', (req, res, next)=>{
        Product.find().populate('category')//output is promise hence use of then and catch method
        .then(response => {
            res.status(200)
            res.json({
                response
            })
        })
        .catch(error => {
            res.status(400)
            res.json({
                message: `An error occured while retrieving the data ${error}`
            })
        })
    })

    //Diaplay the product by id
    server.get('/productinfo/:id', (req, res, next) => {
        const id = req.params.id
        if(!mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid category id")
            return
        }
        Product.findById(id)
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

    //Add new product
    server.post('/addproduct', (req, res, next)=>{
        const category = Category.findById(req.body.category)
        if(!category){
            res.status(400)
            res.json("Invalid category")
            return
        }
        let prod = new Product({
            id:req.body.id,
            name:req.body.name,
            description:req.body.description,
            image:req.body.image,
            category:req.body.category,
            price:req.body.price,
            stock:req.body.stock,
            dateCreated:req.body.dateCreated
        })
        prod.save()
        .then(response => {
            res.json({
                message: "New product added successfully!"
            })
            return
        })
        .catch(error => {
            res.status(500)
            res.json({
                message: `An error occured while inserting new product ${error}`
            })
            return
        })
    })

    //update the product
    server.put('/updateproduct/:id', (req, res, next)=>{
        const id = req.params.id
        if(!mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid category id")
            return
        }
        // const address = req.body.address
        // const paymentNo = req.body.paymentNo
        Product.findByIdAndUpdate(id, 
            {$set:{
                id:req.body.id,
                name:req.body.name,
                description:req.body.description,
                image:req.body.image,
                category:req.body.category,
                price:req.body.price,
                stock:req.body.stock,
                dateCreated:req.body.dateCreated
            }})
        .then(()=>{
            res.json({
                message:"Product updated successfully"
            })
        })
        .catch(error=>{
            console.log(error)
            res.json({
                message:`An error occured while updating the data ${error}`
            })
        })
    })

    //delete the product
    server.del('/deleteproduct/:id', (req, res, next)=>{
        const id = req.params.id
        if(!mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid category id")
            return
        }
        Product.findByIdAndDelete(id)
        .then(()=>{
            res.json({
                message:`Product deleted successfully`
            })
        })
        .catch(error=>{
            res.json({
                message:`An error occured while deleting the product ${error}`
            })
            
        })
    })

    server.get('/productcount', async(req, res)=>{
        const productcount = await Product.countDocuments();
        if(!productcount){
            res.status(500)
            res.json({success: false, message:"No product item is present"})
            return
        }
        else{
            res.status(200)
            res.json({productcount:productcount})
        }
    })
}