const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name:String,
    foodType:String,
    ranking:Number
});
const Food = mongoose.model("Food",foodSchema,"fooddata");

module.exports = Food;