const Customer = require('../models/customer')
module.exports = server =>{

    server.get('/', (req, res, next)=>{
        Customer.find()
        .then(response => {
            res.json({
                response
            })
        })
        .catch(error => {
            res.json({
                message: `An error occured while retrieving the data ${error}`
            })
        })
    })

    server.get('/customerinfo', (req, res, next) => {
        const id = req.query.name
        Customer.findOne({name: id})
        .then(response => {
            res.json({
                response
            })
        })
        .catch(error => {
            res.json({
                message: `An error occured while retreiving data ${error}`
            })
        })
    })

    server.post('/addcustomer', (req, res, next)=>{
        let custom = new Customer({
            name:req.body.name,
            address:req.body.address,
            paymentNo:req.body.paymentNo
        })
        custom.save()
        .then(response => {
            res.json({
                message: "Customer added successfully!"
            })
        })
        .catch(error => {
            res.json({
                message: `An error occured while inserting new customer ${error}`
            })
        })
    })

    server.put('/updatecustomer', (req, res, next)=>{
        const n = req.query.name
        const address = req.body.address
        const paymentNo = req.body.paymentNo
        Customer.updateOne({name: n}, {$set:{name: n,address:address, paymentNo:paymentNo}})
        .then(()=>{
            res.json({
                message:"Customer updated successfully"
            })
        })
        .catch(error=>{
            console.log(error)
            res.json({
                message:`An error occured while updating the data ${error}`
            })
        })
    })

    server.get('/deletecustomer', (req, res, next)=>{
        const name = req.query.name
        Customer.deleteOne({name: name})
        .then(()=>{
            res.json({
                message:"Customer deleted successfully"
            })
        })
        .catch(error=>{
            res.json({
                message:`An error occured while deleting the customer ${error}`
            })
            
        })
    })
}