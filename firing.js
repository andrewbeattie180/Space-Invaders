function fireSound() {                 
    var pew = new Audio('pew.wav');         
        pew.play();                        
}

function fire(e){
    e.preventDefault();
    if(e.keyCode == 32 & gameInProgress){ //disable the fire function when the game isn't in progress

        if (!aliensDefeated || bossLoaded){ //fire doesn't work if the boss isn't loaded
            let bullet = {
                x: bulletX, 
                y: bulletY, 
                status:1
            }; //create an instance of a bullet

        if (bullets.length < 3){ //stops the player from just creating a stream of bullets
            bullets.push(bullet); //add the instance of a bullet into the bullets array

        fireSound(); //makes a pew sound
            }
        }
    } 
}

function alienFire(alienBulletX,alienBulletY){                    //creates an instance of an alien bullet
        let alienBullet = {
            x: alienBulletX, 
            y: alienBulletY, 
            status:1
        };
        alienBullets.push(alienBullet);                           // adds the bullet to the array
}

function bossFire(bossBulletX, bossBulletY){
    let bossBullet = {x: bossBulletX, y: bossBulletY, status:1}
    bossBullets.push(bossBullet)
}


function randomHeart(x,y){                                  //probability function
    let random = (Math.floor(Math.random()*100))/100;
    if (random > 0.96) {                                    //give a 4% chance of dropping a heart
        dropHeart(x,y)
    } 
}

function dropHeart(X,Y){                                    //creates an instance of a heart
        let heart = {
            x: X, 
            y: Y, 
            status:1};                 
        hearts.push(heart);
}

module.exports.randomHeart = randomHeart;
module.exports.bossFire = bossFire;
module.exports.alienFire = alienFire;
module.exports.fire = fire;