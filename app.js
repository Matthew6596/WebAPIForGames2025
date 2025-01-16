const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

function getpath(f){
    return path.join(__dirname,"public",f);
}

//Middleware to serve static data
app.use(express.static(path.join(__dirname,"public")));
//

//Routes
app.get("/",(req,res)=>{
    res.sendFile(getpath("index.html"));
});
app.get("/testjson",(req,res)=>{
    res.sendFile(getpath("json/games.json"));
});
app.get("/login",(req,res)=>{
    res.sendFile(getpath("login.html"));
});
app.get("/additem",(req,res)=>{
    res.sendFile(getpath("additem.html"));
});
app.get("/statuscode",(req,res)=>{
    res.sendStatus(402); //api.weather.gove/gridpints/TOP
});

/*setTimeout(()=>{
    console.log("Hi, 2 seconds passed.");
},2000);
setTimeout(()=>{
    console.log("Hi, now.");
},0);*/

app.listen(port,()=>{
    console.log("Server is running on port: "+port);
});

