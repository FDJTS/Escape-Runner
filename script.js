// Escape Runner - Complete JavaScript Game Logic
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startGameBtn");
const playerNameInput = document.getElementById("playerNameInput");
const introScreen = document.getElementById("introScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const finalScoreEl = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const scoreList = document.getElementById("scoreList");

let animationFrameId;
let score = 0;
let highScore = 0;
let gameRunning = false;
let playerName = "";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 60,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 40,
    color: '#0f0',
    speed: 6,
    dy: 0,
};

const obstacles = [];
const meteorRadius = 22;
let baseObstacleSpeed = 3; // سرعة البداية
let obstacleSpeed = baseObstacleSpeed;
let difficultyStep = 10; // كل كم نقطة تزيد الصعوبة
let speedIncrement = 1.2; // مقدار زيادة السرعة

function drawSpaceBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#000011");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }
}

function drawMeteor(x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    // جسم النيزك بتدرج وظلال
    let grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    grad.addColorStop(0, "#fffbe0");
    grad.addColorStop(0.3, "#e6a14a");
    grad.addColorStop(0.7, "#a0522d");
    grad.addColorStop(1, "#3e1f0f");
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = "#ffb300";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // حفر النيزك
    for (let i = 0; i < 5; i++) {
        ctx.save();
        let ang = Math.PI * 2 * i / 5;
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.arc(r * 0.6, 0, 6 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fillStyle = "#7a4b1a";
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    ctx.restore();
}

function createMeteor() {
    const meteorY = Math.random() * (canvas.height - meteorRadius * 2) + meteorRadius;
    obstacles.push({
        type: 'meteor',
        x: canvas.width + Math.random() * 200,
        y: meteorY,
        radius: meteorRadius
    });
}

function updateObstacles() {
    for (let obs of obstacles) {
        obs.x -= obstacleSpeed;
    }
    while (obstacles.length && obstacles[0].x + (obstacles[0].radius * 2) < 0) {
        obstacles.shift();
        score++;
        scoreEl.textContent = 'Score: ' + score;
        // زيادة الصعوبة تدريجياً
        if (score % difficultyStep === 0) {
            obstacleSpeed *= speedIncrement;
            if (obstacleSpeed > 18) obstacleSpeed = 18; // حد أقصى للسرعة
        }
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = 'High Score: ' + highScore;
            localStorage.setItem("highScore_" + playerName, highScore);
        }
    }
    if (Math.random() < 0.02) createMeteor();
}

function checkCollisions() {
    for (let obs of obstacles) {
        let cx = obs.x, cy = obs.y, r = obs.radius;
        let closestX = Math.max(player.x, Math.min(cx, player.x + player.width));
        let closestY = Math.max(player.y, Math.min(cy, player.y + player.height));
        let dx = cx - closestX;
        let dy = cy - closestY;
        if (dx * dx + dy * dy < r * r) {
            endGame();
            break;
        }
    }
}

function draw() {
    drawSpaceBackground();
    player.draw();
    for (let obs of obstacles) {
        drawMeteor(obs.x, obs.y, obs.radius);
    }
}

function update() {
    player.y += player.dy;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    updateObstacles();
    checkCollisions();
}

player.draw = function() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(Math.PI / 2); // صاروخ بالعرض
    // جسم الصاروخ
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#eee";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // رأس الصاروخ
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(-10, -10);
    ctx.lineTo(10, -10);
    ctx.closePath();
    ctx.fillStyle = "#f00";
    ctx.fill();
    // نافذة
    ctx.beginPath();
    ctx.arc(0, -10, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#00eaff";
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    // أجنحة جانبية
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(-14, 6);
    ctx.lineTo(-28, 18);
    ctx.lineTo(-4, 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, 6);
    ctx.lineTo(28, 18);
    ctx.lineTo(4, 14);
    ctx.closePath();
    ctx.fill();
    // نار متحركة
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.lineTo(-7, 40 + Math.random() * 8);
    ctx.lineTo(0, 36 + Math.random() * 8);
    ctx.lineTo(7, 40 + Math.random() * 8);
    ctx.closePath();
    let fireGrad = ctx.createLinearGradient(0, 28, 0, 48);
    fireGrad.addColorStop(0, "#fff");
    fireGrad.addColorStop(0.5, "#ff0");
    fireGrad.addColorStop(1, "#f80");
    ctx.fillStyle = fireGrad;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.restore();
    ctx.restore();
};

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    draw();
    if (gameRunning) animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    cancelAnimationFrame(animationFrameId);
    gameRunning = false;
    finalScoreEl.textContent = 'Your Score: ' + score;
    gameOverScreen.classList.remove("hidden");
    updateGlobalScores();
}

function resetGame() {
    obstacles.length = 0;
    player.y = canvas.height / 2 - player.height / 2;
    player.dy = 0;
    score = 0;
    scoreEl.textContent = 'Score: 0';
    highScore = parseInt(localStorage.getItem("highScore_" + playerName)) || 0;
    highScoreEl.textContent = 'High Score: ' + highScore;
    gameOverScreen.classList.add("hidden");
    obstacleSpeed = baseObstacleSpeed; // إعادة السرعة للبداية
}

function startGame() {
    playerName = playerNameInput.value.trim() || "Player";
    localStorage.setItem("playerName", playerName);
    resetGame();
    introScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    gameRunning = true;
    gameLoop();
}

function updateGlobalScores() {
    const scores = JSON.parse(localStorage.getItem("globalScores") || "[]");
    scores.push({ name: playerName, score });
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem("globalScores", JSON.stringify(top10));
    scoreList.innerHTML = "";
    top10.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name}: ${s.score}`;
        scoreList.appendChild(li);
    });
}

window.onload = () => {
    const savedName = localStorage.getItem("playerName");
    if (savedName) playerNameInput.value = savedName;
    updateGlobalScores();
};

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
    resetGame();
    gameRunning = true;
    gameLoop();
});

document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    if (e.key === "ArrowUp" || e.key === "w") {
        player.dy = -player.speed;
    } else if (e.key === "ArrowDown" || e.key === "s") {
        player.dy = player.speed;
    }
});

document.addEventListener("keyup", (e) => {
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
        player.dy = 0;
    }
});
