require("dotenv").config();
const express = require("express"); //install w/ npm install express mongoose body-parser --save
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //unrelated but important: https://api.thecatapi.com/v1/images/search?mime_types=gif
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Food = require("./models/Food");

const app = express();
const port = process.env.port||3000;

//Helper for getting files in public folder dir
function ppath(p){return path.join(__dirname,"public",p);}

//Middleware for sending static data (only for .css and .js) -stole from gpt :(
app.use((req, res, next) => { //previous express.static let users bypass authentication by using /page.html instead of /page
    if (!req.path.endsWith('.html')) //just realized perhaps instead of this private .html pages shouldn't be in public folder
      express.static(path.join(__dirname, 'public'))(req, res, next);
    else next();
});
//Set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
//Setting up session variable
app.use(session({secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:true,cookie:{secure:false/*true for https*/}}));

function isAuthenticated(req,res,next){
    if(req.session.user)return next();
    res.redirect("/login");
}

//MongoDB connection setup
const mongoURI = process.env.MONGODB_URI; //store const uri
mongoose.connect(mongoURI); //connect
const db = mongoose.connection; //store connection
db.on("error",console.error.bind(console,"MongoDB connection error")); //connection error handling
db.once("open",()=>{console.log("Connected to MongoDB Database")});

//=====Routes=====
app.get("/",(req,res)=>{res.sendFile(ppath("index.html"));});
app.get("/additem.html",isAuthenticated,(req,res)=>{res.sendFile(ppath("additem.html"));});
app.get("/classIndex",isAuthenticated,(req,res)=>{res.sendFile(ppath("classIndex.html"));});
app.get("/classAddUser",(req,res)=>{res.sendFile(ppath("classAddUser.html"));});
app.get("/addfooditem",isAuthenticated,(req,res)=>{res.sendFile(ppath("additem.html"));});
app.get("/userauthenticated",(req,res)=>{ if(req.session.user)res.sendStatus(201); else res.sendStatus(401); });
app.get("/register",(req,res)=>{res.sendFile(ppath("register.html"));});
app.get("/currentuser",(req,res)=>{if(req.session.user)res.json(req.session.user);});

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
app.get("/user",async(req,res)=>{
    try{
        const user = await User.find();
        res.json(user);
    }catch(e){res.status(500).json({error:"Failed to get users."});}
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
app.post("/adduser",async(req,res)=>{
    try {
        const newUser = new User(req.body);
        newUser.password = bcrypt.hashSync(newUser.password,10);
        //Save new user
        await newUser.save();
        res.redirect("/classIndex");
    } catch (e) {res.status(501).json({error:"Failed to add new user: "+e});}
});
app.post("/login",async(req,res)=>{
    const {username,password}=req.body;

    const user = await User.findOne({username});
    //if username exists and password matches user list
    if(user&&bcrypt.compareSync(password,user.password)){ 
        req.session.user = username;
        res.redirect("/");
    }else{
        req.session.error = "invalid user";
        res.redirect("/login");
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
app.get("/login",(req,res)=>{
    res.sendFile(ppath("login.html"));
});
app.get("/logout",(req,res)=>{
    req.session.destroy(()=>{res.redirect("/")});
});
//=====End-Routes=====

//Starts server
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

module.exports = app;