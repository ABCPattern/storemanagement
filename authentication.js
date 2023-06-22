const jwt = require('jsonwebtoken')
const config = require('./config')
const lodash = require('lodash')
const { User, Admin, SuperAdmin } = require('./models/user')
const bcrypt = require('bcryptjs')

exports.isPasswordMatch = (req, res, next) => {
    const enteredpassword = req.body.password
    const username = req.body.username
    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                res.status(400)
                res.json({
                    success: false,
                    message: "User does not exist"
                })
                return
            }
            bcrypt.compare(enteredpassword, user.password, (err, result) => {
                if (err) {
                    console.log(result)
                    res.status(401)
                    res.json({
                        success: false,
                        error: err
                    })
                    return

                }
                if (!result) {
                    res.json({
                        success: false,
                        message: "Incorrect password"
                    })
                }
                if (result) {
                    next()
                }
            })
        })
        .catch(err => {
            res.json(err)
        })

}



exports.login = async (req, res) => {
    try {
        const token = jwt.sign(req.body, config.secret, { expiresIn: '1h' })
        if (!token) {
            res.status(500)
            res.json({
                success: false,
                message: "Token is not generated"
            })
            return
        }
        const refresh_token = jwt.sign(req.body, config.secret_refresh, { expiresIn: '7d' })
        if (!refresh_token) {
            res.json(500)
            res.json({
                success: false,
                message: "Refresh token is not generated"
            })
            return
        }
        if (token && refresh_token) {
            res.status(200)
            res.json({ succcess: true, accessToken: token, refreshToken: refresh_token })
            return
        }
    } catch (error) {
        res.status(500)
        res.json({ errors: error })
        return
    }
}


exports.validJWTNeeded = (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');

            if (authorization[0] !== 'Bearer') {
                console.log(authorization[0])
                return res.status(401).send();
            } else {
                req.decodetoken = jwt.verify(authorization[1], config.secret)
                next()
            }
        } catch (err) {
            if (!req.header('refreshtoken')) {
                res.status(400)
                res.json({
                    success: false,
                    message: "Your session has expired or token is not valid"
                })
                return
            }
            else if (req.header('refreshtoken')) {
                const decodedrefreshtoken = jwt.verify(req.header('refreshtoken'), config.secret_refresh)
                const details = {
                    "username": decodedrefreshtoken.username,
                    "password": decodedrefreshtoken.password
                }
                const newaccesstoken = jwt.sign(details, config.secret, { expiresIn: '1h' })
                const newrefreshtoken = jwt.sign(details, config.secret_refresh, { expiresIn: '7d' })
                res.json({
                    message: `Your session has expired`,
                    accessToken: newaccesstoken,
                    refreshToken: newrefreshtoken
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
