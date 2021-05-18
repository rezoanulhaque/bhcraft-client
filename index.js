const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const app = express()

app.use(bodyParser.json());
app.use(cors());
const port = 5000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mdb7s.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
  const shipmentCollection = client.db(`${process.env.DB_NAME}`).collection("shipment");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
  const customerCollection = client.db(`${process.env.DB_NAME}`).collection("customer");
  app.post('/addProduct', (req, res) => {
    const addProduct = req.body
    productCollection.insertOne(addProduct)
        .then(result => res.send(result.insertedCount > 0 ))
  })
  app.post('/addShipment', (req, res) => {
    const addShipment = req.body
    shipmentCollection.insertMany(addShipment)
        .then(result => res.send(result.insertedCount > 0 ))
  })
  app.get('/allProduct', (req, res) => {
    productCollection.find()
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.get('/searchOnNameSubmit', (req, res) => {
    const searchName = req.query.search
    productCollection.find({name : {$regex: searchName}})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.get('/categorySubmit', (req, res) => {
    const categoryName = req.query.category
    productCollection.find({category: categoryName})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.get('/yourProductList', (req, res) => {
    const sellerName = req.query.name
    productCollection.find({sellername: sellerName})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.get('/singleProduct/:_id', (req, res) => {
    const key = req.params._id
    productCollection.find({_id: ObjectId(key)})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.get('/myOrder', (req, res) => {
    const customerEmail = req.query.email
    shipmentCollection.find({customerEmail: customerEmail})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.get('/customerOrder', (req, res) => {
    const sellerName = req.query.name
    shipmentCollection.find({sellername: sellerName})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  app.get('/admin', (req, res) => {
    const userEmail = req.query.email;
    adminCollection.find({ email: userEmail })
        .toArray((err, result) => res.send(result))
})
   app.get('/existingUser', (req, res) => {
    const userEmail = req.query.email;
    customerCollection.find({ email: userEmail })
      .toArray((err, result) => res.send(result))
})
app.post('/addNewUser', (req, res) => {
  const addShipment = req.body
  customerCollection.insertOne(addShipment)
      .then(result => res.send(result.insertedCount > 0 ))
})
app.patch('/updatedInfo', (req, res) =>{
  const userEmail = req.query.email
  customerCollection.updateOne({email: userEmail},
  {
    $set: {phone: req.body.phone, 
      address: req.body.address
  }
  })
  .then(result =>{
    res.send(result.modifiedCount > 0)
  })
})
  app.patch('/updateProduct', (req, res) =>{
    const objectId = req.query.id
    productCollection.updateOne({_id: ObjectId(objectId)},
    {
      $set: {img: req.body.img, 
        name: req.body.name,
        sellername: req.body.sellername,
        stock: req.body.stock,
        key: req.body.key,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description
    }
    })
    .then(result =>{
      res.send(result.modifiedCount > 0)
    })
  })
  app.patch('/updateStatus/:id',(req, res) => {
    const id=req.params.id
    shipmentCollection.updateOne({ _id:ObjectId(id) },
        { $set: { status: req.body.value}})
    .then(result =>res.send(result.modifiedCount>0))
  })
  app.delete('/deleteProduct/:id', (req, res) =>{
    const id=req.params.id
    shipmentCollection.deleteOne({_id: ObjectId(id)})
    .then(result => {
      res.send(result.deletedCount > 0);
    })
  })
  app.get('/j', (req, res) => {
    res.send('Hi World!')
  })
  console.log('connected')
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.DB_PORT || port)