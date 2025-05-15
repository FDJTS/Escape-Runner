
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');

let animationFrameId;
let score = 0;
let gameRunning = false;

const player = {
    x: 50,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: '#0f0',
    speed: 5,
    dy: 0,
};

const obstacles = [];
const obstacleWidth = 20;
const obstacleGap = 150;
const obstacleSpeed = 3;

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    if (e.key === 'ArrowUp') {
        player.dy = -player.speed;
    } else if (e.key === 'ArrowDown') {
        player.dy = player.speed;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        player.dy = 0;
    }
});

function createObstacle() {
    const y = Math.random() * (canvas.height - obstacleGap);
    obstacles.push({ x: canvas.width, y: 0, width: obstacleWidth, height: y });
    obstacles.push({ x: canvas.width, y: y + obstacleGap, width: obstacleWidth, height: canvas.height - (y + obstacleGap) });
}

function update() {
    player.y += player.dy;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    obstacles.forEach((obs) => {
        obs.x -= obstacleSpeed;
    });

    if (obstacles.length && obstacles[0].x + obstacleWidth < 0) {
        obstacles.splice(0, 2);
        score++;
        scoreEl.textContent = 'Score: ' + score;
    }

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
        createObstacle();
    }

    for (let obs of obstacles) {
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            gameOver();
            break;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#f00';
    obstacles.forEach((obs) => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

function loop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(loop);
}

function gameOver() {
    cancelAnimationFrame(animationFrameId);
    gameRunning = false;
    alert('Game Over! Your score: ' + score);
    resetGame();
}

function resetGame() {
    score = 0;
    scoreEl.textContent = 'Score: ' + score;
    obstacles.length = 0;
    player.y = canvas.height / 2 - player.height / 2;
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        resetGame();
        loop();
    }
});
