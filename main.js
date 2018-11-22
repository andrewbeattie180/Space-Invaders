
//
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//Variables to describe the spaceship container
let x = canvas.width/2 ; //The middle of the canvas
let y = canvas.height - 40; // The height of the ship from the bottom
let dx = 0.3; //number of pixels horizontally to move on redraw
let dy= -20;
let bulletSpeed = -2; //speed of bullet (vertical movement)

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
let imgAlien1 = new Image();
let imgAlien2 = new Image();
let imgAlien3 = new Image();
imgAlien1.src = './img/cooking-pot.svg'
imgAlien2.src = './img/alien-bug.svg'
imgAlien3.src = './img/scout-ship.svg'

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
//Add to main js:
document.addEventListener('keydown',fire,false)

function keyDownHandler(e){
if (e.keyCode == 39) {
   rightPressed = true;
} else if (e.keyCode == 37) {
   leftPressed = true;
} }

function keyUpHandler(e){
if (e.keyCode == 39) {
   rightPressed = false;
} else if (e.keyCode == 37) {
   leftPressed = false;
} 
//Keydown and keyup handler for space removed.

}

function fire(e){
    if(e.keyCode == 32){
    let bullet = {x: bulletX, y: bulletY, status:1};
    bullets.push(bullet);
    drawBullet(bullets)
    }
}

//Variables to describe the bullets from the spaceship
let bulletWidth = 3;
let bulletHeight = 10;
let bulletX =(shipX + (shipWidth-bulletWidth)/2);
let bulletY=shipTop;
let bullets = [];


const drawShip = () => {
    ctx.drawImage(imgShip,shipX,canvas.height-(shipHeight+20),shipWidth,shipHeight)

};

const drawBullet = (bullets) => {
   //For loop added:
   
    for (let i =0;i<bullets.length;i++){
        if(bullets[i].status == 1){
           if (bullets[i].y > bulletHeight){
                ctx.beginPath();
                ctx.rect(bullets[i].x,bullets[i].y,bulletWidth,bulletHeight);
                ctx.fillStyle = 'lime';
                ctx.fill();
                ctx.closePath();
                spacePressed = !spacePressed;
                bullets[i].y += bulletSpeed;
                }
            else {
                bullets[i].status = 0
                bullets.splice(i, 1);

            }
        }
    }
}


const drawAlien = () => {
    for (let c = 0; c < alienColumnCount; c++){
        for (let r = 0; r < alienRowCount; r++){
            if (aliens[c][r].status == 1){
                let alienX = c * (alienWidth + alienPadding) + alienOffSetLeft;
                let alienY = r * (alienHeight + alienPadding) + alienOffSetTop;
                aliens[c][r].x = alienX;
                aliens[c][r].y = alienY;
                if(r===0){
                    ctx.drawImage(imgAlien1,alienX,alienY,alienWidth,alienHeight)}
                else if (r>0&&r<4){
                ctx.drawImage(imgAlien2,alienX,alienY,alienWidth,alienHeight)
                } else {
                ctx.drawImage(imgAlien3,alienX,alienY,alienWidth,alienHeight)
                }
            }
        }
    }
}


const alienMove = () => { // ALIEN MOVE FUNCTION
    alienOffSetLeft+=dx; // EVERY INTERVAL MOVE 2PX HORIZONTALLY
    if (alienOffSetLeft > canvas.width - alienWidth * alienColumnCount - 40 || alienOffSetLeft < 5){ // IF ALIENS MOVE WITHIN 40PX OF RIGHT HAND SIDE OR LESS THAN THE ALIEN OF SET LEFT
        dx = -dx; // MOVE 2PX
        alienOffSetTop -=dy // EACH TIME HITS LEFT/RIGHT MOVE DOWN 2PX
}};

const collisionDetection = () => {
    for (let c= 0;c<alienColumnCount;c++){
        for (let r = 0;r<alienRowCount;r++){
            var alien = aliens[c][r];
            if (alien.status == 1){             //If alien is alive
                for (let i = 0;i<bullets.length;i++){
                    if(
                    bullets[i].x > alien.x &&              //bullet dimensions are
                    bullets[i].x < alien.x + alienWidth && //within the dimensions of
                    bullets[i].y > alien.y &&              //the alien 
                    bullets[i].y < alien.y + alienHeight
                ){
                    alien.status = 0            //alien dies

                    bullets[i].status = 0       //bullet dies
                    bullets.splice(i,1)         //
                }
            }
        }
    }}
}



const draw = () => {  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawAlien();
    drawBullet(bullets);
    collisionDetection();
    if (rightPressed && shipX < canvas.width - shipWidth){
        shipX += 7;
        bulletX +=7;
    } else if (leftPressed && shipX >0){
        shipX -= 7;
        bulletX -=7;
    }
    
    

    x+=dx;
    alienMove();        //  ELLIOT: FUNCTION CALLED FOR MOVING ALIENS
};

setInterval(draw,10);
