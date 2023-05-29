const Admin = require('../models/admin')
const mongoose = require('mongoose')
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

    //Diaplay the Admin by id
    server.get('/admininfo/:id', (req, res, next) => {
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

    //Add new Admin
    server.post('/addadmin', (req, res, next)=>{
        
        if(!mongoose.isValidObjectId(req.body.categoryId)){
            res.status(400)
            res.send("Invalid category id")
            return
        }
        let admin = new Admin({
            name:req.body.name,
            address:req.body.address,
            categoryId:req.body.categoryId
        })
        
        admin.save()
        .then(response => {
            res.status(200)
            res.json({
                message: "Admin added successfully!"
            })
        })
        .catch(error => {
            res.status(400)
            res.json({
                message: `An error occured while inserting new Admin ${error}`
            })
        })
    })

    //update the Admin
    server.put('/updateadmin', (req, res, next)=>{
        const id = req.query.id
        if(!mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid Admin id")
            return
        }
        const address = req.body.address
        const paymentNo = req.body.paymentNo
        Admin.findByIdAndUpdate(id, {$set:{name: n,address:address, paymentNo:paymentNo}})
        .then(()=>{
            res.status(200)
            res.json({
                message:"Admin updated successfully"
            })
        })
        .catch(error=>{
            res.status(400)
            res.json({
                message:`An error occured while updating the data ${error}`
            })
        })
    })

    //delete the Admin
    server.del('/deleteadmin/:id', (req, res, next)=>{
        const id = req.params.id
        if(!mongoose.isValidObjectId(id)){
            res.status(400)
            res.send("Invalid category id")
            return
        }
        // const info = Admin.findById(id)
        const custom = Admin.findByIdAndDelete(id)
        .then(()=>{
            res.status(200)
            res.json({
                message:`Admin deleted successfully ${custom}`
            })
        })
        .catch(error=>{
            res.status(400)
            res.json({
                message:`An error occured while deleting the Admin ${error}`
            })
            
        })
    })
}