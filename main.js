const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//Variables to describe the spaceship container
let x = canvas.width/2 ; //The middle of the canvas
let y = canvas.height - 40; // The height of the ship from the bottom
let dx = 0.2; //number of pixels horizontally to move on redraw
let dy= -20;

let bulletSpeed = -7; //speed of bullet (vertical movement)
let alienBulletSpeed = 7;

let health = 100;
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
let alienPadding = 7;
let alienOffSetTop = 70;
let alienOffSetLeft = 5;
let deletedRows = 0;
let deletedRightColumns = 0;
let deletedLeftColumns = 0;

let imgAlien1 = new Image();
let imgAlien2 = new Image();
let imgAlien3 = new Image();
imgAlien1.src = './img/cooking-pot.svg'
imgAlien2.src = './img/alien-bug.svg'
imgAlien3.src = './img/scout-ship.svg'

let aliens = [];


for (let c = 0; c < alienColumnCount; c++){
    aliens[c]=[];
    for (let r = 0; r < alienRowCount; r++){
        aliens[c][r] = {x: 0, y: 0, status: 1};
    }
}

var rightPressed = false;
var leftPressed = false;
var enterPressed = false;

document.addEventListener("keydown", keyDownHandler, false)
document.addEventListener("keyup", keyUpHandler, false)
document.addEventListener('keydown', fire, false)
// document.addEventListener('keydown',game,false)

function keyDownHandler(e){
    e.preventDefault()

if (e.keyCode == 39) {
   rightPressed = true;
} else if (e.keyCode == 37) {
   leftPressed = true;
} else if (e.keyCode == 13){
   enterPressed = true;
}
}

function keyUpHandler(e){
if (e.keyCode == 39) {
   rightPressed = false;
} else if (e.keyCode == 37) {
   leftPressed = false;
} 
}

function fireSound(e) {                 // FUNCTION FOR FIRING SOUND
var pew = new Audio('pew.wav');         // FIRING SOUND SAVED TO VARIABLE
if (e.keyCode == 32) {                  // IF SPACE PRESSED
    pew.play();                         // PLAY FIRING SOUND
}
}

function fire(e){
    if(e.keyCode == 32){
    let bullet = {x: bulletX, y: bulletY, status:1};
    bullets.push(bullet);
    drawBullet(bullets)
    fireSound(e);
    }
}


function alienFire(alienBulletX,alienBulletY){

        let alienBullet = {x: alienBulletX, y: alienBulletY, status:1};
        alienBullets.push(alienBullet);
        drawBullet(alienBullets)   
}


//Variables to describe the bullets from the spaceship
let bulletWidth = 3;
let bulletHeight = 10;
let bulletX = (shipX + (shipWidth-bulletWidth)/2);
let bulletY = shipTop;
let bullets = [];


// VARIABLES FOR THE ALIEN BULLETS
let alienBullets = [];

const drawShip = () => {
    ctx.drawImage(imgShip, shipX, canvas.height-(shipHeight+20), shipWidth, shipHeight)

};


const drawBullet = () => {
    for (let i =0; i < bullets.length; i++){
        if(bullets[i].status == 1){
           if (bullets[i].y > bulletHeight){
                ctx.beginPath();
                ctx.rect(bullets[i].x,bullets[i].y,bulletWidth,bulletHeight);
                ctx.fillStyle = 'lime';
                ctx.fill();
                ctx.closePath();
                bullets[i].y += bulletSpeed;

                }
            else {
                bullets[i].status = 0
                bullets.splice(i, 1);

            }
        }
    }
    for (let i =0;i<alienBullets.length;i++){
        if(alienBullets[i].status == 1){
           if (alienBullets[i].y < canvas.height){
                ctx.beginPath();
                ctx.rect(alienBullets[i].x,alienBullets[i].y,bulletWidth,bulletHeight);
                ctx.fillStyle = 'red';
                ctx.fill();
                ctx.closePath();
                alienBullets[i].y += alienBulletSpeed;
                }
            else {
                alienBullets[i].status = 0
                alienBullets.splice(i, 1);

            }
        }
    }
}
const randomIndex = (min,max) => {
    random = Math.floor(Math.random() * (max-min));
    let randomIndex = min + random;
    return randomIndex;
}
const selectAlien = () => {
    currentColumn = aliens.length;
    let alienRows = []

   for (let c = 0;c<currentColumn;c++){
       alienRows.push(aliens[c].length-1)
   }
   let currentRow = Math.max(...alienRows);
    let a = randomIndex(0, currentColumn);
    let b = randomIndex(0, currentRow);
    if (aliens[a][b].status === 1){
        let alienBulletX =(aliens[a][b].x  + (alienWidth - bulletWidth)/2);
        let alienBulletY= (aliens[a][b].y + alienHeight);
        alienFire(alienBulletX,alienBulletY);
    }else selectAlien();
}



const drawAlien = () => {
    for (let c = 0; c < aliens.length; c++){
        for (let r = 0; r < aliens[c].length; r++){
            if (aliens[c][r].status == 1){
                let alienX = c * (alienWidth + alienPadding) + alienOffSetLeft;
                let alienY = r * (alienHeight + alienPadding) + alienOffSetTop;
                aliens[c][r].x = alienX;
                aliens[c][r].y = alienY;
                if(r===0){
                ctx.drawImage(imgAlien1,alienX,alienY,alienWidth,alienHeight)}
                else if (r>0&&r<3){
                ctx.drawImage(imgAlien2,alienX,alienY,alienWidth,alienHeight)
                } else {
                ctx.drawImage(imgAlien3,alienX,alienY,alienWidth,alienHeight)
                }
            }
        }
    }
}
const drawHealth = () => {
    if(health<0){
        health = 0
    }
    ctx.font = "17px Arial";
    ctx.fillStyle = 'lime';
    ctx.fillText("HEALTH: " + health +'%', 8, 20);
}


const moveAliens = () => {
    alienOffSetLeft+=dx;
    let currentAlienColumns = aliens.length;
    let alienRows = []

    for (let c = 0;c<currentAlienColumns-1;c++){
        alienRows.push(aliens[c].length)
    }
    let currentAlienRows = Math.max(...alienRows);

    if (alienOffSetLeft > canvas.width - alienWidth * (currentAlienColumns-deletedRightColumns) - 70 || alienOffSetLeft+(deletedLeftColumns*alienWidth) < 5){
        dx = -dx*1.01;
        alienOffSetTop -=dy}
    if (canvas.height - ((currentAlienRows-deletedRows)* (alienHeight + alienPadding) + alienOffSetTop) > shipHeight*2){
        dy = dy;
    } else {
        dy = 0;
        dx = 0;
        health -= 100;
    }
    
};


const collisionDetection = () => {
    for (let c= 0;c<aliens.length;c++){
        for (let r = 0;r<aliens[c].length;r++){
            var alien = aliens[c][r];
            if (alien.status === 1){             //If alien is alive
                for (let i = 0;i<bullets.length;i++){
                    if(
                    bullets[i].x > alien.x &&              //bullet dimensions are
                    bullets[i].x < alien.x + alienWidth && //within the dimensions of
                    bullets[i].y > alien.y &&              //the alien 
                    bullets[i].y < alien.y + alienHeight
                ) {
                    alien.status = 0            //alien dies
                    var die = new Audio('die.wav'); // variable for alien dieing sound
                    die.play();                 // ALIEN MAKES DIEING SOUND WHEN DIEING
                    bullets[i].status = 0       //bullet dies
                    bullets.splice(i,1)         //
                }
            }
        }
    }}
}

const shipCollisionDetection = () => {
    for (let i = 0;i<alienBullets.length;i++){
        if (alienBullets[i].x >shipX &&
            alienBullets[i].x <shipX + shipWidth &&
            alienBullets[i].y >shipTop &&
            alienBullets[i].y < shipTop + shipHeight){
                // console.log(i);
                alienBullets[i].status = 0;
                health -= 5;
                console.log('You shot me boss')
                alienBullets.splice(i,1);
            }
    }
}
const lastRowHandler = () => {
    let lastRow = [];
    for (let c = 0;c<aliens.length;c++){
            lastRow.push(aliens[c][aliens[c].length-1-deletedRows].status)
        }
        let lastRowStatus = lastRow.reduce((a,b)=> a+b,0);
        if (lastRowStatus === 0){
            deletedRows +=1
            console.log("Deleted Rows:" + deletedRows)
        }
    }

const lastColumnHandler = () => {
    let lastColumn = [];
    for (let c = 0; c<aliens[aliens.length-1-deletedRightColumns].length;c++){
       lastColumn.push(aliens[aliens.length-1-deletedRightColumns][c].status)
    } 
    let lastColumnStatus = lastColumn.reduce((a,b)=> a+b,0)
    if (lastColumnStatus === 0){
        deletedRightColumns += 1
        console.log("Deleted Right Columns:" + deletedRightColumns);
        }
    }
const firstColumnHandler = () =>{
    let firstColumn =[];
    for (let r = 0; r<aliens[0+deletedLeftColumns].length;r++){
        firstColumn.push(aliens[0+deletedLeftColumns][r].status)
    }
    let firstColumnStatus = firstColumn.reduce((a,b)=>a+b,0)
    if (firstColumnStatus === 0){
        deletedLeftColumns += 1
        console.log("Deleted Left Columns:" + deletedLeftColumns)  
    }
}

const draw = () => {  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    firstColumnHandler();
    lastColumnHandler();
    lastRowHandler();
    drawShip();
    drawAlien();
    drawBullet();
    drawHealth();
    moveAliens();        
    collisionDetection();
    shipCollisionDetection();

    if (rightPressed && shipX < canvas.width - shipWidth){
        shipX += 7;
        bulletX +=7;
    } else if (leftPressed && shipX >0){
        shipX -= 7;
        bulletX -=7;
    }
    

    x+=dx;
};

setInterval(draw,10)
setInterval(selectAlien,250)




/////////////////////////////////////////////////////////////////////////////////////////////////////////


// // Attempting to have a loading screen before the game starts
// const game = () => {
//     if (enterPressed == false){
//         clearInterval(draw);
//         clearInterval(selectAlien);
//         setInterval(startGame,10);
//     } else if (enterPressed == true)
//     {
//         clearInterval(startGame);
//         setInterval(draw,10);
//         setInterval(selectAlien);
//     }
// }


// const startGame = () => {

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.font = '60px Arial';
//     ctx.fillStyle = 'lime';
//     ctx.fillText("SPACE BALTI ", canvas.width/2-200,canvas.height/2);
//     ctx.fillText("Press Enter", canvas.width/2-170,100+canvas.height/2);
// }

// game();
