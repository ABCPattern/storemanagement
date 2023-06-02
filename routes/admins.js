const Admin = require('../models/admin')
const Product = require('../models/product')
const config = require('../config')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const controller = require('./Contollers')

module.exports = server =>{
    //Display all Admin
    server.get('/admin', (req, res, next)=>{
        Admin.find()//output is promise hence use of then and catch method
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
    
    

    //login authorization
    server.post('/loginadmin', async (req, res) =>{
      const {username, password} = req.body
      
      const admin = await Admin.findOne({ username: username })
      if (!admin) {
        res.status(400);
        res.send("The admin not found");
        return;
      }
      if (admin && bcrypt.compare(password, admin.password)) {
        const token = jwt.sign({username}, 'secretkey', {expiresIn:'1d'})
        res.send(200, {token})
      }
      else{
        res.send(401, {error:"Invalid username or password"})
      }
    })

    //verification token
    function verifyToken(req, res, next){
      const bearerHeader = req.headers['authorization']
      if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ")
        const token = bearer[1]
        jwt.verify(token, 'secretkey', (err, encoded)=>{
          if(err){
            return res.send("Invalid token")
          }
          else{
            next()
          } 
        })
      }
      else{
          return res.send(401, {error:"Invalid token"})
      }
    }

    //Diaplay the Admin by id
    server.get('/admininfo/:id', verifyToken, (req, res, next) => {
        const id = req.params.id
        if(!mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid Admin id")
            return
        }
        Admin.findById(id)
        .then(response => {
            res.status(200)
            res.json({
                response
            })
        })
        .catch(error => {
            res.status(400)
            res.json({
                message: `An error occured while retreiving data ${error}`
            })
        })
    })
    
    // update the product
    //id of product is required in query
    server.put('/admin/updateproduct', verifyToken, async (req, res) => {
        try {
          const username = req.body.username;
          const password = req.body.password;
          const id = req.query.id
          let k = 0;
          const admin = await Admin.findOne({ username: username })
          const product = await Product.findOne({ _id:id})
        //   console.log(product)
          let description, image, category, price, stock
          if(req.body.description){
            description = req.body.description
          }
          else if(!req.body.description){
            description = product.description
          }
          if(req.body.image){
            image = req.body.image
          }
          else if(!req.body.image){
            image = product.image
          }
          if(req.body.category){
            category = req.body.category
          }
          else if(!req.body.category){
            category = product.category
          }
          if(req.body.price){
            price = req.body.price
          }
          else if(!req.body.price){
            price = product.price
          }
          if(req.body.stock){
            stock = req.body.stock
          }
          else if(!req.body.stock){
            stock = product.stock
          }

          console.log(description, image, category, price, stock)
          if (!admin) {
            res.status(400);
            res.send("The admin not found");
            return;
          }
        //   console.log(typeof admin.categoryId)
        //   console.log(typeof product.category)
          if (admin && bcrypt.compare(password, admin.password)) {
            // jwt.sign({req.body}, "secretkey", )
                if(lodash.isEqual(admin.categoryId, product.category)){
                    const updatedoc = await Product.findByIdAndUpdate(id, {$set:{description:description, image:image, category:category, price:price, stock:stock}})
                    if(updatedoc){
                        res.status(200)
                        res.send({
                            message:"Product updated successfully"
                        })
                    }
                    else if(!updatedoc){
                        res.status(404)
                        res.send({
                            message:`Error occured while updating the data ${error}`
                        })
                    }
                }
                else{
                    res.status(400)
                    res.send({
                        message:"Update is not allowed"
                    })
                }
          } else {
            res.status(400);
            res.send("Password is Wrong");
            return;
          }
        } catch (error) {
          res.status(500);
          res.send({ message: `An error occurred while updating the data: ${error}` });
        }
      }
      )


      //delete product
      //id of product required in query
      server.del('/admin/deleteproduct', verifyToken, async (req, res) => {
        try {
          const username = req.body.username;
          const password = req.body.password;
          const id = req.query.id;
          const product = await Product.findById(id).exec()
          if(!product){
            res.status(400)
            res.send("Product not found")
            return
          }
          let k = 0;
          const admin = await Admin.findOne({ username: username });
      
          if (!admin) {
            res.status(400);
            res.send("Admin not found");
            return;
          }
      
          if (admin && bcrypt.compare(password, admin.password)) {
                if(lodash.isEqual(admin.categoryId, product.category)){
                k = 1;
                await Product.findByIdAndDelete(id)
                res.status(200);
                res.send({ message: "Product deleted successfully" });
                return;
              
            }
          } else {
            res.status(400);
            res.send("Password is Wrong");
            return;
          }
      
          if (k !== 1) {
            res.send("Delete is not allowed");
          }
        } catch (error) {
          res.status(500);
          res.send({ message: `An error occurred while deleting the data: ${error}` });
        }
      });


}