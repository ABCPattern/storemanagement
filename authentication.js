const jwt = require('jsonwebtoken')
const config = require('./config')
const lodash = require('lodash')
const {User, Admin, SuperAdmin} = require('./models/user')
const bcrypt = require('bcryptjs')

exports.isPasswordMatch = async (req, res) => {
    const enteredpassword = req.body.password
    const username = req.body.username
    let user = await User.findOne({ username: username })
    if (!user) {
        res.status(400)
        res.json({
            message: "User not found"
        })
        return
    }
    else{
        const sadmin = await SuperAdmin.findOne({username:username})
        if(sadmin){
            bcrypt.compare(enteredpassword, sadmin.password, (err, result) => {
                // console.log(sadmin.password)
                if (err) {
                    res.status(401)
                    res.send("Incorrect password")
                    return
                }
                if (result) {
                    return
                }
                else {
                    res.status(401)
                    res.send('Incorrect password')
                    return
                }
            })
            return
        }
        else{
            const admin = await Admin.findOne({username:username})
            if(admin){
                bcrypt.compare(enteredpassword, admin.password, (err, result) => {
                    if (err) {
                        res.status(401)
                        res.send("Incorrect password")
                        return
                    }
                    if (result) {
                        return
                    }
                    else {
                        res.status(401)
                        res.send('Incorrect password')
                        return
                    }
                })
                return
            }    
        }
    }
}


exports.login = async (req, res) => {
    try {
        const refreshId = req.query.id + config.secret
        const saltrounds = 10
        const salt = await bcrypt.genSalt(saltrounds)
        if (!salt) {
            res.status(400)
            res.json({
                message: "Bad request"
            })
            return
        }
        const hash = await bcrypt.hash(refreshId, salt)
        if (!hash) {
            res.status(400)
            res.json({
                message: "Bad request"
            })
            return
        }
        // req.body.refreshKey = salt
        const token = jwt.sign(req.body, config.secret, {expiresIn: '1h'})
        if (!token) {
            res.status(500)
            res.json({
                message: "Token is not generated"
            })
            return
        }
        // const refresh_token = hash;
        const refresh_token = jwt.sign(req.body, config.secret_refresh, {expiresIn:'1y'})
        if(!refresh_token){
            res.json(500)
            res.json({
                message:"Refresh token is not generated"
            })
            return
        }
        res.status(201)
        res.json({ accessToken: token, refreshToken: refresh_token })
        return
    } catch (error) {
        res.status(500)
        res.json({ errors: error })
        return
    }
}


exports.validJWTNeeded = async (req, res) => {
    const refreshId = req.query.id + config.secret
    const saltrounds = 10
    const salt = await bcrypt.genSalt(saltrounds)
    const hash = await bcrypt.hash(refreshId, salt)
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');

            if (authorization[0] !== 'Bearer') {
                console.log(authorization[0])
                return res.status(401).send();
            } else {
                req.jwt = jwt.verify(authorization[1], config.secret);
                return
            }
        } catch (err) {
            if(!req.body || !req.body.refreshtoken){
                res.status(400)
                res.json({
                    success:false,
                    message:"Your session has expired"
                })
                return
            }
            else if(req.body.refreshtoken){
                const decodedrefreshtoken = jwt.verify(req.body.refreshtoken, config.secret_refresh)
                const id = req.query.id
                // console.log(decodedrefreshtoken.aud)
                const newaccesstoken = jwt.sign({id}, config.secret, {expiresIn:'1h'})
                const newrefreshtoken = jwt.sign({id}, config.secret_refresh, {expiresIn:'1y'})
                res.json({
                    message:`Session for this user expired`,
                    accessToken: newaccesstoken,
                    refreshToken:newrefreshtoken
                })
                return
            }
            
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
