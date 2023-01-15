const gameConstants = {
	baseDX: 0.2,
	baseDY: -20,
	columnCount: 4,
	alienWidth: 30,
	alienHeight: 30,
	playerWidth: 70,
	playerHeight: 70,
	padding: 7,
	rowCount: 1,
	frequency: 300
}

const gameSettings = {
	bulletWidth: 3,
	bulletHeight: 10,
	maxPlayerBullets: 4,
	enableSound: false,
	initialLevels: 4,
	bossDifficulty: 4,
	colors: {
		base: 'lime',
		shield: '#4A90E2',
		warning: 'yellow',
		alert: 'red',
		white: '#111'
	}
}

const imageSources = {
	player: './images/starfighter.svg',
	boss: './images/interceptor-ship.svg',
	alienOne: './images/spaceship.svg',
	alienTwo: './images/alien-bug.svg',
	alienThree: './images/scout-ship.svg',
	heart: './images/heart.svg',
	life: './images/heart-plus.svg',
	shield: './images/shield.svg',
	powerUp: './images/cooking-pot.svg'
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//#region Game Functions

const randomIndex = (min, max) => {
	random = Math.floor(Math.random() * (max - min));
	let randomIndex = min + random;
	return randomIndex;
}

const fillText = (text, x, y, color, fontSize) => {
	if (color.typeOf !== 'undefined') ctx.fillStyle = color;
	if (fontSize.typeOf !== 'undefined') ctx.font = fontSize + 'px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(text, x, y);
}

const blinkingText = (text, x, y, frequency, color, fontSize) => {
	if (~~(0.5 + Date.now() / frequency) % 2) {
		fillText(text, x, y, color, fontSize)
	}
}

const end = (func) => {
	clearInterval(func)
	func = null;
}

//#endregion

//#region Classes

class BaseObject {
	x;
	y;
	width;
	height;
	status = 1;
	image = new Image();

	constructor(x, y, height, width) {
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
	}

	set x(value) {
		this.x = value;
	}

	set y(value) {
		this.y = value;
	}

	destroy() {
		this.status = 0;
	}

	takeDamage(damage) {
	}

	collisionDetection(array) {
		if (this.status == 1) {
			for (let i = 0; i < array.length; i++) {
				let item = array[i];
				if (item.x + item.width > this.x &&
					item.x < this.x + this.width &&
					item.y + item.height > this.y &&
					item.y < this.y + this.height) {
					item.destroy();
					this.takeDamage(item.damage);
					array.splice(i, 1);
				}
			}
		}
	}

	reset() {
		this.status = 1;
	}
}

class Bullet extends BaseObject {
	speed = -7;
	damage = 10;
	angle = 0;
	color;

	constructor(x, y, color = gameSettings.colors.base, speed = -7, damage = 10) {
		super(x, y, gameSettings.bulletHeight, gameSettings.bulletWidth);
		this.color = color;
		this.speed = speed;
		this.damage = damage;
	}

	draw() {
		ctx.rotate(this.angle);
		ctx.beginPath();
		ctx.rect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
		ctx.rotate(-this.angle);
		this.y += this.speed;
	}
}

class Star extends Bullet {
	radius = Math.sqrt(Math.random() * 2);
	alpha = 1.0;
	decreasing = true;
	dRatio = Math.random() * 0.05;
	color = "rgba(255, 255, 255, " + this.alpha + ")";

	constructor(speed = 5) {
		super(Math.random() * canvas.width, 0, gameSettings.colors.white, speed, 0);
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fillStyle = this.color;
		if (this.decreasing == true) {
			this.alpha -= this.dRatio;
			if (this.alpha < 0.1) {
				this.decreasing = false;
			}
		}
		else {
			this.alpha += this.dRatio;
			if (this.alpha > 0.95) {
				this.decreasing = true;
			}
		}
		ctx.fill();
		this.y += this.speed;
	}
}

class BasePowerUp extends BaseObject {
	#speed = 7 * 0.2;

	constructor(x, y, source) {
		super(x, y, 50, 50);
		this.image.src = source;
	}

	setHeight(height) {
		this.height = height;
	}

	setWidth(width) {
		this.width = width;
	}

	draw() {
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		this.y += this.#speed;
	}
}

class Heart extends BasePowerUp {
	damage = -30;
	constructor(x, y) {
		super(x, y, imageSources.heart);
	}
}

class Shield extends BasePowerUp {
	damage = 0;
	constructor(x, y) {
		super(x, y, imageSources.shield);
	}
}

class Life extends BasePowerUp {
	damage = -100;
	constructor(x, y) {
		super(x, y, imageSources.life);
	}
}

class Bonus extends BasePowerUp {
	damage = 0;
	bonusPoints = 500;
	constructor(x, y) {
		super(x, y, imageSources.powerUp);
	}
	destroy() {
		super.destroy();
		gameData.score += this.bonusPoints;
	}
}

class Alien extends BaseObject {
	#padding = 7;
	power = 5;

	constructor(x, y, src) {
		super(x, y, gameConstants.alienHeight, gameConstants.alienWidth);
		this.image.src = src;
	}

	fire() {
		let alienBulletX = (this.x + this.width / 2);
		let alienBulletY = (this.y + this.height);
		gameData.alienBullets.push(new Bullet(alienBulletX, alienBulletY, gameSettings.colors.base, 7));
	}

	draw(x, y) {
		this.x = x * (this.width + this.#padding) + gameData.alienGrid.offsetLeft;
		this.y = y * (this.height + this.#padding) + gameData.alienGrid.offsetTop;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}

	takeDamage() {
		this.destroy();
		gameData.score += this.power;
		triggerPowerUpDrop(this.x, this.y);
	}
}

class AlienOne extends Alien {
	power = 6;
	constructor(x = 0, y = 0) {
		super(x, y, imageSources.alienOne);
	}
}

class AlienTwo extends Alien {
	power = 7;
	constructor(x = 0, y = 0) {
		super(x, y, imageSources.alienTwo);
	}
}

class AlienThree extends Alien {
	power = 8;
	constructor(x = 0, y = 0) {
		super(x, y, imageSources.alienThree);
	}
}

class BossAlien extends BaseObject {
	lives = gameSettings.bossDifficulty;
	health = 300;
	loaded = false;
	defeated = false;
	frequency = 300;
	healthBarColor = gameSettings.colors.base;
	dX = 1;
	dY = 0.01 * gameConstants.baseDY;

	constructor(x = (canvas.width) / 6, y = -(canvas.height * 2 / 3)) {
		super(x, y, canvas.height * 2 / 3, (canvas.width * 2 / 3));
		this.image.src = imageSources.boss;
	}

	speedUp() {
		this.frequency = this.frequency / 1.66;
	}

	fire() {
		if (this.loaded && this.health > 0 && !this.defeated) {
			let a = randomIndex(1, 15);
			let fireFromX = this.x + (a * (this.width / 15));
			gameData.alienBullets.push(new Bullet(fireFromX, this.y + this.height, this.healthBarColor, 7));
		}
	}

	move() {
		this.y -= this.dY;

		if (this.y + this.height > 300) {
			this.loaded = true;
		}

		if (this.loaded) {
			this.x += this.dX;

			//bounces wall to wall horizontally
			if (this.x > canvas.width - (canvas.width * 2 / 3) || this.x < 0) {
				this.dX = - this.dX;
			}

			//bounces vertically between -200
			if (this.y < -200 || this.y + this.height > 300) {
				this.dY = - this.dY;
			}
			if (this.defeated) {
				this.dX = 0;
				if (this.y > 0 - this.height) {
					this.dY = 2;
				} else {
					this.dY = 0;
					gameData.bossDefeated = true;
				}
			}
		}

	}

	draw() {
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		this.drawHealthBar();
	}

	drawHealthBar() {
		this.healthCheck();
		if (!this.defeated && this.loaded) {
			fillText(this.health, canvas.width - 40, 50, this.healthBarColor, 17);
			ctx.fillStyle = this.healthBarColor;
			ctx.fillRect(canvas.width - 50, 60, 20, (300 - (300 - this.health)) * 2);
		}
	}

	collisionDetection(array) {
		if (this.loaded && this.health > 0) {
			super.collisionDetection(array);
		}
	}

	takeDamage(damage) {
		this.health -= damage;
		triggerPowerUpDrop(this.x + (this.width / 2), this.y + this.height);
		this.healthCheck();
	}

	healthCheck() {
		if (this.health <= 0 && this.lives > 0) {
			this.health = 300;
			this.lives -= 1;
			this.speedUp();
		} else if (this.lives <= 0 && this.health <= 0) {
			this.defeated = true;
			gameData.alienBullets = [];
		}

		switch (this.lives) {
			case 0:
				this.healthBarColor = gameSettings.colors.alert;
				break;
			case 1:
				this.healthBarColor = gameSettings.colors.warning;
				break;
			default:
				this.healthBarColor = gameSettings.colors.base;
				break;
		}
	}

	reset() {
		this.x = (canvas.width) / 6;
		this.y = -(canvas.height * 2 / 3);
		this.dX = 1;
		this.dY = 0.01 * gameData.alienGrid.dy;
		this.health = 300;
		this.lives = gameSettings.bossDifficulty;
		this.loaded = false;
		this.defeated = false;
		gameData.bossDefeated = false;
		this.status = 1;
		this.frequency = 300;
	}
}

class Player extends BaseObject {
	lives = 5;
	health = 100;
	healthBarColor = gameSettings.colors.base;
	hasShield = false;
	hyperSpaceEngaged = false;

	constructor() {
		super((canvas.width - gameConstants.playerWidth / 2),
			canvas.height - (gameConstants.playerHeight + 70),
			gameConstants.playerHeight,
			gameConstants.playerWidth);
		this.image.src = imageSources.player;
	}

	healthCheck() {
		if (this.lives <= 0 && this.health == 0) {
			gameOver();
		}
		if (this.health <= 0 && this.lives > 0) {
			this.lives--;
			this.health = 100;
			gameData.aliensDefeated
				? resetBossFight()
				: resetShip();
			gameData.lives[this.lives].status = 0;
		} else if (this.health > 100) {
			this.lives++;
			this.health = this.health - 100;
		}
	}

	drawHealth() {
		if (this.health < 0) {
			this.health = 0
		}
		switch (true) {
			case this.health <= 20:
				this.healthBarColor = gameSettings.colors.alert;
				break;
			case this.health <= 50:
				this.healthBarColor = gameSettings.colors.warning;
				break;
			default:
				this.healthBarColor = gameSettings.colors.base;
				break;
		}
		fillText("HEALTH: ", 70, canvas.height - 20, this.healthBarColor, 17);
		ctx.fillStyle = this.healthBarColor;
		ctx.fillRect(110, canvas.height - 35, (100 - (100 - this.health)) * 2, 20);
	}

	drawLives() {
		fillText("LIVES: ", 79, canvas.height - 45, gameSettings.colors.base, 17);

		for (let c = 0; c < this.lives; c++) {
			let lifeX = c * (30 + gameConstants.padding) + (50 + ctx.measureText("LIVES: ").width)
			let lifeY = (canvas.height - 65);
			gameData.lives[c] = new BasePowerUp(lifeX, lifeY, this.image.src);
			gameData.lives[c].setHeight(25);
			gameData.lives[c].setWidth(25);
			gameData.lives[c].draw();
		}
	}
	engageHyperSpace() {
		this.hyperSpaceEngaged = true;
		resetStars(20);
	}

	reset() {
		super.reset();
		this.health = 100;
		this.lives = 5;
		gameData.score = 0;
	}


	fire() {
		if (gameData.playerBullets.length < gameSettings.maxPlayerBullets) {
			let bulletX = (this.x + (this.width - gameSettings.bulletWidth) / 2);
			gameData.playerBullets.push(new Bullet(bulletX, this.y));

			if (gameSettings.enableSound) {
				var pew = new Audio('./audio/pew.wav');
				pew.play();
			}
		}
	}
	draw() {
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		this.drawHealth();
		this.drawLives();

		if (this.hasShield) {
			this.drawShield();
		}
	}

	drawShield() {
		var centerX = this.x + (this.width / 2);
		var centerY = this.y + (this.height / 2);
		var radius = Math.sqrt(((this.width / 2) ** 2) + ((this.height / 2) ** 2));
		ctx.lineWidth = 3;
		ctx.strokeStyle = gameSettings.colors.shield;
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
		ctx.stroke();
	}

	takeDamage(damage) {
		this.health -= this.hasShield ? 2 : damage;
	}
	removeShield() {
		this.hasShield = false;
	}

	collisionDetection(array) {
		if (this.status == 1) {
			for (let i = 0; i < array.length; i++) {
				let item = array[i];
				if (item.x > this.x &&
					item.x < this.x + this.width &&
					item.y + item.height > this.y &&
					item.y < this.y + this.height) {
					item.destroy();
					this.takeDamage(item.damage);
					if (item instanceof Shield) {
						this.hasShield = true;
						gameIntervals.playerShieldId = setTimeout(removeShield, 10000);
					}
					array.splice(i, 1);
				}
			}
		}
	}
	center() {
		this.x = (canvas.width - this.width) / 2;
		this.y = canvas.height - (this.height + 70);
	}

	move() {
		if (gameData.controls.rightPressed && this.x < canvas.width - this.width) {
			this.x += 7;
		} else if (gameData.controls.leftPressed && this.x > 0) {
			this.x -= 7;
		}
		if (gameData.bossDefeated) {
			var centerPoint = (canvas.width - this.width) / 2;
			if (this.x > centerPoint + 10) {
				this.x -= 10;
			} else if (this.x < centerPoint - 10) {
				this.x += 10;
			} else {
				this.x = centerPoint;
				this.y -= 3;
				if (!this.hyperSpaceEngaged) {
					this.engageHyperSpace();
				}
			}
			if (this.y < 0) {
				this.y -= 0
				gameOver();
			}
		}
	}
}


//#endregion


//#region Initialising and Resetting Classes

let gameIntervals = {
	loadScreenId: null,
	drawScreenId: null,
	selectAlienId: null,
	pausedScreenId: null,
	bossScreenId: null,
	bossGunsId: null,
	creditScreenId: null,
	playerShieldId: null,
	starsIntervalId: null,
}

let gameData = {
	controls: {
		inProgress: false,
		paused: false,
		rightPressed: false,
		leftPressed: false,
		enterPressed: false
	},
	score: 0,
	levels: gameSettings.initialLevels,
	powerUps: [],
	aliens: [],
	stars: [],

	player: new Player(),
	boss: new BossAlien(),
	playerBullets: [],
	alienBullets: [],
	lives: [],
	x: canvas.width / 2,
	y: canvas.height / 2,

	aliensDefeated: false,
	bossDefeated: false,
	alienGrid: {
		deletedRows: 0,
		deletedRightColumns: 0,
		deletedLeftColumns: 0,
		offsetTop: 70,
		offsetLeft: 5,
		dx: 0.2,
		dy: -20
	},

	creditsScreenDisplayed: false
}

const getAlienByIndex = (index) => {
	switch (index) {
		case 0:
			return new AlienOne();
			break;
		case 1:
			return new AlienTwo();
			break;
		default:
			return new AlienThree();
	}
}


const randomiseAliens = () => {
	let currentLevel = gameSettings.initialLevels - gameData.levels + 1;
	switch (true) {
		case currentLevel > 1:
			var index = randomIndex(0, currentLevel);
			return getAlienByIndex(index);
			break;
		default:
			return new AlienOne();
			break;
	}
}

const initialiseAliens = () => {
	let currentLevel = gameSettings.initialLevels - gameData.levels + 1;

	for (let c = 0; c < currentLevel * gameConstants.columnCount; c++) {
		gameData.aliens[c] = [];
		for (let r = 0; r < currentLevel * gameConstants.rowCount; r++) {
			gameData.aliens[c][r] = randomiseAliens();
		}
	}
}


const resetAliens = () => {
	gameData.aliens = [];
	resetBullets();
	gameData.aliensDefeated = false;
	resetGrid();
	initialiseAliens();
}

const resetGrid = () => {
	gameData.alienGrid.deletedLeftColumns = 0;
	gameData.alienGrid.deletedRows = 0;
	gameData.alienGrid.deletedRightColumns = 0;
	gameData.alienGrid.dx = 0.2;
	gameData.alienGrid.dy = -20
	gameData.alienGrid.offsetLeft = 5;
	gameData.alienGrid.offsetTop = 70;
}

const resetControls = () => {
	gameData.controls.enterPressed = false;
	gameData.controls.leftPressed = false;
	gameData.controls.rightPressed = false;
	gameData.controls.paused = false;
	gameData.controls.inProgress = false;
}

const resetBossFight = () => {
	end(gameIntervals.bossGunsId)
	end(gameIntervals.bossScreenId)
	setTimeout(function () {
		gameData.player.center();
		gameIntervals.bossGunsId = setInterval(bossFire, gameData.boss.frequency);
		gameIntervals.bossScreenId = setInterval(drawBossScreen, 10);
	}, 1000);
	resetBullets();
}

const resetShip = () => {
	end(gameIntervals.drawScreenId)
	end(gameIntervals.selectAlienId)
	gameData.player.center();

	if (gameData.controls.inProgress) {
		setTimeout(function () {
			gameIntervals.drawScreenId = setInterval(draw, 10);
			let currentLevel = gameSettings.initialLevels - gameData.levels + 1;
			let frequency = gameConstants.frequency * (1 + currentLevel / gameSettings.initialLevels);
			gameIntervals.selectAlienId = setInterval(selectAlien, frequency)
		}, 1500);
	}
	resetBullets();
}

const resetBullets = () => {
	gameData.alienBullets = [];
	gameData.playerBullets = [];
}

const resetPowerUps = () => {
	gameData.powerUps = [];
}

const clearAllIntervals = () => {
	gameIntervals.bossGunsId = null;
	gameIntervals.bossScreenId = null;
	gameIntervals.creditScreenId = null;
	gameIntervals.drawScreenId = null;
	gameIntervals.loadScreenId = null;
	gameIntervals.pausedScreenId = null;
	gameIntervals.selectAlienId = null;

}

const gameInit = () => {
	resetControls();
	gameData.levels = gameSettings.initialLevels;
	clearAllIntervals();
	resetAliens();
	resetShip();
	gameData.boss.reset();
	gameData.player.reset();
	resetPowerUps();
	resetStars();
	runGame();
}

const triggerPowerUpDrop = (x, y) => {
	let random = (Math.floor(Math.random() * 1000)) / 1000;

	switch (true) {
		case (random > 0.92 && random < 0.94):
			gameData.powerUps.push(new Heart(x, y));
			break;
		case (random > 0.98 && random < 1):
			gameData.powerUps.push(new Shield(x, y));
			break;
		case (random > 0 && random < 0.02):
			gameData.powerUps.push(new Life(x, y));
			break;
		case (random > 0.12 && random < 0.14):
			gameData.powerUps.push(new Bonus(x, y));
			break;
	}
}

const removeShield = () => {
	end(gameIntervals.playerShieldId);
	gameData.player.removeShield();
}

//#endregion

//#region Controls

const fire = (e) => {
	e.preventDefault();
	if (e.keyCode == 32 && gameData.controls.inProgress) {
		if (!gameData.aliensDefeated || gameData.boss.loaded) {
			gameData.player.fire();
		}
	}
}

const keyHandler = (e, bool) => {
	e.preventDefault()
	switch (e.keyCode) {
		case 39:
			gameData.controls.rightPressed = bool;
			break;
		case 37:
			gameData.controls.leftPressed = bool;
			break;
		case 13:
			gameData.controls.enterPressed = bool;
			break;
		default:
			//Do nothing
			break;
	}
}

const keyDownHandler = (e) => {
	keyHandler(e, true);
}

const keyUpHandler = (e) => {
	keyHandler(e, false);
}

const bossFire = () => {
	gameData.boss.fire();
}

//#endregion

//#region Game Drawing Functions

const drawBullets = (array) => {
	for (let i = 0; i < array.length; i++) {
		let bullet = array[i];
		if (bullet instanceof Bullet) {
			if (bullet.status == 1
				&& bullet.y > gameSettings.bulletHeight
				&& bullet.y < canvas.height
				&& bullet.x > 0
				&& bullet.x + bullet.width < canvas.width) {
				bullet.draw();
			} else {
				bullet.destroy();
				array.splice(i, 1);
			}
		}
	}
}

const drawPowerUps = () => {
	for (let i = 0; i < gameData.powerUps.length; i++) {
		let powerUp = gameData.powerUps[i];
		if (powerUp instanceof BasePowerUp) {
			if (powerUp.status == 1) {
				powerUp.draw();
			} else {
				powerUp.destroy();
				gameData.powerUps.splice(i, 1);
			}
		}
	}
}

const drawStars = () => {
	for (let i = 0; i < gameData.stars.length; i++) {
		let star = gameData.stars[i];
		if (star instanceof Star) {
			if (star.status == 1 && star.y < canvas.height) {
				star.draw();
			} else {
				star.destroy();
				gameData.stars.splice(i, 1);
			}
		}
	}
}

const drawAliens = () => {
	for (let c = 0; c < gameData.aliens.length; c++) {
		for (let r = 0; r < gameData.aliens[c].length; r++) {
			let alien = gameData.aliens[c][r];
			if (alien.status == 1) {
				alien.draw(c, r);
			}
		}
	}
}

const drawScore = () => {
	fillText("SCORE: " + gameData.score, 630, 685, "lime", 40);
}




//#endregion



//#region Alien Grid Functions

const lastRowHandler = () => {
	let lastRow = [];
	for (let c = 0; c < gameData.aliens.length; c++) {
		lastRow.push(gameData.aliens[c][gameData.aliens[c].length - 1 - gameData.alienGrid.deletedRows].status)
	}
	let lastRowStatus = lastRow.reduce((a, b) => a + b, 0);
	if (lastRowStatus === 0) {
		gameData.alienGrid.deletedRows += 1
	}
}

const lastColumnHandler = () => {
	let lastColumn = [];
	for (let c = 0; c < gameData.aliens[gameData.aliens.length - 1 - gameData.alienGrid.deletedRightColumns].length; c++) {
		lastColumn.push(gameData.aliens[gameData.aliens.length - 1 - gameData.alienGrid.deletedRightColumns][c].status)
	}
	let lastColumnStatus = lastColumn.reduce((a, b) => a + b, 0)
	if (lastColumnStatus === 0) {
		gameData.alienGrid.deletedRightColumns += 1
	}
}
const firstColumnHandler = () => {
	let firstColumn = [];
	for (let r = 0; r < gameData.aliens[0 + gameData.alienGrid.deletedLeftColumns].length; r++) {
		firstColumn.push(gameData.aliens[0 + gameData.alienGrid.deletedLeftColumns][r].status)
	}
	let firstColumnStatus = firstColumn.reduce((a, b) => a + b, 0);
	if (firstColumnStatus === 0) {
		gameData.alienGrid.deletedLeftColumns += 1
	}
}

const gridHandler = () => {
	if (!gameData.aliensDefeated) {
		firstColumnHandler();
		lastColumnHandler();
		lastRowHandler();
	}
}

const moveAliens = () => {
	gridHandler();
	drawBullets(gameData.alienBullets);

	gameData.alienGrid.offsetLeft += gameData.alienGrid.dx;
	let currentLevel = gameSettings.initialLevels - gameData.levels + 1;

	//Has the grid reached the horizontal borders - if so turn around
	if (gameData.alienGrid.offsetLeft > canvas.width - gameConstants.alienWidth * ((currentLevel * gameConstants.columnCount) - gameData.alienGrid.deletedRightColumns) - 70
		|| gameData.alienGrid.offsetLeft + (gameData.alienGrid.deletedLeftColumns * gameConstants.alienWidth) < 5) {
		gameData.alienGrid.dx = -gameData.alienGrid.dx;
		gameData.alienGrid.offsetTop -= gameData.alienGrid.dy;
	}

	//Has the grid reached too low - if so reset but lose a life
	if (canvas.height - (((currentLevel * gameConstants.rowCount) - gameData.alienGrid.deletedRows) * (gameConstants.alienHeight + gameConstants.padding) + gameData.alienGrid.offsetTop) <= 160) {
		gameData.player.takeDamage(100);
		resetAliens();
	}
}

const selectAlien = () => {
	let currentLevel = gameSettings.initialLevels - gameData.levels + 1;
	if (!gameData.aliensDefeated) {
		let a = randomIndex(0, (gameConstants.columnCount * currentLevel));
		let b = randomIndex(0, (gameConstants.rowCount * currentLevel));
		if (gameData.aliens[a][b].status === 1) {
			gameData.aliens[a][b].fire();
		} else {
			selectAlien();
		}
	}
}

const alienCollisionDetection = () => {
	for (let c = 0; c < gameData.aliens.length; c++) {
		for (let r = 0; r < gameData.aliens[c].length; r++) {
			gameData.aliens[c][r].collisionDetection(gameData.playerBullets);
		}
	}
}


//#endregion

//#region Credits Screen

const creditsScreen = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	fillText('CREDITS', canvas.width / 2, canvas.height / 2, gameSettings.colors.base, 40);
	fillText('Based on the original Space Balti by', canvas.width / 2, (canvas.height / 2) + 40, gameSettings.colors.base, 30);
	fillText('Andrew Beattie, Jake Francis, Kasir Abbas, Elliot Wood', canvas.width / 2, (canvas.height / 2) + 70, gameSettings.colors.base, 20);
	fillText('Game icons from: game-icons.net', canvas.width / 2, (canvas.height / 2) + 100, gameSettings.colors.base, 25);
};

const creditsScreenFunction = (e) => {
	if (!gameData.controls.enterPressed && !gameData.controls.inProgress) {
		if (e.keyCode === 67) {
			gameData.creditsScreenDisplayed = !gameData.creditsScreenDisplayed;
			if (gameData.creditsScreenDisplayed) {
				end(spaceBalti);
				end(gameIntervals.loadScreenId);
				gameIntervals.loadScreenId = undefined;
				gameIntervals.creditScreenId = setInterval(creditsScreen, 10);
			} else if (!gameData.creditsScreenDisplayed) {
				end(gameIntervals.creditScreenId);
				gameIntervals.creditScreenId = null;
				runGame();
			}
		}
	}
}
//#endregion

//#region Pause Screen

const pauseFunction = (e) => {
	if (gameData.controls.inProgress) {
		if (e.keyCode === 80) {

			gameData.controls.paused = !gameData.controls.paused;

			if (!gameData.aliensDefeated) {
				if (gameData.controls.paused) {
					end(gameIntervals.drawScreenId);
					end(gameIntervals.selectAlienId);
					gameIntervals.pausedScreenId = setInterval(pauseScreen, 10);
				} else {
					end(gameIntervals.pausedScreenId);
					gameIntervals.drawScreenId = setInterval(draw, 10);
					gameIntervals.selectAlienId = setInterval(selectAlien, gameConstants.frequency);
				}
			} else {
				if (gameData.controls.paused) {
					end(gameIntervals.bossScreenId);
					end(gameIntervals.bossGunsId);
					gameIntervals.pausedScreenId = setInterval(pauseScreen, 10);
				} else {
					end(gameIntervals.pausedScreenId);
					gameIntervals.bossScreenId = setInterval(drawBossScreen, 10);
					gameIntervals.bossGunsId = setInterval(bossFire, gameData.boss.frequency);
				}
			}
		}
	}
}

const pauseScreen = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	blinkingText('PAUSED', canvas.width / 2, canvas.height / 2, 500, gameSettings.colors.base, 60);
	blinkingText('Press P to unpause', canvas.width / 2, canvas.height / 1.75, 500, gameSettings.colors.base, 40)
}

//#endregion

//#region Game Functionality

const winCheck = () => {
	let currentLevel = gameSettings.initialLevels - gameData.levels + 1;

	if (gameData.alienGrid.deletedLeftColumns + gameData.alienGrid.deletedRightColumns > currentLevel * gameConstants.columnCount) {
		gameData.alienGrid.deletedLeftColumns = 0;
		gameData.alienGrid.deletedRightColumns = 0;
		if (gameData.alienGrid.deletedRows < 1) {
			gameData.alienGrid.deletedRows = 0
		}
		gameData.levels -= 1;

		if (gameData.levels > 0) {
			resetBullets();
			resetAliens();
		} else if (gameData.levels <= 0) {
			gameData.levels = 0;
			gameData.aliensDefeated = true;
		}
	}
}

const bossLoad = () => {
	if (gameData.aliensDefeated) {
		end(gameIntervals.drawScreenId)
		end(gameIntervals.selectAlienId)
		loadBossScreen();
	}
}

const resetStars = (interval = 1000) => {
	end(gameIntervals.starsIntervalId);
	gameData.stars = [];
	gameIntervals.starsIntervalId = setInterval(createStar, interval);
}

const createStar = () => {
	var speed = gameData.player.hyperSpaceEngaged
		? 30
		: 5;

	gameData.stars.push(new Star(speed));
}

const draw = () => {

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	fillText('LEVEL: ' + (gameSettings.initialLevels - gameData.levels + 1), canvas.width / 2, 40, gameSettings.colors.base, 35);

	gameData.player.draw();

	gameData.player.healthCheck();
	gameData.player.move();
	drawScore();

	gameData.player.collisionDetection(gameData.alienBullets);
	gameData.player.collisionDetection(gameData.powerUps);
	drawBullets(gameData.playerBullets);
	drawStars();
	drawPowerUps();

	drawAliens();
	moveAliens();

	alienCollisionDetection();


	winCheck();
	bossLoad();

};

const spaceBalti = (e) => {
	if (e.keyCode == 13) {
		runGame();
	}
}

const loadScreen = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawStars();
	fillText("SPACE BALTI 2: BALTIMORE", canvas.width / 2, canvas.height / 2.75, gameSettings.colors.base, 60);
	blinkingText('Press Enter', canvas.width / 2, canvas.height / 2, 500, gameSettings.colors.base, 60);
	fillText("Left: ←     Right: → ", canvas.width / 2, canvas.height / 1.75, gameSettings.colors.base, 25);
	fillText('Fire: Space     Pause: P', canvas.width / 2, canvas.height / 1.60, gameSettings.colors.base, 25);
	fillText("Press C for credits", canvas.width - 90, canvas.height - 20, gameSettings.colors.base, 20)
}

const playGame = () => {
	end(gameIntervals.loadScreenId)
	gameIntervals.drawScreenId = setInterval(draw, 10)
	gameIntervals.selectAlienId = setInterval(selectAlien, gameConstants.frequency);
}

const drawBossScreen = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawStars();
	gameData.player.draw();
	gameData.player.move();
	gameData.player.collisionDetection(gameData.alienBullets);
	gameData.player.collisionDetection(gameData.powerUps);
	drawBullets(gameData.playerBullets);
	gameData.player.healthCheck();

	gameData.boss.move();
	gameData.boss.draw();

	if (gameData.boss.loaded) {
		gameData.boss.collisionDetection(gameData.playerBullets);
		drawBullets(gameData.alienBullets);
		drawPowerUps();
	} else {
		blinkingText('GET READY', canvas.width / 2, canvas.height / 2, 300, gameSettings.colors.base, 60);
	}
}

const loadBossScreen = () => {
	gameIntervals.bossScreenId = setInterval(drawBossScreen, 10);
	setTimeout(function () {
		gameIntervals.bossGunsId = setInterval(bossFire, gameData.boss.frequency)
	}, 2500)
}

const gameOver = () => {
	end(gameIntervals.drawScreenId)
	end(gameIntervals.selectAlienId)
	end(gameIntervals.bossScreenId)
	end(gameIntervals.bossGunsId);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let finalScore = Math.floor((gameData.score * (1 + gameData.player.lives) * (1 + (gameData.player.health / 100))));
	ctx.font = '55px Arial';
	ctx.fillStyle = gameSettings.colors.base;
	ctx.fillText(
		gameData.bossDefeated
			? "THANK YOU BOSSMAN"
			: "GAME OVER"
		, canvas.width / 2, canvas.height / 2);
	ctx.fillText("FINAL SCORE: " + finalScore, canvas.width / 2, 70 + canvas.height / 2);
	ctx.fillText("Press Enter to restart", canvas.width / 2, 150 + canvas.height / 2);
	gameData.bossDefeated = true;
}

const runGame = () => {
	if (!gameData.controls.enterPressed && !gameData.controls.inProgress && !gameData.creditsScreenDisplayed) {
		gameIntervals.loadScreenId = setInterval(loadScreen, 10);
	} else {
		end(gameIntervals.loadScreenId);
	}
	if (gameData.controls.enterPressed === true && !gameData.controls.inProgress) {
		gameData.controls.enterPressed = false;
		gameData.controls.inProgress = true;
		playGame();
	}
}

const gameReset = (e) => {
	if (e.keyCode === 13 & gameData.bossDefeated) {
		gameInit();
	}
}

//#endregion

gameInit();


document.addEventListener("keydown", keyDownHandler, false)
document.addEventListener("keyup", keyUpHandler, false)
document.addEventListener("keydown", spaceBalti, false)
document.addEventListener('keydown', pauseFunction, false)
document.addEventListener('keydown', gameReset, false)
document.addEventListener('keydown', fire, false)
document.addEventListener('keydown', creditsScreenFunction, false);