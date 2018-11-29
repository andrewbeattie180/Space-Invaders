const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//Variables to describe the spaceship container
let x = canvas.width / 2; //The middle of the canvas
// let y = canvas.height - 40; // The height of the ship from the bottom
let dx = 0.2; //number of pixels horizontally to move on redraw
let dy = -20;

let bulletSpeed = -7; //speed of bullet (vertical movement)
let bulletDamage = 10 // damage of alien bullets

let health = 100;
let life = 5;
let score = 0;
let shipWidth = 80;
let shipHeight = 80;
let shipX = (canvas.width - shipWidth) / 2;
let shipY = canvas.height - (shipHeight + 70);
let shipTop = (canvas.height - (shipHeight + 20));
let imgShip = new Image();
imgShip.src = "./img/starfighter.svg";
let imgHeart = new Image();
imgHeart.src = "./img/heart.svg";


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
let waves = 2;
let bossX = 0;
let bossY = 0;
let bossPadding = canvas.width/6;


let imgAlien1 = new Image();
let imgAlien2 = new Image();
let imgAlien3 = new Image();
let imgBoss = new Image();
imgAlien1.src = './img/cooking-pot.svg'
imgAlien2.src = './img/alien-bug.svg'
imgAlien3.src = './img/scout-ship.svg'
imgBoss.src ='./img/interceptor-ship.svg'

let aliens = [];
let lives =[];

let hearts =[];

let boss = {
    x: 0,
    y: 0,
    health: 300,
    lives:2
}

let pause = false;

for (let c = 0; c < alienColumnCount; c++) {
    aliens[c] = [];
    for (let r = 0; r < alienRowCount; r++) {
        aliens[c][r] = {
            x: 0,
            y: 0,
            status: 1
        };
    }
}

var rightPressed = false;
var leftPressed = false;
var enterPressed = false;

let gameInProgress = false;
let aliensDefeated = false;
let bossDefeated = false;


function keyDownHandler(e) {
    e.preventDefault()
if (e.keyCode == 39) {
   rightPressed = true;
} else if (e.keyCode == 37) {
   leftPressed = true;
} else if (e.keyCode == 13){
   enterPressed = true;
}
}

function keyUpHandler(e) {
    e.preventDefault();
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    } else if (e.keyCode == 13) {
        enterPressed = false;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// functions to define the firing mechanics of the game

function fireSound() {                 
var pew = new Audio('pew.wav');         
    pew.play();                        
}

function fire(e){
    e.preventDefault();
    if(e.keyCode == 32 & gameInProgress){
        if (!aliensDefeated || bossLoaded){
        let bullet = {x: bulletX, y: bulletY, status:1};
        if (bullets.length < 3){
        bullets.push(bullet);
        fireSound();
        }}
    } else if(e.keyCode == 32 & !gameInProgress) return;
}

function alienFire(alienBulletX,alienBulletY){
        let alienBullet = {x: alienBulletX, y: alienBulletY, status:1};
        alienBullets.push(alienBullet);
}

function bossFire(bossBulletX, bossBulletY){
    let bossBullet = {x: bossBulletX, y: bossBulletY, status:1}
    bossBullets.push(bossBullet)
}


const randomHeart = (x,y) => {
    let random = (Math.floor(Math.random()*100))/100;
    console.log("random number = " + random)
    if (random > 0.96) { //give a 4% chance of dropping a heart
        dropHeart(x,y)
    } else{
        console.log('didnt drop owt boss');
    }
}
function dropHeart(X,Y){
        let heart = {x: X, y: Y, status:1};
        hearts.push(heart);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Variables to describe the bullets

let bulletWidth = 3;
let bulletHeight = 10;
let bulletX = (shipX + (shipWidth - bulletWidth) / 2);
let bulletY = shipTop;
let bullets = [];
let alienBullets = [];
let alienFrequency = 300
let bossBullets = [];
let bossFrequency = 300
let bossHealthBar
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// functions to draw the objects on the canvas

const drawShip = () => {
    ctx.drawImage(imgShip, shipX, shipY, shipWidth, shipHeight)
};

const moveShip = () => {
    if (rightPressed && shipX < canvas.width - shipWidth) {
        shipX += 7;
        bulletX += 7;
    } else if (leftPressed && shipX > 0) {
        shipX -= 7;
        bulletX -= 7;
    }
    if (bossDestroyed && shipY + shipHeight > 0){
        shipY -= 7;
    } else if (bossDestroyed && shipY + shipHeight <= 0){
        shipY -= 0
        gameOver();
    }
}
const resetShip = () => {
    end(drawScreenId)
    end(selectAlienId)
    shipX = (canvas.width - shipWidth) / 2;
    shipY = canvas.height - (shipHeight + 70);
    bulletX = (shipX + (shipWidth - bulletWidth) / 2);
    if (gameInProgress){
    setTimeout(function(){
    drawScreenId = setInterval(draw,10)
    selectAlienId = setInterval(selectAlien,alienFrequency)
    },1500);}
    alienBullets = [];
    bullets=[];
}

const resetAliens = () =>{
    aliens = [];
    bullets = [];
    alienBullets = [];
    aliensDefeated = false;
    deletedLeftColumns = 0;
    deletedRows = 0;
    deletedRightColumns = 0;
    dx = 0.2;
    dy = -20
    alienOffSetLeft = 5;
    alienOffSetTop = 70;
    for (let c = 0; c < alienColumnCount; c++) {
        aliens[c] = [];
        for (let r = 0; r < alienRowCount; r++) {
            aliens[c][r] = {
                x: 0,
                y: 0,
                status: 1
            };
        }
    }
    
}

const resetScore = () => {
    health = 100;
    life = 5;
    score = 0;
}

const resetBoss = () =>{
    boss = {
        x: 0,
        y: 0,
        health: 300,
        lives:2
    }
    bossPadding = canvas.width/6;
    bossBullets = [];
    bossFrequency = 300;
    bossX = 0;
    bossY = 0;
    bossDY = 0.01*dy
    bossDX = 1;
    bossLoaded = false;
    bossDefeated = false;
    bossDestroyed = false;

}

const resetBossFight = () =>{
    end(bossGunsId)
    end(bossScreenId)
    setTimeout(function(){
        shipX = (canvas.width - shipWidth) / 2;
        bulletX = (shipX + (shipWidth - bulletWidth) / 2);
        bossGunsId = setInterval(bossGunsFire,bossFrequency)
        bossScreenId = setInterval(drawBossScreen,10)
    },1000);
    bossBullets = [];
    bullets = []
}

const drawBullet = (array, speed, color) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].status == 1) {
            if (array[i].y > bulletHeight) {
                ctx.beginPath();
                ctx.rect(array[i].x, array[i].y, bulletWidth, bulletHeight);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
                array[i].y += speed;
            } else {
                array[i].status = 0
                array.splice(i, 1);
                }
            }
        }
    }
const drawHeart = (array, speed) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].status == 1) {
                ctx.drawImage(imgHeart, array[i].x, array[i].y,50,50);
                array[i].y += speed;
            } else {
                array[i].status = 0
                array.splice(i, 1);
                }
            }
        }


const drawAlien = () => {
    for (let c = 0; c < aliens.length; c++) {
        for (let r = 0; r < aliens[c].length; r++) {
            if (aliens[c][r].status == 1) {
                let alienX = c * (alienWidth + alienPadding) + alienOffSetLeft;
                let alienY = r * (alienHeight + alienPadding) + alienOffSetTop;
                aliens[c][r].x = alienX;
                aliens[c][r].y = alienY;
                if (r === 0) {
                    ctx.drawImage(imgAlien1, alienX, alienY, alienWidth, alienHeight)
                } else if (r > 0 && r < 3) {
                    ctx.drawImage(imgAlien2, alienX, alienY, alienWidth, alienHeight)
                } else {
                    ctx.drawImage(imgAlien3, alienX, alienY, alienWidth, alienHeight)
                }
            }
        }
    }
}

const drawBoss = ()=>{
    boss.x = bossX + bossPadding
    boss.y = bossY - canvas.height*2/3
    ctx.drawImage(imgBoss,boss.x,boss.y, canvas.width*2/3, canvas.height*2/3)
}

const speedUpBoss = ()=> {
    bossFrequency = bossFrequency/1.66;
    end(bossGunsId);
    bossGunsId = setInterval(bossGunsFire,bossFrequency)
}

const drawBossHealth = ()=>{
    if (boss.health === 0 && boss.lives >0){
        boss.health = 300;
        boss.lives -=1
        speedUpBoss();
    }
    if (boss.lives === 0 && boss.health === 0){
        bossDefeated = true;
        bullets = [];
        bossBullets = [];
    }
    if (boss.lives === 2){
        bossHealthBar = 'lime'
    } else if (boss.lives === 1){
        bossHealthBar = 'yellow'
    } else if (boss.lives === 0){
        bossHealthBar = 'red'
    }
    fillText(boss.health,canvas.width-40,50,bossHealthBar,17);
    ctx.fillStyle = bossHealthBar;
    ctx.fillRect(canvas.width-50,60,20,(300 - (300 - boss.health))*2)
}
const drawHealth = () => {
    if (health < 0) {
        health = 0
    }
    fillText("HEALTH: ", 70, canvas.height - 20, 'lime',17);
    let hbc;
    if (health > 50) {
        hbc = 'lime';
    } else if (health > 20 && health <= 50) {
        hbc = 'yellow';
    } else {
        hbc = 'red';
    }
    fillText("HEALTH: ", 70, canvas.height - 20, hbc,17);
    ctx.fillStyle = hbc;
    ctx.fillRect (110,canvas.height - 35,(100 - (100 - health))*2,20);
}



const checkLife = () =>{
    if (health === 0 && life > 0){
        life -=1;
        aliensDefeated ? resetBossFight():resetShip();
        lives[life].status=0;
        health = 100;
    }
    if (health > 100){
        life += 1;
        health = health -100;
    }
}

const drawLife = () =>{
    fillText("LIVES: ", 79 ,canvas.height - 45, 'lime', 17);
 
    for (c=0;c<life;c++){
        lives[c]={
            x:0,
            y:0,
            status:1
        }
    }
    for (c=0;c<life;c++){
        if (lives[c].status===1){
        let lifeX = c * (30 + alienPadding) + (50+ ctx.measureText("LIVES: ").width)
        let lifeY = (canvas.height - 65)
        lives[c].x = lifeX;
        lives[c].y = lifeY;
        ctx.drawImage(imgShip,lifeX,lifeY,25,25);
    }
}
}

const drawScore = () => {
    fillText("SCORE: "+ score, 630, 685, "lime", 40)
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// functions to select a random alien to fire back

const randomIndex = (min,max) => {
    random = Math.floor(Math.random() * (max-min));
    let randomIndex = min + random;
    return randomIndex;
}
const selectAlien = () => {
   if (!aliensDefeated){ 
    let a = randomIndex(0, alienColumnCount)
    let b = randomIndex(0, alienRowCount);
    if (aliens[a][b].status === 1){
        let alienBulletX =(aliens[a][b].x  + (alienWidth - bulletWidth)/2);
        let alienBulletY= (aliens[a][b].y + alienHeight);
        alienFire(alienBulletX,alienBulletY);
    }else selectAlien();
}
}

const bossGunsFire = () => {
    if(bossLoaded){
        let a = randomIndex(1,15)
        if(boss.health > 0){
            let bossBulletX = boss.x + a*(canvas.width*2/3/15)
            let bossBulletY = bossY
            bossFire(bossBulletX,bossBulletY);
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//functions to move the aliens 

const moveAliens = () => {
        firstColumnHandler();
        lastColumnHandler();
        lastRowHandler();
        drawBullet(alienBullets,-bulletSpeed,'red');
        alienOffSetLeft+=dx;

    if (alienOffSetLeft > canvas.width - alienWidth * (alienColumnCount - deletedRightColumns) - 70 || alienOffSetLeft + (deletedLeftColumns * alienWidth) < 5) {
        dx = -dx;
        alienOffSetTop -= dy
    }
    if (canvas.height - ((alienRowCount - deletedRows) * (alienHeight + alienPadding) + alienOffSetTop) > shipHeight * 2) {
        dy = dy;
    } else {
        lives -=1;
        resetAliens();
    }
};

const lastRowHandler = () => {
    let lastRow = [];
    if(!aliensDefeated){
    for (let c = 0;c<aliens.length;c++){
            lastRow.push(aliens[c][aliens[c].length-1-deletedRows].status)
        }
        let lastRowStatus = lastRow.reduce((a,b)=> a+b,0);
        if (lastRowStatus === 0){
            deletedRows +=1
            // console.log("Deleted Rows:" + deletedRows)
        }}
    }

const lastColumnHandler = () => {
    let lastColumn = [];
    if(!aliensDefeated){
    for (let c = 0; c<aliens[aliens.length-1-deletedRightColumns].length;c++){
       lastColumn.push(aliens[aliens.length-1-deletedRightColumns][c].status)
    } 
    let lastColumnStatus = lastColumn.reduce((a,b)=> a+b,0)
    if (lastColumnStatus === 0){
        deletedRightColumns += 1
        // console.log("Deleted Right Columns:" + deletedRightColumns);
        
    }}
    }
const firstColumnHandler = () =>{
    let firstColumn =[];
    if(!aliensDefeated){
    for (let r = 0; r<aliens[0+deletedLeftColumns].length;r++){
        firstColumn.push(aliens[0+deletedLeftColumns][r].status)
    }
    let firstColumnStatus = firstColumn.reduce((a,b)=>a+b,0)
    if (firstColumnStatus === 0){
        deletedLeftColumns += 1
        // console.log("Deleted Left Columns:" + deletedLeftColumns)  
    }
}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



const gameInit = (e)=>{
    if (e.keyCode === 13 && bossDestroyed){
       
    rightPressed = false;
    leftPressed = false;
    enterPressed = false;
    gameInProgress = false;
    aliensDefeated = false;
    pause = false;
    waves = 2;
    loadScreenId = null;
    drawScreenId = null;
    selectAlienId = null;
    pausedScreenId = null;
    bossScreenId=null;
    bossGunsId = null;

    resetAliens();
    resetShip();
    resetScore();
    resetBoss();
 
    spaceBalti();
}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// functions to detect the bullets collide with targets

const collisionDetection = () => {
    for (let c = 0; c < aliens.length; c++) {
        for (let r = 0; r < aliens[c].length; r++) {
            var alien = aliens[c][r];
            if (alien.status === 1) { //If alien is alive
                for (let i = 0; i < bullets.length; i++) {
                    if (
                        bullets[i].x > alien.x && //bullet dimensions are
                        bullets[i].x < alien.x + alienWidth && //within the dimensions of
                        bullets[i].y > alien.y && //the alien 
                        bullets[i].y < alien.y + alienHeight
                    ) {
                        alien.status = 0 //alien dies

                        randomHeart(alien.x, alien.y);
                        // var die = new Audio('die.wav'); // variable for alien dieing sound
                        // die.play(); // ALIEN MAKES DIEING SOUND WHEN DYING
                        score += 5;
                        bullets[i].status = 0 //bullet dies
                        bullets.splice(i, 1) //
                    }
                }
            }
        }
    }
}

const shipCollisionDetection = (array,damage) => {

    for (let i = 0; i < array.length; i++) {
        if (array[i].x > shipX &&
            array[i].x < shipX + shipWidth &&
            array[i].y + bulletHeight > shipY &&
            array[i].y < shipY + shipHeight) {
            array[i].status = 0;
            health -= damage;
            // console.log('You shot me boss')
            array.splice(i, 1);
        }
    }
}

const bossCollisionDetection = ()=>{
    if (boss.health > 0 && bossLoaded){
        for (let i = 0;i<bullets.length;i++){
            if( 
                bullets[i].x > boss.x &&
                bullets[i].x < boss.x+(canvas.width*2/3)
                 &&
                bullets[i].y < boss.y + canvas.height*2/3 - 15
            ) {
                boss.health -= 5;
                // console.log('Boss Health: '+boss.health)
                bullets[i].status = 0;
                score += 5;
                bullets.splice(i,1)
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

const pauseFunction = (e) =>{
    if(gameInProgress){
    if(e.keyCode === 80){
        pause = !pause;
        if (pause & !aliensDefeated){
            console.log('paused')
            end(drawScreenId)
            end(selectAlienId)
            pausedScreenId = setInterval(pauseScreen,10)
        } else if(!pause && !aliensDefeated){
            console.log('unpaused')
            end(pausedScreenId)
            drawScreenId = setInterval(draw,10);
            selectAlienId = setInterval(selectAlien,alienFrequency)
        } else if (pause && aliensDefeated && bossLoaded){
            console.log('paused')
            end(bossScreenId)
            end(bossGunsId)
            pausedScreenId = setInterval(pauseScreen,10)
        } else if (!pause && aliensDefeated && bossLoaded){
            console.log('paused')
            end(pausedScreenId)
            bossScreenId = setInterval(drawBossScreen,10)
            bossGunsId = setInterval(bossGunsFire,bossFrequency)
        }
    }
    }
}

const pauseScreen = () =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blinkingText('PAUSED',canvas.width/2,canvas.height/2,500,'lime',60);
    blinkingText('Press P to unpause',canvas.width/2, canvas.height/1.75,500,'lime',40)
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const deathCheck = () =>{
    if(life <= 0) {
        gameOver();
  }
}
const enemyBulletCheck = (array)=>{
    for (i=0;i<array.length;i++){
        if (array[i].y === canvas.height){
            array[i].status = 0
            array.splice(i,1)
        }
    }
}

const winCheck = () =>{
    if (deletedLeftColumns + deletedRightColumns > alienColumnCount){
        deletedLeftColumns = 0;
        deletedRightColumns = 0;
    if (deletedRows < 1){
        deletedRows = 0
    }
        waves -= 1;
    
        if (waves > 0){
            bullets = [];
            alienBullets = [];
        resetAliens();
        } else if (waves <= 0){
            waves = 0;
            aliensDefeated=true;
        }
    }
}

const bossLoad = () =>{
    if (aliensDefeated){
        // console.log('you have defeated the bad guys')
        end(drawScreenId)
        end(selectAlienId)
        loadBossScreen();
    }
}
let bossDY = 0.01*dy
let bossDX = 1;
let bossLoaded = false;
let bossDestroyed = false;

const moveBoss = () => {
        bossY -= bossDY
    if (bossY>200){
        bossLoaded = true;
    }
    if (bossLoaded){
        bossPadding += bossDX;
    }
    if (bossLoaded && (bossPadding>canvas.width-(canvas.width*2/3)||bossPadding<0)){
        bossDX = -bossDX;
    }
    if (!bossDefeated && bossLoaded && (bossY>
        canvas.height/3||bossY<100)){
        bossDY = -bossDY
    }
    if(bossDefeated){
        bossDX = 0;
        if (bossY>0-canvas.width*1/3+bossPadding){
            bossDY = 0.5
        } else {
            bossDY = 0
            bossDestroyed = true;
        }
    }
}
        
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillText('WAVE: ' + (3-waves),canvas.width/2,40, 'lime',35);
    drawShip();
    drawAlien();
    drawBullet(bullets,bulletSpeed,'lime')
    drawHeart(hearts,-bulletSpeed * 0.2)
    drawHealth();
    moveAliens();
    moveShip();
    drawLife();
    checkLife();
    collisionDetection();
    shipCollisionDetection(alienBullets,bulletDamage);
    shipCollisionDetection(hearts,-3*bulletDamage);
    enemyBulletCheck(alienBullets);
    deathCheck();
    winCheck();
    bossLoad();
    drawScore();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// function to clear intervals


let loadScreenId = null;
let drawScreenId = null;
let selectAlienId = null;
let pausedScreenId = null;
let bossScreenId = null;
let bossGunsId = null;

const end = (func) => {
    clearInterval(func)
    func = null;
}


// functions to draw text
const fillText = (text, x, y, color, fontSize) => {
    if (color.typeOf !== 'undefined') ctx.fillStyle = color;
    if (fontSize.typeOf !== 'undefined') ctx.font = fontSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

const blinkingText = (text,x,y,frequency,color,fontSize) =>{
    if (~~(0.5 + Date.now()/frequency)%2){
        fillText(text,x,y,color,fontSize)
    }
}

const loadScreen = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillText("SPACE BALTI ", canvas.width / 2, canvas.height / 2.75, '#00FF00', 75);
    blinkingText('Press Enter', canvas.width / 2, canvas.height / 2, 500, '#00FF00', 60);
    fillText("Left: ←     Right: → ", canvas.width / 2, canvas.height / 1.75, '#00ff00', 25);
    fillText('Fire: Space     Pause: P', canvas.width/2,canvas.height/1.60, 'lime',25);
}

const playGame = () => {
    end(loadScreenId)
    drawScreenId = setInterval(draw, 10)
    selectAlienId = setInterval(selectAlien, alienFrequency);
}


const drawBossScreen = () =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!bossLoaded){blinkingText('GET READY', canvas.width/2,canvas.height/2,300,'lime',60)};
    drawShip();
    drawBoss();
    drawHealth();
    drawScore();
    drawLife();
    moveShip();
    moveBoss();
    
    if (bossLoaded){
        drawBullet(bullets,bulletSpeed,'lime');
        drawBullet(bossBullets,-bulletSpeed,bossHealthBar);
        enemyBulletCheck(bossBullets);
        drawBossHealth();
    }
    shipCollisionDetection(bossBullets,bulletDamage);
    bossCollisionDetection();
    checkLife();
    deathCheck();
}

const loadBossScreen = ()=>{
    // console.log('Load Boss Screen function working')
    bossScreenId = setInterval(drawBossScreen,10);
    setTimeout(function(){
        bossGunsId = setInterval(bossGunsFire,bossFrequency) 
    },2500)}
 

const gameOver = () => {
    end(drawScreenId)
    end(selectAlienId)
    end(bossScreenId)
    end(bossGunsId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let finalScore = Math.floor((score * (1+life) * (1+(health/100))));
    ctx.font = '60px Arial';
    ctx.fillStyle = 'lime';
    ctx.fillText("GAME OVER ", canvas.width / 2, canvas.height / 2);
    ctx.fillText("FINAL SCORE: "+ finalScore, canvas.width / 2, 70 + canvas.height / 2);
    ctx.fillText("Press Enter", canvas.width / 2, 150 + canvas.height / 2);
    bossDestroyed = true;
    }

const spaceBalti = () => {
    if (!enterPressed && !gameInProgress) {
        console.log("this is loadscreen " + loadScreenId);
        loadScreenId = setInterval(loadScreen,10);
    } else {
        end(loadScreenId)
        loadScreenId = null;
        console.log ('close log screen, loadscreenId = ' + loadScreenId)
    }
    if (enterPressed === true && !gameInProgress) {
        enterPressed = false;
        gameInProgress = true;
        playGame();
    }

}

spaceBalti();

document.addEventListener("keydown", keyDownHandler, false)
document.addEventListener("keyup", keyUpHandler, false)
document.addEventListener('keydown', spaceBalti, false)
document.addEventListener('keydown',pauseFunction,false)
document.addEventListener('keydown',gameInit,false)
document.addEventListener('keydown', fire, false)
