const restify = require('restify');
const config = require('./config');
const morgan = require('morgan');
const mongoose = require('mongoose');


const server = restify.createServer();
mongoose.set('strictQuery', true)
mongoose.connect("mongodb://127.0.0.1:27017/Store", (err) => {
    if(err){
        console.log(err)
    }else{
        console.log("Connected successfully")
    }
})

//Middleware
server.use(restify.plugins.bodyParser({mapParams: true}));
server.use(restify.plugins.queryParser());

//Routes
const productRoutes = require('./routes/products')
const adminRoutes = require('./routes/admins')
const superadminRoutes = require('./routes/superadmins')
const categoryRoutes = require('./routes/categories')
// const orderRoutes = require('./routes/orders')

adminRoutes(server)
categoryRoutes(server)
productRoutes(server)
superadminRoutes(server)
//orderRoutes(server)

server.listen(config.PORT, () => {
    console.info(`api is running on port ${config.PORT}`);
})
