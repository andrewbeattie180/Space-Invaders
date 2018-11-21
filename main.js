
//
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//Variables to describe the spaceship container
let x = canvas.width/2 ; //The middle of the canvas
let y = canvas.height - 40; // The height of the ship from the bottom
let dx = 2; //number of pixels horizontally to move on redraw
let dy = 2; //speed of bullet

let shipWidth = 80;
let shipHeight = 80;
let shipX = (canvas.width - shipWidth)/2;
let shipTop = (canvas.height - (shipHeight+20));
let imgShip = new Image();
imgShip.src = "./img/starfighter.svg";

//Variable to describe the aliens


let alienColumnCount = 11;
let alienRowCount = 5;
let alienWidth = 60;
let alienHeight = 60;
let alienPadding = (3);
let alienOffSetTop = 70;
let alienOffSetLeft = (5);
let imgAlien = new Image();
imgAlien.src = './img/cooking-pot.svg'

let aliens = [];
for (let c = 0;c<alienColumnCount;c++){
    aliens[c]=[];
    for (let r = 0;r<alienRowCount;r++){
        aliens[c][r] = {x:0,y:0,status:1};
    }
}


var rightPressed = false;
var leftPressed = false;
var spacePressed = false;

document.addEventListener("keydown", keyDownHandler, false)
document.addEventListener("keyup", keyUpHandler, false)

function keyDownHandler(e){
if (e.keyCode == 39) {
   rightPressed = true;
} else if (e.keyCode == 37) {
   leftPressed = true;
} else if (e.keyCode == 32) {
   spacePressed = true;
}}

function keyUpHandler(e){
if (e.keyCode == 39) {
   rightPressed = false;
} else if (e.keyCode == 37) {
   leftPressed = false;
} else if (e.keyCode == 32) {
   spacePressed = false;
}}


//Variables to describe the bullets from the spaceship
let bulletWidth = 3;
let bulletHeight = 10;
let bulletX =(shipX + (shipWidth-bulletWidth)/2);

const drawShip = () => {
    ctx.drawImage(imgShip,shipX,canvas.height-(shipHeight+20),shipWidth,shipHeight)

};

const drawBullet = () => {
    ctx.beginPath();
    ctx.rect(bulletX,shipTop,bulletWidth,bulletHeight);
    ctx.fillStyle = 'lime';
    ctx.fill();
    ctx.closePath();
}

const drawAlien = () => {
    for (let c = 0; c < alienColumnCount; c++){
        for (let r = 0; r < alienRowCount; r++){
            if (aliens[c][r].status == 1){
                let alienX = c * (alienWidth + alienPadding) + alienOffSetLeft;
                let alienY = r * (alienHeight + alienPadding) + alienOffSetTop;
                aliens[c][r].x = alienX;
                aliens[c][r].y = alienY;
                ctx.drawImage(imgAlien,alienX,alienY,alienWidth,alienHeight);
            }
        }
    }
}

const collisionDetection = () => {
    for (let c= 0;c<alienColumnCount;c++){
        for (let r = 0;r<alienRowCount;r++){
            var alien = aliens[c][r];
            if (alien.status == 1){             //If alien is alive
                if(
                    x > alien.x &&              //bullet dimensions are
                    x < alien.x + alienWidth && //within the dimensions of
                    y > alien.y &&              //the alien 
                    y < alien.y + alienHeight
                ){
                    alien.status = 0            //alien dies
                }
            }
        }
    }
}


const draw = () => {  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawAlien();
    if (rightPressed && shipX < canvas.width - shipWidth){
        shipX += 7;
        bulletX +=7;
    } else if (leftPressed && shipX >0){
        shipX -= 7;
        bulletX -=7;
    }
    if (spacePressed){
        drawBullet();
    }

    x+=dx;
};
setInterval(draw,10);
