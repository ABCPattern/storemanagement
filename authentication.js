const jwt = require('jsonwebtoken')
const config = require('./config')
const lodash = require('lodash')
const SuperAdmin = require('./models/superadmin')
const bcrypt = require('bcryptjs')

exports.isPasswordMatch = async (req, res) => {
    const enteredpassword = req.body.password
    const username = req.body.username
    const sadmin = await SuperAdmin.findOne({ username: username })
    if (!sadmin) {
        res.status(400)
        console.log("dsnbfkj")
        res.json({
            message: "Superadmin not found"
        })
        return
    }
    else {
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
        req.body.refreshKey = salt
        const token = jwt.sign(req.body, config.secret)
        if (!salt) {
            res.status(400)
            res.json({
                message: "Token is not generated"
            })
            return
        }
        const refresh_token = hash;

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
