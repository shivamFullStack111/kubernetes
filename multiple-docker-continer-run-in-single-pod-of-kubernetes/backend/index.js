const express = require('express'); 
const cors = require('cors') 
const mongoose = require('mongoose')

const app = express(); 

app.use(cors());
app.use(express.json())

mongoose.connect(`mongodb://mongodb:27017/my-app`).then(()=>{
	console.log("db connected")
}).catch(err=>console.log(err.message))


app.listen(8000,()=>{
	console.log("server listing on 8000")
})
