const SuperAdmin = require('../models/superadmin')
const Admin = require('../models/admin')
// const restifyClients = require('restify-clients')
// const http = require('http')
const mongoose = require('mongoose')
const config = require('../config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// let k = 0
// const client = restifyClients.createJsonClient({
//     url: 'http://localhost:3000' // Replace with the appropriate URL
//   });

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

    server.get('/superadmin/admininfo/:id', (req, res, next)=>{
      
      SuperAdmin.findById(req.params.id).select('adminassign').populate('adminassign')
      .then(response=>{
        res.status(200)
        res.json({
          response
        })
      })
      .catch(error=>{
        res.json({message:`Error occured while retrieving the data ${error}`})
      })
    })

    server.put('/superadmin/addadmin', async (req, res) => {
      try {
        const username = req.body.username
        const password = req.body.password
        
        let admin = new Admin({
          username :req.body.uname,
          password : req.body.pass,
          name : req.body.name,
          categoryId : req.body.categoryId,
          address : req.body.address
        })
  
        const sadmin = await SuperAdmin.findOne({ username: username });

        if (!sadmin) {
          res.status(400);
          res.send("The superadmin not found");
          return;
        }
    
        if (sadmin && bcrypt.compare(password, sadmin.password)) {
              const newadmin =  await admin.save()
              if(!newadmin){
                res.status(500)
                res.send("Admin not added")
              }
              else{
                const recent = await Admin.findOne().sort({_id: -1})
                
                await SuperAdmin.updateOne(
                  { username: username },
                  { $push: { adminassign: recent._id } }
                )
                res.status(200);
                res.json({
                  message: "Admin is added and Superadmin updated successfully",
                });
                
              }  
        }
        else {
          res.status(400);
          res.send("Password is Wrong");
          return;
        }
      } catch (error) {
        res.status(500);
        res.send({ message: `An error occurred while adding the data: ${error}` });
      }
    });

    server.post('/login/:name', async (req, res)=>{
        const username = req.body.username
        const password = req.body.password
        // const secret = config.secret
        var sadmin = await SuperAdmin.findOne({username:username})
        if(!sadmin){
            res.status(400)
            res.send("The superadmin not found")
            return
        }
        if(sadmin && bcrypt.compare(password, sadmin.password)){
            // const token = jwt.sign(
            //     {
            //         sadminid : sadmin.id
            //     },
            //     secret,
            //     {expiresIn:'1d'}
            // )
            res.status(200)
            //res.send("SuperAdmin Authenticated")
            if(req.params.name == "addadmin"){
                res.redirect('/superadmin')
            }
        }
        else{
            res.status(400)
            res.send("Password is Wrong")
        }

    })

    
    server.put('/updatesuperadmin/:id', async (req, res) => {
        const id = req.params.id;
        let k = 0;
      
        if (!mongoose.isValidObjectId(id)) {
          res.status(400);
          res.send("Invalid Admin id");
          return;
        }
      
        try {
          const superadmin = await SuperAdmin.findOne({ _id: id });
      
          if (!mongoose.isValidObjectId(id)) {
            res.status(400);
            res.send("Invalid superadmin id");
            return;
          }
      
          const adminassign = req.body.adminassign;
      
          if (typeof adminassign === "string") {
            console.log("String");
      
            const data = await SuperAdmin.find({}).exec();
      
            data.forEach((sadmin) => {
              for (let i = 0; i < sadmin.adminassign.length; i++) {
                if (sadmin.adminassign[i] == adminassign) {
                  k = 1;
                  //console.log(`Inside loop k  ${k}`);
                  res.json({
                    success: false,
                    message: "Superadmin already assigned",
                  });
                  return;
                }
              }
            });
      
            console.log(`outside loop ${k}`);
      
            if (k !== 1) {
              await SuperAdmin.updateOne(
                { _id: id },
                { $push: { adminassign: adminassign } }
              );
      
              res.status(200);
              res.json({
                message: "Superadmin updated successfully",
              });
            }
          }
      
          if (Array.isArray(adminassign)) {
            //console.log("Array");
      
            const data = await SuperAdmin.find({}).exec();
      
            data.forEach((sadmin) => {
              for (let i = 0; i < sadmin.adminassign.length; i++) {
                for (let j = 0; j < adminassign.length; j++) {
                  if (sadmin.adminassign[i] == adminassign[j]) {
                    k = 1;
                    res.status(500);
                    res.json({
                      success: false,
                      message: `Superadmin already assigned for ${adminassign[j]}`,
                    });
                    return;
                  }
                }
              }
            });
      
            if (k !== 1) {
              await SuperAdmin.updateOne(
                { _id: id },
                { $push: { adminassign: { $each: adminassign} } }
              );
      
              res.status(200);
              res.json({
                message: "Superadmin updated successfully",
              });
            }
          }
        } catch (error) {
          res.status(400);
          res.json({
            message: `An error occurred while retrieving data ${error}`,
          });
        }
      });
      
    
    server.put('/superadmin/updateadmin', async (req, res) => {
        try {
          const username = req.body.username;
          const password = req.body.password;
          const id = req.query.id;
          let k = 0;
          const sadmin = await SuperAdmin.findOne({ username: username });
      
          if (!sadmin) {
            res.status(400);
            res.send("The superadmin not found");
            return;
          }
      
          if (sadmin && bcrypt.compare(password, sadmin.password)) {
            for (let i = 0; i < sadmin.adminassign.length; i++) {
              if (id == sadmin.adminassign[i]) {
                k = 1;
                if (!mongoose.isValidObjectId(id)) {
                  res.status(400);
                  res.send("Invalid Admin id");
                  return;
                }
      
                const address = req.body.address;
                const categoryId = req.body.categoryId;
      
                await Admin.findByIdAndUpdate(
                  id,
                  { $set: { name: req.body.name, address: address, categoryId: categoryId } }
                );
      
                res.status(200);
                res.send({ message: "Admin updated successfully" });
                return;
              }
            }
          } else {
            res.status(400);
            res.send("Password is Wrong");
            return;
          }
      
          if (k !== 1) {
            res.send("Update is not allowed");
          }
        } catch (error) {
          res.status(500);
          res.send({ message: `An error occurred while updating the data: ${error}` });
        }
      });

      server.del('/superadmin/deleteadmin', async (req, res) => {
        try {
          const username = req.body.username;
          const password = req.body.password;
          const id = req.query.id;
          const admin = await Admin.findById(id).exec()
          if(!admin){
            res.status(400)
            res.send("Admin not found")
            return
          }
          let k = 0;
          const sadmin = await SuperAdmin.findOne({ username: username });
      
          if (!sadmin) {
            res.status(400);
            res.send("The superadmin not found");
            return;
          }
      
          if (sadmin && bcrypt.compare(password, sadmin.password)) {
            for (let i = 0; i < sadmin.adminassign.length; i++) {
              if (id == sadmin.adminassign[i]) {
                k = 1;
                if (!mongoose.isValidObjectId(id)) {
                  res.status(400);
                  res.send("Invalid Admin id");
                  return;
                }
                await Admin.findByIdAndDelete(id);
                await SuperAdmin.updateOne({username:username}, {$pull:{adminassign:id}})
                res.status(200);
                res.send({ message: "Admin deleted successfully" });
                return;
              }
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