const Admin = require('../models/admin')
const SuperAdmin = require('../models/superadmin')
const Product = require('../models/product')
const config = require('../config')
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

exports.insert = (req, res, next) =>{
    const username = req.body.username
    SuperAdmin.findOne({username:username})
    .then(response=>{
        res.status(400)
        res.json({
            message:`${username} already exist`
        })
        return
    })
    .catch(err=>{
        res.json(err)
        return
    })
    // if(!existuname){
        const password = req.body.password
        const saltrounds = 10

        bcrypt.genSalt(saltrounds, (err, salt)=>{
            if(err){
                console.log(err)
                res.status(500)
                res.json({
                    message:"Salt is not generated"
                })
                return
            }
            bcrypt.hash(password, salt, (err, hash)=>{
                if(err){
                    console.log(err)
                    res.status(500)
                    res.json({
                        message:"Hash is not generated"
                    })
                    return
                }
                else{
                    req.body.password= hash
                    const sadmin = new SuperAdmin(req.body)
                    sadmin.save()
                    .then(response=>{
                        console.log(response)
                        res.status(201)
                        res.json({
                            message:`Registered Successfully id:${response._id}`
                        })
                        return
                    })
                    .catch(error=>{
                        console.log(error)
                        res.json({
                            message:error
                        })
                        return
                    })
                }
            })
        })    
    // }   
}   



exports.updatepassword = (req, res, next)=>{

    if(req.body.password){
        const saltrounds = 10
        bcrypt.genSalt(saltrounds, (err, salt)=>{
            if(err){
                res.status(500)
                res.json({
                    message:"Salt is not generated"
                })
                return
            }
            bcrypt.hash(req.body.password, salt, (err, hash)=>{
                if(err){
                    res.status(500)
                    res.json({
                        message:"Hash is not generated"
                    })
                    return
                }
                else{
                    req.body.password= hash
                    console.log(req.query.id)
                    SuperAdmin.updateOne({_id : req.query.id},{$set: req.body})
                    .then(response=>{
                        res.status(200)
                        // console.log("dsfj")
                        res.send({
                            message:`${req.body.username} Updated Successfully`
                        })
                    })
                    .catch(error=>{
                        res.json({
                            message:error
                        })
                    })
                }
            })
        })
    }
}

exports.isPasswordMatch = (req, res, next)=>{
    const enteredpassword = req.body.password
    const username = req.body.username
    SuperAdmin.findOne({ username: username })
    .then((sadmin)=>{
        bcrypt.compare(enteredpassword,sadmin.password, (err, result)=>{
            console.log(sadmin.password)
            if(err){
                res.send("Error occured")
            }
            if(result){
                return next()
            }
            else{
                res.status(401)
                res.send('Incorrect password');
            }
        })
        return;
    })
    .catch(error=>{
        res.status(400)
        res.json({
            message:"Superadmin not found"
        })
    }) 
}

exports.login = (req, res, next)=>{
    try{
        let refreshId = req.query.id + config.secret
        const saltrounds = 10
        bcrypt.genSalt(saltrounds, (err, salt)=>{
            if(err){
                res.status(500)
                res.json({
                    message:"Salt is not generated"
                })
                return
            }
            bcrypt.hash(refreshId, salt, (err, hash)=>{
                if(err){
                    res.status(500)
                    res.json({
                        message:"Hash is not generated"
                    })
                    return
                }
                else{
                    req.body.refreshKey= salt
                    let token = jwt.sign(req.body, config.secret)
                    const refresh_token = hash
                    res.status(201)
                    res.send({accessToken: token, refreshToken: refresh_token})
                }
            })
        })
    }
    catch(err){
        res.status(500)
        res.send({errors: err});
    }
}

exports.validJWTNeeded = (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
        
            if (authorization[0] !== 'Bearer') {
            
                return res.status(401).send();
            } else {
                req.jwt = jwt.verify(authorization[1], config.secret);
                return next();
            }
        } catch (err) {
            res.status(403)
            res.send("Invalid token")
            return
        }
    } else {
        res.status(401)
        res.send("Invalid token")
        return
    }
} 

exports.addadmin = async (req, res) => {
    try {
      // const username = req.body.username
      // const password = req.body.password
      
      let admin = new Admin({
        username :req.body.uname,
        password : req.body.pass,
        name : req.body.name,
        categoryId : req.body.categoryId,
        address : req.body.address
      })

      const sadmin = await SuperAdmin.findOne({ _id:req.query.id });

      if (!sadmin) {
        res.status(400);
        res.send("The superadmin not found");
        return;
      }
  
      // if (sadmin && bcrypt.compare(password, sadmin.password)) {
            const newadmin =  await admin.save()
            if(!newadmin){
              res.status(500)
              res.send("Admin not added")
            }
            else{
              const recent = await Admin.findOne().sort({_id: -1})
              
              await SuperAdmin.updateOne(
                { _id: req.query.id},
                { $push: { adminassign: recent._id } }
              )
              res.status(200);
              res.json({
                message: "Admin is added and Superadmin updated successfully",
              });
              
            }  
      // }
      // else {
      //   res.status(400);
      //   res.send("Password is Wrong");
      //   return;
      // }
    } catch (error) {
      res.status(500);
      res.send({ message: `An error occurred while adding the data: ${error}` });
    }
  }

  exports.updatesuperadmin = async (req, res) => {
    const id = req.query.id;
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
            if (sadmin.adminassign[i].toString() == adminassign.toString()) {
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
              if (sadmin.adminassign[i].toString() == adminassign[j].toString()) {
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
  }

  exports.superadmininfo = (req, res, next)=>{
      
    SuperAdmin.findById(req.query.id).select('adminassign').populate('adminassign')
    .then(response=>{
      res.status(200)
      res.json({
        response
      })
    })
    .catch(error=>{
      res.json({message:`Error occured while retrieving the data ${error}`})
    })
  }


  exports.updateadmin = async (req, res) => {
    try {
      // const username = req.body.username;
      // const password = req.body.password;
      const aid = req.query.aid
      const id = req.query.id;
      let k = 0;
      const sadmin = await SuperAdmin.findOne({ _id: req.query.aid });
  
      if (!sadmin) {
        res.status(400);
        res.send("The superadmin not found");
        return;
      }
  
      // if (sadmin && bcrypt.compare(password, sadmin.password)) {
        for (let i = 0; i < sadmin.adminassign.length; i++) {
          if (id.toString() == sadmin.adminassign[i].toString()) {
            k = 1;
            if (!mongoose.isValidObjectId(id)) {
              res.status(400);
              res.send("Invalid Admin id");
              return;
            }
  
            // const address = req.body.address;
            // const categoryId = req.body.categoryId;
  
            await Admin.findByIdAndUpdate(
              id,
              { $set: req.body }
            );
  
            res.status(200);
            res.send({ message: "Admin updated successfully" });
            return;
          }
        }
      // } else {
      //   res.status(400);
      //   res.send("Password is Wrong");
      //   return;
      // }
  
      if (k !== 1) {
        res.send("Update is not allowed");
      }
    } catch (error) {
      res.status(500);
      res.send({ message: `An error occurred while updating the data: ${error}` });
    }
  }

exports.deleteadmin = async (req, res) => {
    try {
      // const username = req.body.username;
      // const password = req.body.password;
      const id = req.query.id;
      const aid = req.query.aid
      const admin = await Admin.findById(id).exec()
      if(!admin){
        res.status(400)
        res.send("Admin not found")
        return
      }
      let k = 0;
      const sadmin = await SuperAdmin.findOne({ _id: aid });
  
      if (!sadmin) {
        res.status(400);
        res.send("The superadmin not found");
        return;
      }
  
      // if (sadmin && bcrypt.compare(password, sadmin.password)) {
        for (let i = 0; i < sadmin.adminassign.length; i++) {
          if (id.toString() == sadmin.adminassign[i].toString()) {
            k = 1;
            if (!mongoose.isValidObjectId(id)) {
              res.status(400);
              res.send("Invalid Admin id");
              return;
            }
            await Admin.findByIdAndDelete(id);
            await SuperAdmin.updateOne({_id: aid}, {$pull:{adminassign:id}})
            res.status(200);
            res.send({ message: "Admin deleted successfully" });
            return;
          }
        }
      // } else {
      //   res.status(400);
      //   res.send("Password is Wrong");
      //   return;
      // }
  
      if (k !== 1) {
        res.send("Delete is not allowed");
      }
    } catch (error) {
      res.status(500);
      res.send({ message: `An error occurred while deleting the data: ${error}` });
    }
  }