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

server.listen(config.PORT, () => {
    require('./routes/store')(server);
    console.info(`api is running on port ${config.PORT}`);
})
