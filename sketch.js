/*

- Copy your game project code into this file
- for the p5.Sound library look here https://p5js.org/reference/#/libraries/p5.sound
- for finding cool sounds perhaps look here
https://freesound.org/


*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var startTime;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isHit;

var clouds;
var mountains;
var trees_x;
var petals;
var cherrypetals;
var canyons;
var collectables;
var new_collectables;

var enemy;

var game_score;
var lives;
var initLives;

var light;

var jumpSound;
var backgroundSound;
var splashSound;
var collectablesSound;
var gameoverSound;
var levelcompleteSound1;
var levelcompleteSound2;
var shurikenSound;
var hitSound;

function preload()
{
    soundFormats('mp3','wav');
    
	//load your sounds here
	backgroundSound = loadSound('assets/engawa_by_niconi_commons.mp3');
	backgroundSound.setVolume(0.1);

    jumpSound = loadSound('assets/jump.wav');
	jumpSound.setVolume(0.07);

	splashSound = loadSound('assets/splash.wav');
	splashSound.setVolume(0.06);

	collectablesSound = loadSound('assets/amount-display1.mp3');
	collectablesSound.setVolume(0.08);

	gameoverSound = loadSound('assets/natsukashii_fuzei.mp3');
	gameoverSound.setVolume(0.08);

	levelcompleteSound1 = loadSound('assets/drum-japanese2.mp3');
	levelcompleteSound1.setVolume(0.1);

	levelcompleteSound2 = loadSound('assets/ichi_by_SHW.mp3');
	levelcompleteSound2.setVolume(0.1);

	shurikenSound = loadSound('assets/shakin2.mp3');
	shurikenSound.setVolume(0.07);

	hitSound = loadSound('assets/knife-stab-1.mp3');
	hitSound.setVolume(0.1);
	
};

function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
	lives = 3;
	new_collectables = [];
	startGame();
};


function draw()
{
	
	// fill the sky blue with gradient
	setGradient(0, 0, width, floorPos_y, sky_l, sky_d, 1);
	
	noStroke();
	fill(123,162,63);
	rect(0, floorPos_y, width, height/4); // draw some green ground

	push();
	translate(scrollPos * 0.1, 0)
	// Draw clouds.
	drawClouds();
	pop();

	push();
	translate(scrollPos * 0.2, 0)
	// Draw mountains.
	drawMountains();
	pop();

	push();
	translate(scrollPos, 0)
	// Draw trees.
	drawTrees();

	// Draw canyons.
	for(var i = 0; i < canyons.length; i++)
	{
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
	};
	pop();
	
	push();
	translate(scrollPos, 0)
	// Draw collectable items.
	for(var i = 0; i < collectables.length; i++)
	{
		if(collectables[i].isFound == false)
		{
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		};
	};
	
	// Draw enemies
	for(var i = 0; i < enemy.length; i++)
	{
		if(dist(gameChar_world_x, gameChar_y - 10, enemy[i].pos_x, enemy[i].pos_y - 100) < 300 
			&& enemy[i].shurikenThrown == false)
		{
			drawEnemy(enemy[i]);
			checkShurikenThrown(enemy[i]);
		};

		if(dist(gameChar_world_x, gameChar_y - 10, enemy[i].pos_x, enemy[i].pos_y - 100) < 295 
			&& enemy[i].shuriken_y < floorPos_y
			&& enemy[i].shurikenHit == false)
		{
			drawShuriken(enemy[i]);
			checkShurikenHit(enemy[i]);
		};
	};
	pop();
	
	// Darken the background when level completed
	if(light.isReached)
	{
		push();
		noStroke();
		fill(0,0,0,200);
		rect(0, 0, width, height);
		pop();
	};

	// Draw light at the goal
	push();
	translate(scrollPos, 0);
	drawLight();
	pop();

	push();
	translate(scrollPos + width/4, 0);
	// Draw petals.
	var t = frameCount / 180; // update time
	// create a cherrypetal each frame
	cherrypetals.push(new drawPetals()); // append cherrypetal object
	// loop through cherrypetals with a for..of loop
	for (var petal of cherrypetals)
	{
		petal.update(t); // update cherrypetal position
		petal.display(); // draw cherrypetal
	};
	pop();

	// Draw game character.
	drawGameChar();

	// Draw game score.
	fill(100);
	noStroke();
	textSize(16);
	text("score: " + game_score, 20, 20);

	// Draw lives.
	for(var i = lives; i >= 0; i--)
	{
		text("lives: " + lives, 110, 20);
	};
	// Draw gameover message
	if(lives < 1)
	{
		push();
		noStroke();
		fill(180, 48, 21,180);
		rect(0, 0, width, height);
		fill(200);
		textSize(24);
		textAlign(CENTER);
		text("Game Over ...", width/2, height/3)
		textSize(20);
		text("Press space to continue", width/2, height/4 + 380)
		pop();
		return;
	};
	// Draw level complete message
	if(light.isReached)
	{
		push();
		fill(200);
		textSize(24);
		textAlign(CENTER);
		text("Level complete", width/2, height/5)
		text("Total score: " + str(game_score) + " / " + str(collectables.length*10), width/2, height/5 + 40);
		textSize(20);
		text("Press space to continue", width/2, height/4 + 380);
		pop();
		return;
	};

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.4)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		};
	};

	if(isRight)
	{
		if(gameChar_x < width * 0.6)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		};
	};

	// Logic to make the game character rise and fall.
	if(gameChar_y < floorPos_y)
	{
		isFalling = true;
		gameChar_y += 8;
	}
	else
	{
		isFalling = false;
	}
	
	if(isPlummeting)
	{
		gameChar_y += 10;
		isLeft = isRight = false;
		if(gameChar_y == 532 || gameChar_y == 532 && isHit != true)
		{
			splashSound.play();
		};
	};

	if(light.isReached == false)
	{

		checkLight();
	};

	if(light.isReached)
	{
		backgroundSound.stop();
		levelcompleteSound1.play();
		levelcompleteSound2.loop();
	};
	
	checkPlayerDie();

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
};


// ---------------------
// Key control functions
// ---------------------

function keyPressed(){

	console.log("press" + keyCode);
	console.log("press" + key);
	if(key == "a" || keyCode == 37)
	{
		isLeft = true;
	}

	else if(key == "d" || keyCode == 39)
	{
		isRight = true;
	}

	else if((key == "w" || keyCode == 32) && (gameChar_y == floorPos_y) && (light.isReached != true))
	{
        gameChar_y -= 160;
        jumpSound.play();
	}

	else if((key == "w" || keyCode == 32) && (lives == 0))
	{
		gameoverSound.stop();
		lives = initLives;
		game_score = 0;
		startGame();
	}

	else if((key == "w" || keyCode == 32) && (light.isReached == true))
	{
		levelcompleteSound2.stop()
		lives = initLives;
		game_score = 0;
		startGame();
	};
};


function keyReleased()
{
	if(key == "a" || keyCode == 37)
	{
		isLeft =false;
	}

	else if(key == "d" || keyCode == 39)
	{
		isRight = false;
	}

};


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
	if(isLeft && isFalling)
	{
		// add your jumping-left code
		// shell
		fill(240, 213, 181);
		ellipse(gameChar_x + 17, gameChar_y - 44, 11, 10);
		fill(255, 228, 196);
		ellipse(gameChar_x + 12, gameChar_y - 39, 20, 22);
		fill(240, 213, 181);
		ellipse(gameChar_x + 6, gameChar_y - 34, 30, 30);
		fill(255, 228, 196);
		arc(gameChar_x + 1, gameChar_y - 28, 35, 40, PI - PI/4, PI/4, CHORD);
		fill(240, 213, 181);
		arc(gameChar_x - 1, gameChar_y - 24, 26, 28, PI - PI/5, PI/5, CHORD);

		// body
		fill(221, 160, 221);
		ellipse(gameChar_x - 6, gameChar_y -35, 7, 8);
		ellipse(gameChar_x - 10, gameChar_y - 38, 6, 11);
		ellipse(gameChar_x -2, gameChar_y - 38, 6, 11);

		//claws
		rect(gameChar_x - 15, gameChar_y - 37, 9, 16, 5);
		rect(gameChar_x - 9, gameChar_y - 37, 12, 16, 5);
		arc(gameChar_x - 13, gameChar_y - 22, 9, 16, PI - PI/2.2, PI/2.2, PIE);
		arc(gameChar_x - 1, gameChar_y - 22, 11, 16, PI - PI/2.2, PI/2.2, PIE);
		rect(gameChar_x - 18, gameChar_y - 33, 4, 12, 1);
		rect(gameChar_x + 2, gameChar_y - 33, 5, 12, 1);
		arc(gameChar_x - 18, gameChar_y - 23, 4, 15, HALF_PI + PI/24, 0, CHORD);
		arc(gameChar_x + 6, gameChar_y - 22, 4, 20, PI, HALF_PI - PI/24, CHORD);
		rect(gameChar_x - 20, gameChar_y - 31, 3, 11, 1);
		rect(gameChar_x + 6, gameChar_y - 30, 6, 12, 2);
		arc(gameChar_x - 20, gameChar_y - 22, 3, 10, HALF_PI, - HALF_PI, CHORD);
		arc(gameChar_x + 16, gameChar_y - 18, 16, 6, PI/6, PI + PI/6, CHORD);
		
		// eyes
		fill(0);
		ellipse(gameChar_x - 10, gameChar_y - 40, 5, 10);
		ellipse(gameChar_x - 2, gameChar_y - 40, 5, 10);

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
		// shell
		fill(240, 213, 181);
		ellipse(gameChar_x - 17, gameChar_y - 44, 11, 10);
		fill(255, 228, 196);
		ellipse(gameChar_x - 12, gameChar_y - 39, 20, 22);
		fill(240, 213, 181);
		ellipse(gameChar_x - 6, gameChar_y - 34, 30, 30);
		fill(255, 228, 196);
		arc(gameChar_x - 1, gameChar_y - 28, 35, 40, PI - PI/4, PI/4, CHORD);
		fill(240, 213, 181);
		arc(gameChar_x + 1, gameChar_y - 24, 26, 28, PI - PI/5, PI/5, CHORD);

		// body
		fill(221, 160, 221);
		ellipse(gameChar_x + 6, gameChar_y -35, 7, 8);
		ellipse(gameChar_x + 10, gameChar_y - 38, 6, 11);
		ellipse(gameChar_x + 2, gameChar_y - 38, 6, 11);

		//claws
		rect(gameChar_x + 6, gameChar_y - 37, 9, 16, 5);
		rect(gameChar_x - 3, gameChar_y - 37, 12, 16, 5);
		arc(gameChar_x + 13, gameChar_y - 22, 9, 16, PI - PI/2.2, PI/2.2, PIE);
		arc(gameChar_x + 1, gameChar_y - 22, 11, 16, PI - PI/2.2, PI/2.2, PIE);
		rect(gameChar_x + 14, gameChar_y - 33, 4, 12, 1);
		rect(gameChar_x - 7, gameChar_y - 33, 5, 12, 1);
		arc(gameChar_x + 18, gameChar_y - 23, 4, 15, PI, HALF_PI - PI/24, CHORD);
		arc(gameChar_x - 6, gameChar_y - 22, 4, 20, HALF_PI + PI/24, 0, CHORD);
		rect(gameChar_x + 17, gameChar_y - 31, 3, 11, 1);
		rect(gameChar_x - 12, gameChar_y - 30, 6, 12, 2);
		arc(gameChar_x + 20, gameChar_y - 22, 3, 10, PI + HALF_PI, HALF_PI, CHORD);
		arc(gameChar_x - 16, gameChar_y - 18, 16, 6, - PI/6, PI - PI/6, CHORD);
		
		// eyes
		fill(0);
		ellipse(gameChar_x + 10, gameChar_y - 40, 5, 10);
		ellipse(gameChar_x + 2, gameChar_y - 40, 5, 10);

	}
	else if(isLeft)
	{
		// add your walking left code
		// shell
		fill(240, 213, 181);
		ellipse(gameChar_x + 17, gameChar_y - 33, 11, 10);
		fill(255, 228, 196);
		ellipse(gameChar_x + 12, gameChar_y - 28, 20, 22);
		fill(240, 213, 181);
		ellipse(gameChar_x + 6, gameChar_y - 23, 30, 30);
		fill(255, 228, 196);
		arc(gameChar_x + 1, gameChar_y - 17, 35, 40, PI - PI/4, PI/4, CHORD);
		fill(240, 213, 181);
		arc(gameChar_x - 1, gameChar_y - 13, 26, 28, PI - PI/5, PI/5, CHORD);

		// body
		fill(221, 160, 221);
		ellipse(gameChar_x - 6, gameChar_y -25, 7, 8);
		ellipse(gameChar_x - 10, gameChar_y - 28, 6, 11);
		ellipse(gameChar_x -2, gameChar_y - 28, 6, 11);

		//claws
		rect(gameChar_x - 15, gameChar_y - 27, 9, 16, 5);
		rect(gameChar_x - 9, gameChar_y -27, 12, 16, 5);
		arc(gameChar_x - 13, gameChar_y - 8, 9, 16, PI - PI/2.2, PI/2.2, PIE);
		arc(gameChar_x - 1, gameChar_y - 8, 11, 16, PI - PI/2.2, PI/2.2, PIE);
		rect(gameChar_x - 18, gameChar_y - 23, 4, 12, 1);
		rect(gameChar_x + 2, gameChar_y - 23, 5, 12, 1);
		arc(gameChar_x - 18, gameChar_y - 10, 4, 15, HALF_PI + PI/24, 0, CHORD);
		arc(gameChar_x + 6, gameChar_y - 9, 4, 20, PI, HALF_PI - PI/24, CHORD);
		rect(gameChar_x - 20, gameChar_y - 21, 3, 11, 1);
		rect(gameChar_x + 6, gameChar_y - 20, 6, 13, 2);
		arc(gameChar_x - 20, gameChar_y - 10, 3, 10, HALF_PI, - HALF_PI, CHORD);
		arc(gameChar_x + 16, gameChar_y - 7, 16, 6, PI/6, PI + PI/6, CHORD);
		
		// eyes
		fill(0);
		ellipse(gameChar_x - 10, gameChar_y - 30, 5, 10);
		ellipse(gameChar_x - 2, gameChar_y - 30, 5, 10);

	}
	else if(isRight)
	{
		// add your walking right code
		// shell
		fill(240, 213, 181);
		ellipse(gameChar_x - 17, gameChar_y - 33, 11, 10);
		fill(255, 228, 196);
		ellipse(gameChar_x - 12, gameChar_y - 28, 20, 22);
		fill(240, 213, 181);
		ellipse(gameChar_x - 6, gameChar_y - 23, 30, 30);
		fill(255, 228, 196);
		arc(gameChar_x - 1, gameChar_y - 17, 35, 40, PI - PI/4, PI/4, CHORD);
		fill(240, 213, 181);
		arc(gameChar_x + 1, gameChar_y - 13, 26, 28, PI - PI/5, PI/5, CHORD);

		// body
		fill(221, 160, 221);
		ellipse(gameChar_x + 6, gameChar_y -25, 7, 8);
		ellipse(gameChar_x + 10, gameChar_y - 28, 6, 11);
		ellipse(gameChar_x + 2, gameChar_y - 28, 6, 11);

		//claws
		rect(gameChar_x + 6, gameChar_y - 27, 9, 16, 5);
		rect(gameChar_x - 3, gameChar_y -27, 12, 16, 5);
		arc(gameChar_x + 13, gameChar_y - 8, 9, 16, PI - PI/2.2, PI/2.2, PIE);
		arc(gameChar_x + 1, gameChar_y - 8, 11, 16, PI - PI/2.2, PI/2.2, PIE);
		rect(gameChar_x + 14, gameChar_y - 23, 4, 12, 1);
		rect(gameChar_x - 7, gameChar_y - 23, 5, 12, 1);
		arc(gameChar_x + 18, gameChar_y - 10, 4, 15, PI, HALF_PI - PI/24, CHORD);
		arc(gameChar_x - 6, gameChar_y - 9, 4, 20, HALF_PI + PI/24, 0, CHORD);
		rect(gameChar_x + 17, gameChar_y - 21, 3, 11, 1);
		rect(gameChar_x - 12, gameChar_y - 20, 6, 13, 2);
		arc(gameChar_x + 20, gameChar_y - 10, 3, 10, PI + HALF_PI, HALF_PI, CHORD);
		arc(gameChar_x - 16, gameChar_y - 7, 16, 6, - PI/6, PI - PI/6, CHORD);
		
		// eyes
		fill(0);
		ellipse(gameChar_x + 10, gameChar_y - 30, 5, 10);
		ellipse(gameChar_x + 2, gameChar_y - 30, 5, 10);

	}
	else if(isFalling || isPlummeting || isHit)
	{
		// add your jumping facing forwards code
		// shell
		fill(240, 213, 181);
		ellipse(gameChar_x, gameChar_y - 36, 38, 36);
		fill(255, 228, 196);
		arc(gameChar_x, gameChar_y - 31, 46, 40, PI - PI/3, PI/3, CHORD);
		fill(240, 213, 181);
		arc(gameChar_x, gameChar_y - 28, 40, 28, PI - PI/3, PI/3, CHORD);

		// body
		fill(221, 160, 221);
		ellipse(gameChar_x, gameChar_y -35, 7, 8)
		ellipse(gameChar_x - 5, gameChar_y - 38, 6, 11);
		ellipse(gameChar_x + 5, gameChar_y - 38, 6, 11);

		// claws
		rect(gameChar_x - 10, gameChar_y - 37, 10, 17, 5);
		rect(gameChar_x, gameChar_y -37, 10, 17, 5);
		arc(gameChar_x - 5.5, gameChar_y - 21, 10, 14, PI - PI/2.2, PI/2.2, PIE);
		arc(gameChar_x + 5.5, gameChar_y - 21, 10, 14, PI - PI/2.2, PI/2.2, PIE);
		rect(gameChar_x - 14, gameChar_y - 33, 4, 12, 1);
		rect(gameChar_x + 10, gameChar_y - 33, 4, 12, 1);
		arc(gameChar_x - 13, gameChar_y - 21, 5, 15, HALF_PI + PI/24, 0, CHORD);
		arc(gameChar_x + 13, gameChar_y - 21, 5, 15, PI, HALF_PI - PI/24, CHORD);
		rect(gameChar_x - 17, gameChar_y - 31, 3, 11, 1);
		rect(gameChar_x + 14, gameChar_y - 31, 3, 11, 1);
		arc(gameChar_x - 16.5, gameChar_y - 20, 3, 10, HALF_PI + PI/24, 0, CHORD);
		arc(gameChar_x + 16.5, gameChar_y - 20, 3, 10, PI, HALF_PI - PI/24, CHORD);
		
		// eyes
		fill(0);
		ellipse(gameChar_x - 5, gameChar_y - 40, 5, 10);
		ellipse(gameChar_x + 5, gameChar_y - 40, 5, 10);

	}
	else
	{
		// add your standing front facing code
		// shell
		fill(240, 213, 181);
		ellipse(gameChar_x, gameChar_y - 26, 38, 36);
		fill(255, 228, 196);
		arc(gameChar_x, gameChar_y - 21, 46, 40, PI - PI/3, PI/3, CHORD);
		fill(240, 213, 181);
		arc(gameChar_x, gameChar_y - 18, 40, 28, PI - PI/3, PI/3, CHORD);

		// body
		fill(221, 160, 221);
		ellipse(gameChar_x, gameChar_y -25, 7, 8)
		ellipse(gameChar_x - 5, gameChar_y - 28, 6, 11);
		ellipse(gameChar_x + 5, gameChar_y - 28, 6, 11);

		// claws
		rect(gameChar_x - 10, gameChar_y - 27, 10, 20, 5);
		rect(gameChar_x, gameChar_y -27, 10, 20, 5);
		arc(gameChar_x - 5.5, gameChar_y - 8, 10, 16, PI - PI/2.2, PI/2.2, PIE);
		arc(gameChar_x + 5.5, gameChar_y - 8, 10, 16, PI - PI/2.2, PI/2.2, PIE);
		rect(gameChar_x - 14, gameChar_y - 23, 4, 12, 1);
		rect(gameChar_x + 10, gameChar_y - 23, 4, 12, 1);
		arc(gameChar_x - 13, gameChar_y - 11, 4, 15, HALF_PI, 0, CHORD);
		arc(gameChar_x + 13, gameChar_y - 11, 4, 15, PI, HALF_PI, CHORD);
		rect(gameChar_x - 17, gameChar_y - 21, 3, 11, 1);
		rect(gameChar_x + 14, gameChar_y - 21, 3, 11, 1);
		arc(gameChar_x - 16.5, gameChar_y - 10, 2, 10, HALF_PI, 0, CHORD);
		arc(gameChar_x + 16.5, gameChar_y - 10, 2, 10, PI, HALF_PI, CHORD);
		
		// eyes
		fill(0);
		ellipse(gameChar_x - 5, gameChar_y - 30, 5, 10);
		ellipse(gameChar_x + 5, gameChar_y - 30, 5, 10);

	};
};

// ------------------------------
// Enemy render function
// ------------------------------

function drawEnemy(t_enemy)
{
	push();
	noStroke();
	fill(0,0,0);
	translate(t_enemy.pos_x, t_enemy.pos_y);
	rotate(PI/4);
	rect(7, -60, 18, 40, 10);
	rotate(-PI/3);
	rect(41, -30, 29, 31.5, 10);
	rotate(-PI/5);
	rect(45, 25, 17, 25, 5);
	rotate(PI/6);
	rect(64, 10, 13, 15, 2);
	rect(48, -38, 20, 25, 8);
	fill(255, 225, 205);
	rect(48, -31, 10, 4);
	pop();

	noStroke();
	fill(0);
	triangle(t_enemy.pos_x + 70, t_enemy.pos_y, t_enemy.pos_x + 70, t_enemy.pos_y - 10, t_enemy.pos_x + 90, t_enemy.pos_y);
	triangle(t_enemy.pos_x, t_enemy.pos_y - 45, t_enemy.pos_x + 50, t_enemy.pos_y - 41, t_enemy.pos_x + 50, t_enemy.pos_y -23);
	triangle(t_enemy.pos_x + 44, t_enemy.pos_y - 57, t_enemy.pos_x + 52, t_enemy.pos_y - 50, t_enemy.pos_x + 51, t_enemy.pos_y - 59);
	rect(t_enemy.pos_x + 50, t_enemy.pos_y - 28, 30, 3);
	beginShape();
	vertex(t_enemy.pos_x - 1, t_enemy.pos_y - 49);
	vertex(t_enemy.pos_x + 2, t_enemy.pos_y - 49);
	vertex(t_enemy.pos_x + 10, t_enemy.pos_y - 44);
	vertex(t_enemy.pos_x + 4, t_enemy.pos_y - 44);
	endShape();
};

function drawShuriken(t_enemy)
{
	noStroke();
	fill(50);
	triangle(t_enemy.pos_x - 5, t_enemy.shuriken_y, t_enemy.pos_x + 5, t_enemy.shuriken_y, t_enemy.pos_x, t_enemy.shuriken_y + 10);
	triangle(t_enemy.pos_x - 5, t_enemy.shuriken_y, t_enemy.pos_x + 5, t_enemy.shuriken_y, t_enemy.pos_x, t_enemy.shuriken_y - 10);
	triangle(t_enemy.pos_x, t_enemy.shuriken_y - 5, t_enemy.pos_x, t_enemy.shuriken_y + 5, t_enemy.pos_x + 10, t_enemy.shuriken_y);
	triangle(t_enemy.pos_x, t_enemy.shuriken_y - 5, t_enemy.pos_x, t_enemy.shuriken_y + 5, t_enemy.pos_x - 10, t_enemy.shuriken_y);
	fill(255, 200);
	ellipse(t_enemy.pos_x, t_enemy.shuriken_y, 3,3);
	
	if(t_enemy.shurikenThrown == true)
	{
		t_enemy.pos_x -= random(2, 2.5);
		t_enemy.shuriken_y += 0.8;
	};
};

function checkShurikenThrown(t_enemy)
{
	if(dist(gameChar_world_x, gameChar_y - 10, t_enemy.pos_x, t_enemy.pos_y - 100) < 250)
	{
		t_enemy.shurikenThrown = true;
		shurikenSound.play();
	};
};

function checkShurikenHit(t_enemy)
{
	if(dist(gameChar_world_x, gameChar_y - 10, t_enemy.pos_x, t_enemy.shuriken_y) < 30)
	{
		isHit = true;
		t_enemy.shurikenHit = true;
		hitSound.play();
		isPlummeting = true;
	};
};

// ---------------------------
// Background render functions
// ---------------------------

// Function to make sky gradient
function setGradient(x, y, w, h, c1, c2, axis)
{
	noFill();
	// Top to bottom gradient
	for (let i = y; i <= y + h; i++)
	{
		let inter = map(i, y, y + h, 0, 1);
		let c = lerpColor(c1, c2, inter);
		stroke(c);
		line(x, i, x + w, i);
	};
};

// Function to draw cloud objects.
function drawClouds()
{
	for(var i = 0; i < clouds.length; i++)
	{
		fill(255,255,255,200);
		rect(clouds[i].pos_x, clouds[i].pos_y, clouds[i].width - 20, clouds[i].height, 12);
		rect(clouds[i].pos_x + 30, clouds[i].pos_y + clouds[i].height*4/3, clouds[i].width, clouds[i].height, 12);
		rect(clouds[i].pos_x + 60, clouds[i].pos_y + clouds[i].height, clouds[i].width/5, clouds[i].height*1/3);
		clouds[i].pos_x -= 0.15;
	};

};

// Function to draw mountains objects.
function drawMountains()
{
	for(var i = 0; i < mountains.length; i++)
	{
		fill(90, 110, 255, 220);
		beginShape();
		vertex(mountains[i].pos_x + mountains[i].width*0.45, floorPos_y - mountains[i].height);
		vertex(mountains[i].pos_x + mountains[i].width*0.55, floorPos_y - mountains[i].height);
		vertex(mountains[i].pos_x + mountains[i].width, floorPos_y);
		vertex(mountains[i].pos_x, floorPos_y);
		endShape(CLOSE);
		fill(255, 255, 255, 120);
		beginShape();
		vertex(mountains[i].pos_x + mountains[i].width*0.45, floorPos_y - mountains[i].height);
		vertex(mountains[i].pos_x + mountains[i].width*0.55, floorPos_y - mountains[i].height);
		vertex(mountains[i].pos_x + mountains[i].width*0.55 + sq(0.45)*mountains[i].width, floorPos_y - mountains[i].height*0.55); 
		vertex(mountains[i].pos_x + mountains[i].width*0.6, floorPos_y - mountains[i].height*0.7);
		vertex(mountains[i].pos_x + mountains[i].width*0.5, floorPos_y - mountains[i].height*0.65);
		vertex(mountains[i].pos_x + mountains[i].width*0.4, floorPos_y - mountains[i].height*0.7);
		vertex(mountains[i].pos_x + mountains[i].width*0.45 - sq(0.45)*mountains[i].width, floorPos_y - mountains[i].height*0.55);
		endShape(CLOSE);
	};
};
// Function to draw trees objects.
function drawTrees()
{
	for(var i = 0; i < trees_x.length; i++)
	{
		fill(110, 100, 40);
		beginShape();
		vertex(trees_x[i], floorPos_y);
		vertex(trees_x[i] + 25, floorPos_y - 5);
		vertex(trees_x[i] + 25, floorPos_y - 72);
		vertex(trees_x[i] - 30, floorPos_y - 102);
		vertex(trees_x[i] + 25, floorPos_y - 82);
		vertex(trees_x[i] + 30, floorPos_y - 122); //center
		vertex(trees_x[i] + 35, floorPos_y - 82);
		vertex(trees_x[i] + 90, floorPos_y - 102);
		vertex(trees_x[i] + 35, floorPos_y - 72);
		vertex(trees_x[i] + 35, floorPos_y - 5);
		vertex(trees_x[i] + 60, floorPos_y);
		endShape(CLOSE);

		fill(252, 238, 235, 180);
		ellipse(trees_x[i] - 10, floorPos_y - 92, 100, 90);
		ellipse(trees_x[i], floorPos_y - 142, 80, 70);
		ellipse(trees_x[i] + 60, floorPos_y - 142, 80, 70);

		fill(252, 218, 215, 180);
		ellipse(trees_x[i] + 30, floorPos_y - 92, 100, 90);
		ellipse(trees_x[i] + 30, floorPos_y - 152, 80, 70);

		fill(252, 198, 195, 180);
		ellipse(trees_x[i] + 70, floorPos_y - 92, 100, 90);
		
	};
};

function drawPetals()
{
	// initialize coordinates
	this.pos_x = 0;
	this.pos_y = random(floorPos_y - 100, floorPos_y - 50);
	this.initialangle = random(-PI, 0);
	this.petal_w = random(2, 3);
	this.petal_h = this.petal_w * 1.5
	
	// radius of snowflake spiral
	// chosen so the cherrypetals are uniformly spread out in area
	this.radius = sqrt(random(pow(width, 2.2)));
  
	this.update = function(time)
	{
		// x position follows a circle
		var w = 0.08; // angular speed
		var angle = w * time + this.initialangle;
		this.pos_x = width/10 - 2 * this.radius * sin(angle);
	
		// different size cherrypetals fall at slightly different y speeds
		this.pos_y += pow(this.petal_w, 0.2);
	
		// delete snowflake if past end of screen
		if (this.pos_y > height)
		{
			var index = cherrypetals.indexOf(this);
			cherrypetals.splice(index, 1);
		}
	};

	this.display = function()
	{
		fill(252, int(random(198,238)), int(random(195,235)), 180);
		ellipse(this.pos_x, this.pos_y, this.petal_w, this.petal_h);
	};
};
// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
	// draw the canyon
	fill(90, 110, 255);
	rect(t_canyon.pos_x, floorPos_y, t_canyon.width, height - floorPos_y);
	fill(240, 255, 255);
	push();
	stroke(0,0,128);
	strokeWeight(1);

	var denom = [2, 3, 6];
	for(var i = 0; i < 3; i++)
	{
		arc(t_canyon.pos_x, floorPos_y + 120, t_canyon.width/denom[i], t_canyon.width/denom[i], PI + HALF_PI, HALF_PI);
		arc(t_canyon.pos_x + t_canyon.width/2, floorPos_y + 120, t_canyon.width/denom[i], t_canyon.width/denom[i], PI, 0);
		arc(t_canyon.pos_x + t_canyon.width, floorPos_y + 120, t_canyon.width/denom[i], t_canyon.width/denom[i], HALF_PI, PI + HALF_PI);
	};
	for(var i = 0; i < 3; i++)
	{
		arc(t_canyon.pos_x + t_canyon.width/4, floorPos_y + 130, t_canyon.width/denom[i], t_canyon.width/denom[i], PI, 0);
		arc(t_canyon.pos_x + t_canyon.width*3/4, floorPos_y + 130, t_canyon.width/denom[i], t_canyon.width/denom[i], PI, 0);
	};
	for(var i = 0; i < 3; i++)
	{
		arc(t_canyon.pos_x, floorPos_y + 140, t_canyon.width/denom[i], t_canyon.width/denom[i], PI + HALF_PI, HALF_PI);
		arc(t_canyon.pos_x + t_canyon.width/2, floorPos_y + 140, t_canyon.width/denom[i], t_canyon.width/denom[i], PI,0);
		arc(t_canyon.pos_x + t_canyon.width, floorPos_y + 140, t_canyon.width/denom[i], t_canyon.width/denom[i], HALF_PI, PI + HALF_PI);
	};
	for(var i = 0; i < 3; i++)
	{
		arc(t_canyon.pos_x + t_canyon.width/4, floorPos_y + 150, t_canyon.width/denom[i], t_canyon.width/denom[i], PI, 0);
		arc(t_canyon.pos_x + t_canyon.width*3/4, floorPos_y + 150, t_canyon.width/denom[i], t_canyon.width/denom[i], PI, 0);
	};
	for(var i = 0; i < 3; i++)
	{
		arc(t_canyon.pos_x, floorPos_y + 160, t_canyon.width/denom[i], t_canyon.width/denom[i], PI + HALF_PI, HALF_PI);
		arc(t_canyon.pos_x + t_canyon.width/2, floorPos_y + 160, t_canyon.width/denom[i], t_canyon.width/denom[i], PI,0);
		arc(t_canyon.pos_x + t_canyon.width, floorPos_y + 160, t_canyon.width/denom[i], t_canyon.width/denom[i], HALF_PI, PI + HALF_PI);
	};
	pop();
};

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
	if(((gameChar_world_x > t_canyon.pos_x + 15) 
		&& (gameChar_world_x < t_canyon.pos_x + t_canyon.width - 15)) 
		&& (gameChar_y >= floorPos_y))
	{
		isPlummeting = true;
	};
};

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
	var round = 10;
	noStroke();
	fill(218, 179, 0);
	rect(t_collectable.pos_x - 10, t_collectable.pos_y - 15, 20, 30, round);
	
	noFill();
	strokeWeight(1.1);
	stroke(162, 126, 57);
	rect(t_collectable.pos_x - 3, t_collectable.pos_y - 7, 6, 14);

	strokeWeight(0.5)
	for (var i = 0; i < 8; i++)
	{
		line(t_collectable.pos_x - 9, t_collectable.pos_y + i, t_collectable.pos_x - 4, t_collectable.pos_y + i);
		line(t_collectable.pos_x - 9, t_collectable.pos_y - i, t_collectable.pos_x - 4, t_collectable.pos_y - i);
		line(t_collectable.pos_x + 9, t_collectable.pos_y + i, t_collectable.pos_x + 4, t_collectable.pos_y + i);
		line(t_collectable.pos_x + 9, t_collectable.pos_y - i, t_collectable.pos_x + 4, t_collectable.pos_y - i);
	};
	for (var i = 8; i < 15; i++)
	{
		var k = 2*sqrt(sq(round) - sq(round-(15-i)))/2 - 1
		line(t_collectable.pos_x - k, t_collectable.pos_y + i, t_collectable.pos_x + k, t_collectable.pos_y + i);
		line(t_collectable.pos_x - k, t_collectable.pos_y - i, t_collectable.pos_x + k, t_collectable.pos_y - i);
	};
};

// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x, gameChar_y - 15, t_collectable.pos_x, t_collectable.pos_y) < 30)
		{
			t_collectable.isFound = true;
			game_score += 10;
			collectablesSound.play();
		};
};

function drawLight()
{
	push();
	strokeWeight(5);
	stroke(0);
	beginShape();
	line(light.pos_x, floorPos_y, light.pos_x, light.pos_y + 36);

	if(light.isReached)
	{
		for (var i = 0; i < 3; i++)
		{
			for (var j = -20; j < 20; j++)
			{
				if(j < 0)
				{
					var a =  j*0.5;
				}
				else if(j > 0)
				{
					a = - j*0.5;
				}
				noStroke();
				fill(255, 250, 200);
				ellipse(light.pos_x - j*32, light.pos_y + i*40 + a + 20, 15, 12);
				fill(255, 250, 200, 170);
				ellipse(light.pos_x - j*32, light.pos_y + i*40 + a + 20, 18, 15);
				fill(255, 250, 200, 140);
				ellipse(light.pos_x - j*32, light.pos_y + i*40 + a + 20, 21, 18);
				fill(255, 250, 200, 110);
				ellipse(light.pos_x - j*32, light.pos_y + i*40 + a + 20, 23, 20);
				fill(255, 250, 200, 50);
				ellipse(light.pos_x - j*32, light.pos_y + i*40 + a + 20, 25, 22);

				strokeWeight(2);
				stroke(0,150);
				fill(255,150,0,170);
				beginShape();
				vertex(light.pos_x - j*32 - 8, light.pos_y + i*40 + a);
				vertex(light.pos_x - j*32 + 8, light.pos_y + i*40 + a);
				vertex(light.pos_x - j*32 + 16, light.pos_y + i*40 + a + 3);
				vertex(light.pos_x - j*32 + 8, light.pos_y + i*40 + a + 35);
				vertex(light.pos_x - j*32 + 4, light.pos_y + i*40 + a + 36);
				vertex(light.pos_x - j*32 - 4, light.pos_y + i*40 + a + 36);
				vertex(light.pos_x - j*32 - 8, light.pos_y + i*40 + a + 35);
				vertex(light.pos_x - j*32 - 16, light.pos_y + i*40 + a + 3);
				endShape(CLOSE);
				line(light.pos_x - j*32 - 8, light.pos_y + i*40 + a ,light.pos_x - j*32 - 4, light.pos_y + i*40 + a + 34);
				line(light.pos_x - j*32 + 8, light.pos_y + i*40 + a ,light.pos_x - j*32 + 4, light.pos_y + i*40 + a + 34);
				line(light.pos_x - j*32 - 4, light.pos_y + i*40 + a + 34, light.pos_x - j*32 + 4, light.pos_y + i*40 + a + 34);
				line(light.pos_x - j*32 - 8, light.pos_y + i*40 + a + 35, light.pos_x - j*32 - 4, light.pos_y + i*40 + a + 34);
				line(light.pos_x - j*32 + 4, light.pos_y + i*40 + a + 34, light.pos_x - j*32 + 8, light.pos_y + i*40 + a + 35);
			}
		};
		noStroke();
		fill(255, 255, 200, random(80, 120));
		star(light.pos_x - 50, 100, 1, 3, 4);
		star(light.pos_x - 80, 70, 1, 3, 4);
		star(light.pos_x - 180, 55, 1, 3, 4);
		star(light.pos_x - 100, 40, 1, 5, 4);
		star(light.pos_x - 300, 20, 1, 5, 4);
		star(light.pos_x - 250, 50, 1, 3, 4);
		star(light.pos_x - 400, 45, 1, 3, 4);
		star(light.pos_x - 420, 60, 1, 5, 4);
		star(light.pos_x - 450, 50, 1, 3, 4);
		star(light.pos_x - 500, 20, 1, 3, 4);
		star(light.pos_x - 580, 70, 1, 5, 4);
		star(light.pos_x + 50, 100, 1, 3, 4);
		star(light.pos_x + 80, 70, 1, 3, 4);
		star(light.pos_x + 180, 55, 1, 3, 4);
		star(light.pos_x + 100, 40, 1, 5, 4);
		star(light.pos_x + 300, 20, 1, 5, 4);
		star(light.pos_x + 250, 50, 1, 3, 4);
		star(light.pos_x + 330, 45, 1, 3, 4);
	}

	else
	{
		strokeWeight(2);
		stroke(0,150)
		fill(255, 250, 200, 200);
		beginShape();
		vertex(light.pos_x - 8, light.pos_y);
		vertex(light.pos_x + 8, light.pos_y)
		vertex(light.pos_x + 16, light.pos_y + 3)
		vertex(light.pos_x + 8, light.pos_y + 35)
		vertex(light.pos_x + 4, light.pos_y + 36)
		vertex(light.pos_x - 4, light.pos_y + 36)
		vertex(light.pos_x - 8, light.pos_y + 35)
		vertex(light.pos_x - 16, light.pos_y + 3)
		endShape(CLOSE);
		line(light.pos_x - 8, light.pos_y,light.pos_x - 4, light.pos_y + 34)
		line(light.pos_x + 8, light.pos_y,light.pos_x + 4, light.pos_y + 34)
		line(light.pos_x - 4, light.pos_y + 34, light.pos_x + 4, light.pos_y + 34)
		line(light.pos_x - 8, light.pos_y + 35, light.pos_x - 4, light.pos_y + 34)
		line(light.pos_x + 4, light.pos_y + 34, light.pos_x + 8, light.pos_y + 35)
	};
	pop();
};

function star(x, y, radius1, radius2, npoints)
{
	let angle = TWO_PI / npoints;
	let halfAngle = angle / 2.0;
	beginShape();
	for (let a = 0; a < TWO_PI; a += angle)
	{
	  let sx = x + cos(a) * radius2;
	  let sy = y + sin(a) * radius2;
	  vertex(sx, sy);
	  sx = x + cos(a + halfAngle) * radius1;
	  sy = y + sin(a + halfAngle) * radius1;
	  vertex(sx, sy);
	};
	endShape(CLOSE);
};

function checkLight()
{
	var d = abs(gameChar_world_x - light.pos_x);
	if(d < 15)
	{
		light.isReached = true;
	};
};

function checkPlayerDie()
{
	// if(gameChar_y >= height || isHit == true)
	if(gameChar_y >= height || (gameChar_y >= height && isHit == true))
	{
		lives -= 1;
		backgroundSound.stop();
		new_collectables = [];
		if(lives > 0)
		{
			new_collectables = collectables;
			startGame();
		}
		else
		{
			gameoverSound.loop();
		};
	};
};

function startGame()
{
	backgroundSound.loop();
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	startTime = 0;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isHit = false;

	sky_l = color(200, 200, 255);
	sky_d = color(90, 110, 255);

	// Initialise arrays of scenery objects.
	clouds = [
		{pos_x: 100, pos_y: 80, width: 130, height: 20},
		{pos_x: 500, pos_y: 50, width: 130, height: 20},
		{pos_x: 800, pos_y: 90, width: 130, height: 20},
		{pos_x: 1100, pos_y: 80, width: 130, height: 20},
		{pos_x: 1500, pos_y: 50, width: 130, height: 20},
		{pos_x: 1800, pos_y: 90, width: 130, height: 20},
		{pos_x: 2100, pos_y: 80, width: 130, height: 20},
		{pos_x: 2500, pos_y: 50, width: 130, height: 20},
		{pos_x: 2800, pos_y: 90, width: 130, height: 20},
		{pos_x: 3100, pos_y: 80, width: 130, height: 20},
		{pos_x: 3500, pos_y: 50, width: 130, height: 20},
		{pos_x: 3800, pos_y: 90, width: 130, height: 20}
	];

	mountains = [
		{pos_x: 0, width: 800, height: 300},
		{pos_x: 1800, width: 800, height: 300}
	];

	trees_x = [
		-300, -200, -100, 0, 100, 200, 
		400, 500, 600, 700, 800, 
		985, 1085,
		1300, 1400, 
		1600, 1700, 1800, 1900, 2000, 2100,
		2300, 2400, 2500, 2600,
		2800,
		3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000
	];

	petals = []
	for (var i = 0; i < trees_x.length; i++)
	{
		petals.push({pos_x: trees_x[i], pos_y: floorPos_y - 130});
	};

	cherrypetals = [];
	canyons = [
		{pos_x: 300, width: 85},
		{pos_x: 870, width: 85},
		{pos_x: 1180, width: 85},
		{pos_x: 1480, width: 85},
		{pos_x: 2180, width: 85},
		{pos_x: 2680, width: 85},
		{pos_x: 2880, width: 85}
	];

	if (new_collectables.length == 0)
	{
		collectables = [
		{pos_x: 100, pos_y: floorPos_y - 110, isFound: false},
		{pos_x: 200, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 390, pos_y: floorPos_y - 130, isFound: false},
		{pos_x: 600, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 800, pos_y: floorPos_y - 110, isFound: false},
		{pos_x: 1000, pos_y: floorPos_y - 90, isFound: false},
		{pos_x: 1050, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 1100, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 1300, pos_y: floorPos_y - 110, isFound: false},
		{pos_x: 1350, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 1600, pos_y: floorPos_y - 80, isFound: false},
		{pos_x: 1700, pos_y: floorPos_y - 70, isFound: false},
		{pos_x: 1800, pos_y: floorPos_y - 110, isFound: false},
		{pos_x: 2000, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 2300, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 2350, pos_y: floorPos_y - 70, isFound: false},
		{pos_x: 2500, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 2700, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 2800, pos_y: floorPos_y - 70, isFound: false},
		{pos_x: 2850, pos_y: floorPos_y - 140, isFound: false},
		{pos_x: 3000, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3050, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3100, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3150, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3200, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3250, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3300, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3350, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3400, pos_y: floorPos_y - 100, isFound: false},
		{pos_x: 3450, pos_y: floorPos_y - 100, isFound: false},
		];
	}

	else
	{
		collectables = new_collectables
	};

	enemy = [];
	for (var i = 1; i < canyons.length; i++)
	{
		var enemy_input;
		var random_y = random(0, 50)
		if(i == 1)
		{
			enemy_input = random(gameChar_x + 300, canyons[i].pos_x - 100);
		}
		else
		{
			enemy_input = random(canyons[i-1].pos_x + canyons[i-1].width, canyons[i].pos_x - 100);
		}
		enemy.push({pos_x: enemy_input, pos_y: floorPos_y - random_y ,shuriken_y: floorPos_y - random_y - 50, shurikenThrown: false, shurikenHit: false});
	};

	initLives = 3;
	if(lives == initLives)
	{
		game_score = 0;
	};
	light = {isReached: false, pos_x: 3500, pos_y: floorPos_y - 200};
}