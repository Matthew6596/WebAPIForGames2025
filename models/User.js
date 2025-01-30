const mongoose = require("mongoose");

//User schema
const userSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    email:{type:String,required:true,unique:true}
});
const User = mongoose.model("User",userSchema,"userdata");

module.exports = User;