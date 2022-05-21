/*
    Author:  Arielle Riray
    Here is the Javascript for my Sperm Game

    Game Reference: Flappy Bird, a Mobile Game, 
    Similar gameplay and concept, now converted into Javascript.
    Unlike Flappy Bird, this game does not go on forever and has an end goal.
    Also made the hops smaller and more forgiving
*/

// Connecting the html element and getContext function to allow the draw functions
const sg = document.getElementById("spermgame");
const context = sg.getContext("2d");

//-----------------------------------------------------------------
/* ASSETS LOADING SECTION START*/

// Loading in the sprites

const staticbg = new Image();
staticbg.src = "img/background.png";

const movefg = new Image();
movefg.src = "img/foreground.png";

const readyscreen = new Image();
readyscreen.src = "img/ready.png";

const gameoverP = new Image();
gameoverP.src = "img/gameover.png";

const winScreen = new Image();
winScreen.src = "img/gamewin.png";

const cell= new Image();
cell.src = "img/cell.png";

const player = new Image();
player.src = "img/player.png";

const pillars = new Image();
pillars.src = "img/pillars.png";

// Loading in sounds
const SCORE_SOUND = new Audio();
SCORE_SOUND.src = "audio/scoreUp.wav";

const SWIM_SOUND = new Audio();
SWIM_SOUND.src = "audio/swim.wav";

const COLLIDE_SOUND = new Audio();
COLLIDE_SOUND.src = "audio/hit.wav";

const WIN_SOUND = new Audio();
WIN_SOUND.src = "audio/win.wav";

/* ASSETS LOADING SECTION END */
//-----------------------------------------------------------------


//-----------------------------------------------------------------
/* CONSTANT VARIABLES SECTION START*/
let fps = 0;
const degreeConv = Math.PI/180;
const count = {gapcounter : 0, } //Used for testing, deprecated now
const phase = { gameplay: 0, readyUp : 0, inGame : 1, death : 2, goal : 3, } // This helps me keep track what phase the game is in
/* CONSTANT VARIABLES SECTION END */
//-----------------------------------------------------------------


//-----------------------------------------------------------------
/* DRAW FUNCTIONS/GAME OBJECTS SECTION START*/

// Here is the draw function for the background layers, which is static the whole time
const bg = {
    draw : function(){
        context.drawImage(staticbg, 0, 0, 275, 226, 0, sg.height - 226, 275, 226);
        context.drawImage(staticbg, 0, 0, 275, 226, 275, sg.height - 226, 275, 226);
    }     
}

// Draws the ready screen
const readyUp = {
    x : sg.width/2 - 280/2,    
    draw: function(){
        if(phase.gameplay== phase.readyUp) {
            context.drawImage(readyscreen, 0, 0, 280, 400, this.x, 40, 280, 400);
        }
    }
}

// Draws the game over screen
const gameOver = {
    x : sg.width/2 - 225/2, 
    draw: function(){
        if(phase.gameplay== phase.death){
            context.drawImage(gameoverP, 0, 0, 225, 202, this.x, 90, 225, 202);   
        }
    } 
}

//Draws the You win Screen
const gameWin = {
    x : sg.width/2 - 225/2, 
    draw: function(){
        if(phase.gameplay== phase.goal){
            context.drawImage(winScreen, 0, 0, 225, 202, this.x, 90, 225, 202);   
        }
    } 
} 

// Here is the draw function for the background layers, which moves to the left to create illusion of movement
const fg = {
    h: 115, dx : 2, w : 200, x: 0, //movement variable 

    draw : function(){
        context.drawImage(movefg, 0, 0, 200, 115, this.x, sg.height - 112, 200, 115);
        context.drawImage(movefg, 0, 0, 200, 115, this.x + 200, sg.height - 112, 200, 115);
    },
    execute: function(){
        if(phase.gameplay== phase.inGame){
            this.x = (this.x - this.dx)%(this.w/2); //Moves fg to the left
        }
    }
}

// Here is the draw function for the egg, which moves to the left and appears when the player reaches a score of 18
const eggGoal = {
    x : sg.width+100,
    dx : 2,
    draw : function(){
     if(scorenumber.scoreNum == 18 || scorenumber.scoreNum == 19 || phase.gameplay== phase.goal) {
            context.drawImage(cell, 0, 0, 133, 133, this.x, sg.height - 230, 133, 133); }
    },
    execute: function(){
    if(scorenumber.scoreNum ==18 || scorenumber.scoreNum == 19 || phase.gameplay== phase.goal) {
        if(phase.gameplay== phase.inGame){
            this.x = (this.x - this.dx) //Moves egg to the left
            }
        }
    },
    reset : function(){
        this.x = sg.width+100;
    }
}

// Here is the draw function for the Score
const scorenumber= {
    scoreNum : 0,
    draw : function(){

        if (this.scoreNum == 20) { //Sets game into win phase when player reaches 20 score
        phase.gameplay= phase.goal;
            } 

        context.strokeStyle = "#000";
        context.fillStyle = "#FFF"; //Makes the text stand out more with an outline
        
        if(phase.gameplay== phase.inGame){ //Shows up score ingame
            context.lineWidth = 3;
            context.font = "45px Bungee";
            context.fillText(this.scoreNum, (sg.width/2)-10, 50);
            context.strokeText(this.scoreNum, (sg.width/2)-10, 50);
        
        //Shows score at the end of a game if win or death
        }else if((phase.gameplay== phase.death) || (phase.gameplay== phase.goal)){ 
            context.font = "28px Bungee";
            context.fillText(this.scoreNum, 130, 233);
            context.strokeText(this.scoreNum, 130, 233);
        }
    },

    //Resets score after game is restarted
    reset : function() {
        this.scoreNum = 0;
    }
}

//Here is the object for the player themselves
const sperm = {
    x : 50, y : 150, w : 50, h : 26,
    spermarea : 12, frame : 0, YDownMovement : 0.22,
    bounceswim : 3.4, speed : 0, spin : 0, 
    animation : [
        {sX: 0, sY : 0},
        {sX: 0, sY : 27},
        {sX: 0, sY : 52},
        {sX: 0, sY : 27}
    ],  //Measures animation dimensions from sprite sheet
    
    //Player movement/animation referenced from the mobile game: Flappy Bird

    draw : function(){ //Draws the sperm as it moves
        let sperm = this.animation[this.frame];
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.spin);
        context.drawImage(player, sperm.sX, sperm.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);   
        context.restore();
    },
    
    bounce : function(){ //Function called in click event
        this.speed = - this.bounceswim;
    },

    execute: function(){
        // Let's the sperm animation start slowly'
        this.period = phase.gameplay== phase.readyUp ? 9 : 4;
        // Frames goes up when game starts
        this.frame += fps % this.period == 0 ? 1 : 0;
        // Frames alternate between 4 sets of sperm sprites
        this.frame = this.frame % this.animation.length;
        
        if(phase.gameplay== phase.readyUp) {
            this.y = 151; 
            // This puts the sperm back in place when game is restarted
            this.spin = 0 * degreeConv;
        }else{
        // If it hits the ground, the sperm dies
            this.speed += this.YDownMovement;
            this.y += this.speed;          
            if(this.y + this.h/2 >= sg.height - fg.h) {
                this.y = sg.height - fg.h - this.h/2;
                //If phase changes, changes into death phase
                if(phase.gameplay == phase.inGame) {
                    COLLIDE_SOUND.play();
                    phase.gameplay= phase.death;
                }
            } 
            
            // Changes the angle of the sperm as it falls down
            if(this.speed >= (this.bounceswim+1)) {
                this.spin = 75 * degreeConv;
                this.frame = 1;
            } else {
                this.spin = -20 * degreeConv;
            }
        }      
    },
    speedReset : function(){ //Sets speed back to normal
        this.speed = 0;
    }
}

// Object for the pillars of flesh which acts as obstacles
const fleshPillars = {
    pos : [],
    below:{
        sX : 0,
        sY : 0
    },
    above : {
        sX : 51,
        sY : 0
    },
    w : 53, h : 399, gap : 145, maxYPos : -150, dx : 2,
    
    draw : function()
    {
        for(let i  = 0; i < this.pos.length; i++){                

            let p = this.pos[i];    
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            //Draws the top pipe
            context.drawImage(pillars, this.above.sX, this.above.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            // draws the bottom pipe
            context.drawImage(pillars, this.below.sX, this.below.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    //Pillar code referenced from the mobile game, Flappy Bird
    execute: function(){

        if(phase.gameplay!== phase.inGame) {
            return; }
        
        if(fps%30 == 0) { //This is what makes the gameplay progess harder in difficulty, closing up the pillars
             this.gap = this.gap - 1;
        }

        /*
        This code was originally to make the player win after they reach 2000 frames which ould be around 20 obstacles
        I removed this since I found the score counter a better way to determine if the player wins rather by frames
        if(fps == 2000) {
            phase.gameplay == phase.win;
        } */

        if(fps%100 == 0){ //Randomizes how the pillars will spawn, spawns every 100 frames
            this.pos.push({
                x : sg.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }

        //Below is the code which acts as collision detection, which runs every frame
        for(let i = 0; i < this.pos.length; i++){
            let p = this.pos[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // Detects collision for pillars, had to make 4 different conditions to be met
            let c1 = sperm.x + sperm.spermarea;
            let c2 = sperm.x - sperm.spermarea;
            let c3 = sperm.y + sperm.spermarea;
            let c4 = sperm.y - sperm.spermarea;
            let c5 = p.y + this.h;

            //Top pillars collision
            if(c1 > p.x && c2 < p.x + this.w && c3 > p.y && c4 < c5){
                phase.gameplay= phase.death;
                COLLIDE_SOUND.play(); //Sets game into death phase if hit detected
            }

            // Bottom pillars collision
            if(c1 > p.x && c2 < p.x + this.w && c3 > bottomPipeYPos && c4 < bottomPipeYPos + this.h){
                phase.gameplay= phase.death;
                COLLIDE_SOUND.play(); //Sets game into death phase if hit detected
            }
            
            // This move the pillars to the left
            p.x -= this.dx;
            
            // Deletes the pipes after going off screen to conserve space
            if(p.x + this.w <= 0){
                this.pos.shift();
                SCORE_SOUND.play();
                scorenumber.scoreNum += 1; //Sets score higher when a pipe is off screen
            }
        }
    },
    
    reset : function(){ //Reset function if player restarts game
        this.pos = [];
        this.gap = 145;
    }
    
}

/* DRAW FUNCTIONS/GAME OBJECTS SECTION END*/
//-----------------------------------------------------------------

//-----------------------------------------------------------------
/* MOUSE FUNCTIONALITY AND GAME PHASES SECTION START*/

// Allows the user to interact with the game using the mouse button
sg.addEventListener("click", function(evt){
    let selection = sg.getBoundingClientRect();
    let Y_click = evt.clientY - selection.top;
    let X_click = evt.clientX - selection.left; 
    //To allow user to restart game

    //The various phases the game can be in, helps organize which function should execute
    switch(phase.gameplay){

        case phase.inGame: //Gameplay phase
            if(sperm.y - sperm.spermarea <= 0) {
                return;
                }
            SWIM_SOUND.play();
            sperm.bounce();
            break;

        case phase.readyUp: //Ready screen 
            phase.gameplay= phase.inGame;
            break;

        case phase.death: //When player dies, option to restart
            if(X_click >= 122 && X_click <= 122 + 85 && Y_click >= 265 && Y_click <= 265 + 31){
                fleshPillars.reset();
                scorenumber.reset();
                sperm.speedReset();
                eggGoal.reset();
                phase.gameplay= phase.readyUp;
            }
            break;

        case phase.goal: //When player wins, has a sound played, option to restart
            WIN_SOUND.play();
            if(X_click >= 122 && X_click <= 122 + 85 && Y_click >= 265 && Y_click <= 265 + 31){
                fleshPillars.reset();
                scorenumber.reset();
                sperm.speedReset();
                eggGoal.reset();
                phase.gameplay= phase.readyUp;
            }
            break; 
    } 
});

/* MOUSE FUNCTIONALITY AND GAME PHASES SECTION END */
//-----------------------------------------------------------------

//-----------------------------------------------------------------
/* MAIN FUNCTION CALLING SECTION START */


// These functions are executed every frame
function execute(){
    sperm.execute();
    fg.execute();
    eggGoal.execute();
    fleshPillars.execute();
}

// All the draw functions, all called every frame
//some draw functions have a conditional, so some may not show up until needed
function draw(){
    context.fillStyle = "#6B0612"; //The background 
    context.fillRect(0, 0, sg.width, sg.height); //Fills background

    bg.draw();
    fleshPillars.draw();
    fg.draw();
    sperm.draw();
    eggGoal.draw(); 
    gameOver.draw();
    gameWin.draw(); 
    scorenumber.draw();
    readyUp.draw();
    //Set in a specific order for a layer effect
}

// This function loops the main functions every frame, and counts fps
function loop(){
    execute();
    draw();
    fps++;
    requestAnimationFrame(loop);
}

//The function actually being called
loop();

/* MAIN FUNCTION CALLING SECTION END */
//-----------------------------------------------------------------
