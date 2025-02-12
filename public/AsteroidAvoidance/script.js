var c = document.querySelector("canvas");
var ctx = c.getContext("2d");
var timer = requestAnimationFrame(main);
var gravity = 1;
var asteroids = new Array();
var numAsteroids = 10;
var gameOver = true;
var score = 0;
var gameStates = [];
var currentState = 0;
var ship;
var highScore = 0;
var bgMain = new Image();
var cookieSprite = new Image();
var highScoreElements = document.querySelector('.highscore');
var highscoreForm = document.getElementById('highscoreForm');
var leaderboardElements = document.querySelector('.leaderboards')

bgMain.src = "images/rocks.jpg";
cookieSprite.src = "images/cookie.png";

//Fix form elements positions to be centered
for(let element of highscoreForm.elements){
    let elementLeft = parseInt(element.style.left.substring(0,element.style.left.indexOf("px")))
    element.style.left= (elementLeft+c.getBoundingClientRect().left)+"px";
}

//event listener to trigger main when image is loaded
bgMain.onload = function(){
    main();
}

cookieSprite.onload = function(){
    main();
}

function randomRange(high, low){
    return Math.random() * ( high - low) + low;
}

//Asteroids GameObject Class
function Asteroids(){
    this.radius = randomRange(15,2);
    this.x = randomRange(0 + this.radius, c.width - this.radius); 
    this.y = randomRange(0 + this.radius, c.height - this.radius)- c.height;
    this.vx = randomRange(-5,-10);
    this.vy = randomRange(10,5);
    this.color = "white";

    this.draw = function(){
        ctx.save();
        //draws original circles for asteroids
        /*ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y, this.radius, 0, 2*Math.PI,true);
        ctx.closePath();
        ctx.fill();*/
        ctx.drawImage(cookieSprite,this.x - this.radius,this.y-this.radius,this.radius*2, this.radius*2)
        ctx.restore();

    }
}



//class for player ship
function PlayerShip(){
    this.x = c.width/2;
    this.y = c.height/2;
    this.w = 20;
    this.h = 20;
    this.vx = 0;
    this.vy = 0;
    this.up = false;
    this.left = false;
    this.right = false;
    this.flamelength = 30;

    this.draw = function(){
        ctx.save();
        ctx.translate(this.x,this.y);

        // draws afterburner flame
        if(this.up ||  this.left || this.right){
            ctx.save();
            //animate flame
            if(this.flamelength == 30){
                this.flamelength = 10;
            }
            else{
                this.flamelength = 30;
            }
            ctx.beginPath();
            ctx.fillStyle = "orange";
            ctx.moveTo(0, this.flamelength);
            ctx.lineTo(5, 5);
            ctx.lineTo(-5, 5);
            ctx.lineTo(0, this.flamelength);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.lineTo(0, -10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    this.move = function(){
        this.x += this.vx;
        this.y += this.vy;

        if(this.y > c.height - 10){
            this.y = c.height - 10;
            this.vy = 0;
        }
        //right boundary of screen
        if(this.x > c.width - 10 ){
            this.x = c.width - 10;
            this.vx = 0;
        }
        //left boundary of screen
        if(this.x < 0 + 10 ){
            this.x = 0 + 10;
            this.vx = 0;
        }

        //top boundary of screen
        if(this.y < 0 + 10){
            this.y = 0 + 10;
            this.vy = 0;
        }
    }

}

function gameStart() {
    //for loop to create all instances of asteroids
    for (var i = 0; i < numAsteroids; i++) {
        asteroids[i] = new Asteroids();
    }
    //this creates an instance of the ship
    ship = new PlayerShip();
}



//adding event listeners
document.addEventListener("keydown", keyPressDown);
document.addEventListener("keyup", keyPressUp);

function keyPressUp(e){
  //  console.log("Key released " + e.keyCode);
    if(!gameOver){
        if(e.keyCode === 38){
            ship.up = false;
        }
        if(e.keyCode === 37){
            ship.left = false;
        }
        if(e.keyCode === 39){
            ship.right = false;
        }
    }
    
}

function keyPressDown(e){
    //console.log("Key pressed " + e.keyCode);
    if(!gameOver){
        if(e.keyCode === 38){
            ship.up = true;
        }

        if(e.keyCode === 37){
            ship.left = true;
        }
        if(e.keyCode === 39){
            ship.right = true;
        }
    }
    else{
        if (e.keyCode === 13) {
            if(currentState == 2){
                currentState = 0;
                score = 0;
                numAsteroids = 10;
                asteroids = [];
                gameStart();
                main();
            }
            else{
                gameStart();
                gameOver = false;
                currentState = 1;
                main();
                scoreTimer();
            }
        }
        if(e.keyCode === 76) //l key
        {
            if(currentState==0){
                //go to leaderboard
                currentState = 3;
                main();
            }else if(currentState==3){
                //go to main menu
                currentState=0;
                main();
            }
            
        }
    }
}

//GameStates state machine. This is what sets up menu screens and main agme scene

//---Main Menu---
gameStates[0] = function(){
    highScoreElements.style.display = "none";
    ctx.drawImage(bgMain,0,0,c.width,c.height);
    ctx.save();
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center"
    ctx.fillText("Asteroid Avoidance", c.width/2, c.height/2 - 30);
    ctx.font = "15px Arial";
    ctx.fillText("Press Enter to Start", c.width/2, c.height/2 + 20);
    ctx.fillText("Press 'L' for Leaderboards", c.width/2, c.height/2 + 40);
    ctx.restore();
}

//---Game Scene---
gameStates[1] = function(){
    //Draws score to the HUD
    ctx.save();
    ctx.font = "15px Arial";
    ctx.fillStyle = 'white';
    ctx.fillText("Score: " + score.toString(), c.width - 150, 30);
    ctx.restore();
    

    //ship.vy += gravity;

    //Key presses move the ship
    if(ship.up){
        ship.vy = -10;
    }
    else{
        ship.vy = 3;
    }

    if(ship.left){
        ship.vx = -3;
    }
    else if(ship.right){
        ship.vx = 3;
    }
    else{
        ship.vx = 0;
    }
    // loops through asteroid instances in array and draws them to the screen
    for(const element of asteroids){
        var dX = ship.x - element.x;
        var dY = ship.y - element.y;
        var dist = Math.sqrt((dX*dX)+(dY*dY));

        //checks for collision between asteroid and ship
        if(detectCollision(dist, (ship.h/2 + element.radius))){
           // console.log("Colliding with asteroid " + i);
            
            currentState = 2;
            gameOver = true;
            //document.removeEventListener("keydown", keyPressDown);
            //document.removeEventListener("keyup", keyPressUp);
        }

        //recycles asteroids
        if(element.y > c.height + element.radius){
            element.y = randomRange(c.height -element.radius,element.radius)-c.height;
            element.x = randomRange(c.width + element.radius,element.radius);
        }

        if(!gameOver){
            element.y += element.vy;
        }

        element.draw();
    }
    
    ship.draw();
    if(!gameOver){
        ship.move();
    }

    while(asteroids.length < numAsteroids){
        asteroids.push(new Asteroids());
    }
}

//---Game Over Screen---
gameStates[2] = function(){
    canSubmit=true;
    highScoreElements.style.display = "block";
    if(score > highScore){
        highScore = score;
        ctx.save();
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center"
        ctx.fillText("Game Over, Your score was: " + score.toString(), c.width/2, c.height/2 - 60);
        ctx.fillText("Your New High Score is: " + highScore.toString() , c.width/2, c.height/2 - 30);
        ctx.fillText("New Record!!", c.width/2, c.height/2 );
        ctx.font = "15px Arial";
        ctx.fillText("Press Enter to Start", c.width/2, c.height/2 + 20);
        ctx.restore();

    }
    else{
        ctx.save();
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center"
        ctx.fillText("Game Over, Your score was: " + score.toString(), c.width/2, c.height/2 - 60);
        ctx.fillText("Your high Score is: " + highScore.toString(), c.width/2, c.height/2 - 30);
        ctx.font = "15px Arial";
        ctx.fillText("Press Enter to Start", c.width/2, c.height/2 + 20);
        ctx.restore();
    }

    
}

//---Leaderboards---
var loadedLeaderboards = [];
gameStates[3] = async function(){
    highScoreElements.style.display = "none";
    ctx.drawImage(bgMain,0,0,c.width,c.height);
    ctx.save();
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center"
    ctx.fillText("Leaderboards", c.width/2, 40);
    ctx.font = "15px Arial";
    ctx.fillText("Press 'L' to return to Menu", c.width/2, 70);
    let vertOffset = 100;
    await loadLeaderboards();
    loadedLeaderboards.forEach(el => {
        ctx.fillText(`${el.name} | ${el.score}`, c.width/2, vertOffset);
        vertOffset += 30;
    });
    ctx.restore();
}

//---Main Game Loop---
function main() {
    ctx.clearRect(0, 0, c.width, c.height);
   
    if (!gameOver) {
        timer = requestAnimationFrame(main);
    }
    gameStates[currentState]();
}


//---Collision Detection Function---
function detectCollision(distance, calcDistance){
    return distance < calcDistance;
}


//--Score Timer Function---
function scoreTimer(){
    if(!gameOver){
        score++;
        //using modulus divide the score by 5 and inf the remainder is zero addastteroids
        if(score % 5 == 0){
            numAsteroids += 5;
            console.log(numAsteroids);
        }
       // console.log(score);
        setTimeout(scoreTimer, 1000);
    }
}

//---DB shenanigans---
var canSubmit=true;
function submitHighscore(){
    if(!canSubmit)return;
    var _name = document.getElementById("name").value;
    var scoreData = {name:_name,score:score};
    const sendScore = async()=>{
        try {
            const _q = "/addAsteroidHighscore";
            if(!canSubmit)return;
            const res = await fetch(_q,{
                method:"post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(scoreData)
            });
            if(!res.ok)throw new Error("Failed to send highscore");
            canSubmit=false;
            currentState = 0;
            score = 0;
            numAsteroids = 10;
            asteroids = [];
            gameStart();
            main();
        } catch (e) {console.error("Error: ",e);}
    }
    sendScore();
}
async function loadLeaderboards(){
    const getScores = async()=>{
        try {
            const _q = "/getAsteroidLeaderboards";
            const res = await fetch(_q,{method:"get"});
            if(!res.ok)throw new Error("Failed to get highscores");
            const list= await res.json();
            loadedLeaderboards = list;
        } catch (e) {console.error("Error: ",e);}
    }
    await getScores();
}