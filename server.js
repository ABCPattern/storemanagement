const restify = require('restify');
const config = require('./config');
const morgan = require('morgan');
const mongoose = require('mongoose')
const cookieParser = require('restify-cookies')


const server = restify.createServer()

//strict query setting
mongoose.set('strictQuery', true)
mongoose.connect("mongodb://127.0.0.1:27017/Store", (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected successfully")
    }
})

//Middleware
server.use(restify.plugins.bodyParser({ mapParams: true }));
server.use(restify.plugins.queryParser());

//Routes
const productRoutes = require('./routes/product')
const adminRoutes = require('./routes/admin')
const superadminRoutes = require('./routes/superadmin')
const categoryRoutes = require('./routes/category')
const userRoutes = require('./routes/user')

adminRoutes(server)
categoryRoutes(server)
productRoutes(server)
superadminRoutes(server)
userRoutes(server)

server.listen(config.PORT, () => {
    console.info(`api is running on port ${config.PORT}`);
})
