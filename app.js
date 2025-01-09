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
    //res.send("Hi bruh");
    res.sendFile(getpath("index.html"));
});
app.get("/testjson",(req,res)=>{
    res.sendFile(getpath("json/games.json"));
});

setTimeout(()=>{
    console.log("Hi, 2 seconds passed.");
},2000);
setTimeout(()=>{
    console.log("Hi, now.");
},0);

app.listen(port,()=>{
    console.log("Server is running on port: "+port);
});

