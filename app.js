const express = require("express"); //install w/ npm install express mongoose body-parser --save
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //unrelated but important: https://api.thecatapi.com/v1/images/search?mime_types=gif
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const app = express();
const port = process.env.port||3000;

//Helper for getting files in public folder dir
function ppath(p){return path.join(__dirname,"public",p);}

//Middleware for sending static data
app.use(express.static(path.join(__dirname,"public")));
//Set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
//Setting up session variable
app.use(session({secret:"12345",resave:false,saveUninitialized:true,cookie:{secure:false/*true for https*/}}));

//Create fake user
const user = {
    admin:bcrypt.hashSync("12345",10),
};

function isAuthenticated(req,res,next){
    if(req.session.user)return next();
    res.redirect("/classLogin");
}

//MongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudapp"; //store const uri
mongoose.connect(mongoURI); //connect
const db = mongoose.connection; //store connection
db.on("error",console.error.bind(console,"MongoDB connection error")); //connection error handling
db.once("open",()=>{console.log("Connected to MongoDB Database")});

//Setup Mongoose Schema
const foodSchema = new mongoose.Schema({
    name:String,
    foodType:String,
    ranking:Number
});
const Food = mongoose.model("Food",foodSchema,"fooddata");

//=====Routes=====
app.get("/",(req,res)=>{res.sendFile(ppath("additem.html"));}); //<<<This does nothing!
app.get("/classIndex",isAuthenticated,(req,res)=>{res.sendFile(ppath("classIndex.html"));});
//read
app.get("/food",async(req,res)=>{
    try{
        const food = await Food.find();
        food.sort((a,b)=>a.ranking-b.ranking);
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

        //negative and 0 ranking not allowed
        if(newFood.ranking<=0)newFood.ranking=1;

        //check and adjust the ranking values
        const food = await Food.find();
        let largestRank=1;
        food.forEach((e)=>{
            if(e.ranking>largestRank)largestRank=e.ranking;
            if(newFood.ranking<=e.ranking)Food.findByIdAndUpdate(e.id,{ranking:e.ranking+1},{new:true,runValidators:true}).then((up)=>console.log(up.toJSON()));
        });

        //make sure no gaps in ranking
        if(newFood.ranking>largestRank)newFood.ranking=largestRank+1;

        //Save new food
        await newFood.save();
        
        //res.status(201).json(saveFood);
        res.redirect("/");
    } catch (e) {res.status(501).json({error:"Failed to add new food."});}
});
app.post("/classLogin",(req,res)=>{
    const {username,password}=req.body;
    console.log(user[username]+", "+user[password]); //undefined
    if(user[username]&&bcrypt.compareSync(password,user[username])){
        req.session.user = username;
        res.redirect("/");
    }else{
        console.log("bruh error");
        req.session.error = "invalid user";
        res.redirect("/classLogin")
    }
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
    Food.findOneAndDelete(req.query).then(async(deletedFood)=>{
        if(deletedFood.length===0) return res.status(404).json({error:"Food not found."});
        
        //check and adjust the ranking values
        const food = await Food.find();
        food.forEach((e)=>{
            if(deletedFood.ranking<e.ranking)Food.findByIdAndUpdate(e.id,{ranking:e.ranking-1},{new:true,runValidators:true}).then((up)=>console.log(up.toJSON())).catch((e)=>{res.status(400).json({error:"Failed to update food rankings"})});
        });
        res.json({message:"Food deleted successfully."});
    }).catch((e)=>{res.status(404).json({error:"Food not found."});});

});

app.get("/classLogin",(req,res)=>{
    res.sendFile(ppath("classLogin.html"));
});
//=====End-Routes=====

//Starts server
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});