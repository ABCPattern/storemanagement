const SuperAdmin = require('../models/superadmin')
const mongoose = require('mongoose')
module.exports = server =>{
    server.get('/superadmin', (req, res, next)=>{
        SuperAdmin.find().populate('adminassign')
        .then(response=>{
            res.status(200)
            res.json({
                response
            })
        })
        .catch(error=>{
            res.json({message:"Error occured while retreinving the data"})
        })
    })   

    server.post('/login', (req, res, next)=>{
        const username = req.body.username
        const password = req.body.password

        const sadmin = SuperAdmin.findOne({username:username})
        if(!sadmin){
            res.status(400)
            res.send("The superadmin not found")
            return
        }
        if(sadmin && bcrypt.compareSync(password, sadmin.password)){
            res.status(200)
            res.send("SuperAdmin Authenticated")
        }
        else{
            res.status(400)
            res.send("Password is Wrong")
        }

    })
}