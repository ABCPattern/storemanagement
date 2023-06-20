const controller = require('../Controllers/user')
const mongoose =require('mongoose')
const Joi = require('joi')
const objectId = mongoose.Types.ObjectId()
const auth = require('../authentication')


const validateadmin = (req, res, next) => {
    const schema = Joi.object().keys({
        // role:Joi.string().required(),
        role: Joi.string().valid('Superadmin', 'Admin').required(),
        name: Joi.string().min(2).when('role', {is:'Superadmin', then:Joi.optional(), otherwise:Joi.required()}),
        address: Joi.string().min(2).when('role', {is:'Superadmin', then:Joi.optional(), otherwise:Joi.required()}),
        categoryId: Joi.string().optional()
    }).unknown(true)
    const {error} = schema.validate(req.body, {abortEarly:false});
    if(error){
        const {details} = error;
        res.status(200);
        res.json({details: details});
        return
    }
    else{
        next();
    }
}

module.exports = server => {
  server.post('/registration', validateadmin,  [controller.insert])

  server.post('/auth', [
    auth.isPasswordMatch,
    auth.login
  ])

  server.put('/password/user/:id', [
    auth.validJWTNeeded,
    controller.updatepassword
  ])

  
}