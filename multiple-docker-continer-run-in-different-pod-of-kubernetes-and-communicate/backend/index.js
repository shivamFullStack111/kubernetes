const express = require('express'); 
const cors = require('cors') 
const mongoose = require('mongoose')
require('dotenv')

const app = express(); 

app.use(cors());
app.use(express.json())

const MONGO_HOST = process.env.MONGO_HOST       // in these env variables we are passing values from this kubernetes deployment which is taking value from configMap  
const MONGO_PORT = process.env.MONGO_PORT

mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/my-app`).then(()=>{
	console.log("db connected")
}).catch(err=>console.log(err.message))


app.get("/",(req,res)=>{
	return res.send({success:true,message:"backend running on port 8000",status:200})
})


app.listen(8000,()=>{
	console.log("server listing on 8000")
})
