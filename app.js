const express = require("express"); //install w/ npm install express mongoose body-parser --save
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //unrelated but important: https://api.thecatapi.com/v1/images/search?mime_types=gif
const path = require("path");

const app = express();
const port = process.env.port||3000;

//Helper for getting files in public folder dir
function ppath(p){return path.join(__dirname,"public",p);}

//Middleware for sending static data
app.use(express.static(path.join(__dirname,"public")));
//Set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

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
app.get("/classIndex",(req,res)=>{res.sendFile(ppath("classIndex.html"));});
//read
app.get("/food",async(req,res)=>{
    try{
        const food = await Food.find();
        food.sort((a,b)=>a.toObject().ranking-b.toObject().ranking);
        res.json(food);
    }catch(e){res.status(500).json({error:"Failed to get food."});}
});
app.get("/food/:id",async(req,res)=>{
    try {
        const food = await Food.findById(req.params.id);
        if(!food) return res.status(404).json({error:"Food not found."});
        res.json(food);
    } catch (e) {res.status(500).json({error:"Failed to get food."});}
});
//create
app.post("/addfood",async(req,res)=>{
    try {
        const newFood = new Food(req.body);
        const saveFood = await newFood.save();
        //res.status(201).json(saveFood);
        res.redirect("/classIndex");
    } catch (e) {res.status(501).json({error:"Failed to add new food."});}
});
//update
app.put("/updatefood/:id",async(req,res)=>{
    //example promise statement for async
    Food.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).then((updatedFood)=>{
        if(!updatedFood) return res.status(404).json({error:"Food not found."});
        res.json(updatedFood);
    }).catch((e)=>{res.status(400).json({error:"Failed to update food."});});
});
//delete
app.delete("/deletefood/name",async(req,res)=>{
    /*try {
        const foodName = req.query;
        const food = await Food.find(foodName);
        if(food.length === 0)return res.status(404).json({error:"Food not found."});
        const deletedFood = await Food.findOneAndDelete(foodName);
        res.json({message:"Food deleted successfully."});
    } catch (e) {
        res.status(404).json({error:"Food not found."});
    }*/
    Food.findOneAndDelete(req.query).then((deletedFood)=>{
        if(deletedFood.length===0) return res.status(404).json({error:"Food not found."});
        res.json({message:"Food deleted successfully."});
    }).catch((e)=>{res.status(404).json({error:"Food not found."});});
});
//=====End-Routes=====

//Starts server
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});