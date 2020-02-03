var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';
var CANDY = 'CANDY';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GAMER_GLUE_IMG = '<img src="img/gamer-purple.png" />';
var CANDY_IMG = '<img src="img/candy.png" />';

const BALLS_NUM = 10;
var gBoard;
var gGamerPos;

var ballsCollected = 0;
var ballsInGame = 2;
var gAddBallInterval;
var gAddGlueInterval;
var gIsOnHold = false;

var collectSound = new Audio('collect.mp3');

function initGame() {
	gIsOnHold = false;
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	addRandomGlue();
	gAddBallInterval = setInterval(addRandomBall, 5000);
}

function buildBoard() {
	// Create the Matrix
	// var board = createMat(10, 12)
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
				if (i === 5 && j === 0) cell.type = FLOOR;
				if (i === 4 && j === 11) cell.type = FLOOR;
				if (i === 0 && j === 6) cell.type = FLOOR;
				if (i === 9 && j === 4) cell.type = FLOOR;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}
// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//Change To ES6 template string
			strHTML += `\t<td class="cell ${cellClass}"
			 onclick="moveTo( ${i}, ${j})" >\n`;

			// change to short if statement
			if (currCell.gameElement === GAMER) strHTML += GAMER_IMG;
			else if (currCell.gameElement === BALL) strHTML += BALL_IMG;


			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}
// Move the player to a specific location
function moveTo(i, j) {
	if (gIsOnHold) return;
	if (isGameOver()) return;
	var targetCell = gBoard[i][j];

	if (targetCell.type === WALL) return;



	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	if (i === 5 && j === 0 || i === 4 && j === 11 || i === 0 && j === 6 || i === 9 && j === 4) {
		iAbsDiff = 1;
		jAbsDiff = 0;
	}
	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			console.log('Collecting!');
			ballsCollected++;
			document.querySelector('.balls-count span').innerHTML = ballsCollected;
			ballsInGame--;
			collectSound.play();
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;

		if (targetCell.gameElement === CANDY) {
			gBoard[i][j].gameElement = GLUE;
			renderCell(gGamerPos, GAMER_GLUE_IMG);
			gIsOnHold = true;
			setTimeout(function () {
				gBoard[i][j].gameElement = GAMER;
				renderCell(gGamerPos, GAMER_IMG);
				gIsOnHold = false;
			}, 3000);
			return;
		}

		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);


	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}
// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}
// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			if (i === 5 && j === 0) {
				moveTo(4, 11);
			} else {
				moveTo(i, j - 1);
			}
			break;
		case 'ArrowRight':
			if (i === 4 && j === 11) {
				moveTo(5, 0);
			} else {
				moveTo(i, j + 1);
			}
			break;
		case 'ArrowUp':
			if (i === 0 && j === 6) {
				moveTo(9, 4);
			} else {
				moveTo(i - 1, j);
			}
			break;
		case 'ArrowDown':
			if (i === 9 && j === 4) {
				moveTo(0, 6);
			} else {
				moveTo(i + 1, j);
			}
			break;
	}

}
// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function addRandomBall() {
	var i = getRandomInt(1, 9);
	var j = getRandomInt(1, 11);
	if (!gBoard[i][j].gameElement) {
		gBoard[i][j].gameElement = BALL;
		var elCell = document.querySelector(`.cell-${i}-${j}`);
		elCell.innerHTML = BALL_IMG;
		ballsInGame++;
	} else {
		addRandomBall();
	}
}

function addRandomGlue() {
	var i = getRandomInt(1, 9);
	var j = getRandomInt(1, 11);

	gAddGlueInterval = setInterval(function () {
		var randCell = gBoard[i][j];
		if (randCell.gameElement === null) {
			randCell.gameElement = CANDY;
			renderCell({ i: i, j: j }, CANDY_IMG);
			setTimeout(function () {
				if (randCell.gameElement === 'CANDY') {
					randCell.gameElement = null;
					renderCell({ i: i, j: j }, '');
				}
			}, 3000);
		} 
	}, 5000);
}

function isGameOver() {
	var elBtn = document.querySelector('.reset-btn');
	if (ballsInGame === 0) {
		elBtn.style.display = 'block';
		clearInterval(gAddBallInterval);
		clearInterval(gAddGlueInterval);
		return true;
	}
	return false;
}

function resetGame() {
	var elBtn = document.querySelector('.reset-btn');
	elBtn.style.display = 'none';
	document.querySelector('.balls-count span').innerHTML = ballsCollected = 0;
	initGame();
	ballsInGame = 2;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function wait(ms) {
	console.log('wait wait wait');
	var d = new Date();
	var d2 = null;
	do { d2 = new Date(); }
	while (d2 - d < ms);
}
