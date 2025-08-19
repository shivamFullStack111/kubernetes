const express = require('express'); 
const cors = require('cors') 
const mongoose = require('mongoose')

const app = express(); 

app.use(cors());
app.use(express.json())

//mongodb:27017 in below mongodb is name of kubernetes mongo service we can access mongo by their k8s deployment service name because both backend and mongo are deployed in same pod
mongoose.connect(`mongodb://mongodb:27017/my-app`).then(()=>{
	console.log("db connected")
}).catch(err=>console.log(err.message))


app.listen(8000,()=>{
	console.log("server listing on 8000")
})
