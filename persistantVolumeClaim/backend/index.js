const express = require('express'); 
const cors = require('cors') 
const mongoose = require('mongoose')
require('dotenv').config()  // fix: require('dotenv').config()

const app = express(); 

app.use(cors());
app.use(express.json())

const MONGO_HOST = process.env.MONGO_HOST
const MONGO_PORT = process.env.MONGO_PORT

mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/my-app`)
.then(()=> console.log("DB connected"))
.catch(err => console.log(err.message))

// Schema
const NameSchema = new mongoose.Schema({
  name: { type: String, required: true }
})

const NameModel = mongoose.model('Name', NameSchema)

// APIs

// 1. Create
app.post("/api/names", async (req,res)=>{
    try {
        const newName = new NameModel({ name: req.body.name })
        await newName.save()
        res.status(201).send({ success:true, data:newName })
    } catch(err) {
        res.status(500).send({ success:false, message: err.message })
    }
})

// 2. Get All
app.get("/api/names", async (req,res)=>{
    try {
        const allNames = await NameModel.find()
        res.status(200).send({ success:true, data:allNames })
    } catch(err){
        res.status(500).send({ success:false, message: err.message })
    }
})

// 3. Delete
app.delete("/api/names/:id", async (req,res)=>{
    try {
        await NameModel.findByIdAndDelete(req.params.id)
        res.status(200).send({ success:true, message:"Deleted successfully" })
    } catch(err){
        res.status(500).send({ success:false, message: err.message })
    }
})

app.listen(8000,()=>{
    console.log("Server listening on 8000")
})
