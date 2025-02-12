const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    name:String,
    score:Number,
    game:String
});
const Highscore = mongoose.model("Highscore",scoreSchema,"highscores");

module.exports = Highscore;