const express = require("express"); //install w/ npm install express mongoose body-parser --save
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.port||3000;

//Helper for getting files in public folder dir
function ppath(p){return path.join(__dirname,"public",p);}

//Middleware for sending static data
app.use(express.static(path.join(__dirname,"public")));
//Set up middleware to parse json requests
app.use(bodyParser.json());

//MongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudapp"; //store const uri
mongoose.connect(mongoURI); //connect
const db = mongoose.connection; //store connection
db.on("error",console.error.bind(console,"MongoDB connection error")); //connection error handling
db.once("open",()=>{console.log("Connected to MongoDB Database")})

//Setup Mongoose Schema
const foodSchema = new mongoose.Schema({
    name:String,
    foodType:String,
    ranking:Number
});
const Food = mongoose.model("Food",foodSchema,"fooddata");

//=====Routes=====
app.get("/",(req,res)=>{
    res.sendFile(ppath("index.html"));
});
app.get("/food",async(req,res)=>{
    try{
        const food = await Food.find();
        res.json(food);
    }catch(e){res.sendStatus(500).json({error:"Failed to get food."});}
});
//=====End-Routes=====

//Starts server
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});