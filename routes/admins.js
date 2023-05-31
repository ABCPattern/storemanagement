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

}