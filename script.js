// Escape Runner - Complete JavaScript Game Logic
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startGameBtn");
const playerNameInput = document.getElementById("playerNameInput");
const playerEmailInput = document.getElementById("playerEmailInput");
const playerPasswordInput = document.getElementById("playerPasswordInput");
const loginBtn = document.getElementById("loginBtn");
const createAccountBtn = document.getElementById("createAccountBtn");
const introScreen = document.getElementById("introScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const finalScoreEl = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const scoreList = document.getElementById("scoreList");
const menuStartBtn = document.getElementById("menuStartBtn");
const menuGlobalBtn = document.getElementById("menuGlobalBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const backToMenuGameOverBtn = document.getElementById("backToMenuGameOverBtn");
const mainMenu = document.getElementById("mainMenu");
const globalScoresScreen = document.getElementById("globalScoresScreen");
const loginMsg = document.getElementById("loginMsg");

let animationFrameId;
let score = 0;
let highScore = 0;
let gameRunning = false;
let playerName = "";
let paused = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 60,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 40,
    color: '#0f0',
    speed: 13, // سرعة المركبة أعلى
    dy: 0,
};

const obstacles = [];
const asteroids = [];
const meteorRadius = 22;
const asteroidRadius = 28;
let baseObstacleSpeed = 8; // سرعة البداية أعلى
let obstacleSpeed = baseObstacleSpeed;
let difficultyStep = 10;
let speedIncrement = 1.2;
let asteroidActive = false;
let asteroidDifficultyStep = 20; // كل كم نقطة تزيد عدد الكويكبات
let asteroidBaseSpeed = 7;
let asteroidSpeedIncrement = 1.1;

// شاشة البداية
menuStartBtn.addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    introScreen.classList.remove("hidden");
    playerNameInput.value = "";
    playerNameInput.focus();
});
menuGlobalBtn.addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    globalScoresScreen.classList.remove("hidden");
    updateGlobalScores();
});
backToMenuBtn.addEventListener("click", () => {
    globalScoresScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");
});
backToMenuGameOverBtn.addEventListener("click", () => {
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");
});

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

function drawAsteroid(x, y, r, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // جسم الكويكب: شكل غير منتظم + تدرج وظلال
    let points = [];
    let roughness = 0.25 + Math.random() * 0.15;
    for (let i = 0; i < 12; i++) {
        let ang = (Math.PI * 2 * i) / 12;
        let rad = r * (0.85 + Math.random() * roughness);
        points.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
    }
    let grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    grad.addColorStop(0, "#e7e7e7");
    grad.addColorStop(0.3, "#b2a98f");
    grad.addColorStop(0.7, "#6e5d4c");
    grad.addColorStop(1, "#3a2c1a");
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let pt of points) ctx.lineTo(pt.x, pt.y);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    // تفاصيل الصخور (حفر وظلال)
    for (let i = 0; i < 5; i++) {
        ctx.save();
        let ang = Math.PI * 2 * i / 5 + angle;
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.arc(r * (0.5 + Math.random() * 0.2), 0, 5 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fillStyle = "#4b3a2a";
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

function createAsteroid() {
    // بعد المستوى 50: الكويكبات لا تتبع اللاعب بل تتحرك في اتجاه واحد فقط (أفقي)
    let side = Math.random() < 0.5 ? 'top' : 'bottom';
    let x = canvas.width + Math.random() * 100;
    let y = side === 'top' ? 0 : canvas.height;
    let speed = asteroidBaseSpeed + Math.floor(score / asteroidDifficultyStep) * asteroidSpeedIncrement;
    // بعد المستوى 50: سرعة عشوائية والكويكب يتحرك أفقي فقط
    if (score >= 50) {
        speed = 5 + Math.random() * 8; // سرعة عشوائية بين 5 و 13
        asteroids.push({
            x, y, r: asteroidRadius, angle: 0, speed, fixedDirection: true, directionY: y === 0 ? 1 : -1
        });
    } else {
        asteroids.push({
            x, y, r: asteroidRadius, angle: 0, speed, fixedDirection: false
        });
    }
}

function updateObstacles() {
    for (let obs of obstacles) {
        obs.x -= obstacleSpeed;
    }
    while (obstacles.length && obstacles[0].x + (obstacles[0].radius * 2) < 0) {
        obstacles.shift();
        score++;
        scoreEl.textContent = 'Score: ' + score;
        if (score % difficultyStep === 0) {
            obstacleSpeed *= speedIncrement;
            if (obstacleSpeed > 18) obstacleSpeed = 18;
        }
        if (score >= 50) asteroidActive = true;
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = 'High Score: ' + highScore;
            localStorage.setItem("highScore_" + playerName, highScore);
        }
    }
    if (Math.random() < 0.03) createMeteor();
}

function updateAsteroids() {
    if (asteroidActive && Math.random() < 0.03 + score / 1000) createAsteroid();
    for (let ast of asteroids) {
        if (ast.fixedDirection) {
            // بعد المستوى 50: الكويكب يتحرك أفقي فقط مع انحراف بسيط لأعلى أو أسفل
            ast.x -= ast.speed;
            ast.y += ast.directionY * ast.speed * 0.15; // انحراف بسيط
            ast.angle = 0;
        } else {
            // قبل المستوى 50: تتبع اللاعب بدقة
            let targetX = player.x + player.width / 2;
            let targetY = player.y + player.height / 2;
            let dx = targetX - ast.x;
            let dy = targetY - ast.y;
            let angle = Math.atan2(dy, dx);
            ast.x += Math.cos(angle) * ast.speed;
            ast.y += Math.sin(angle) * ast.speed;
            ast.angle = angle;
            if (score > 100) ast.speed += 0.01;
        }
    }
    // حذف الكويكبات الخارجة من الشاشة
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (
            asteroids[i].x < -asteroidRadius ||
            asteroids[i].x > canvas.width + asteroidRadius ||
            asteroids[i].y < -asteroidRadius ||
            asteroids[i].y > canvas.height + asteroidRadius
        ) {
            asteroids.splice(i, 1);
        }
    }
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
    // تصادم الكويكبات
    for (let ast of asteroids) {
        let cx = ast.x, cy = ast.y, r = ast.r;
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
    for (let ast of asteroids) {
        drawAsteroid(ast.x, ast.y, ast.r, ast.angle);
    }
}

function update() {
    player.y += player.dy;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    updateObstacles();
    updateAsteroids();
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
    if (paused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    draw();
    if (gameRunning) animationFrameId = requestAnimationFrame(gameLoop);
}

function getPlayers() {
    return JSON.parse(localStorage.getItem("players") || "[]");
}
function savePlayers(players) {
    localStorage.setItem("players", JSON.stringify(players));
}
function setLastLogin(email) {
    document.cookie = `lastLogin=${email};max-age=3600;path=/`;
}
function getLastLogin() {
    let match = document.cookie.match(/lastLogin=([^;]+)/);
    return match ? match[1] : null;
}

function findPlayer(name, email) {
    let players = getPlayers();
    return players.find(p => p.name === name || p.email === email);
}

loginBtn.addEventListener("click", () => {
    let name = playerNameInput.value.trim();
    let email = playerEmailInput.value.trim().toLowerCase();
    let password = playerPasswordInput.value;
    let players = getPlayers();
    let player = players.find(p => p.name === name && p.email === email && p.password === password);
    if (player) {
        playerName = name;
        setLastLogin(email);
        loginMsg.textContent = "";
        introScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        gameRunning = true;
        resetGame();
        gameLoop();
    } else {
        loginMsg.textContent = "Invalid credentials!";
    }
});

createAccountBtn.addEventListener("click", () => {
    let name = playerNameInput.value.trim();
    let email = playerEmailInput.value.trim().toLowerCase();
    let password = playerPasswordInput.value;
    let players = getPlayers();
    if (players.find(p => p.name === name)) {
        loginMsg.textContent = "Name already exists!";
        return;
    }
    if (players.find(p => p.email === email)) {
        loginMsg.textContent = "Email already exists!";
        return;
    }
    if (!name || !email || !password) {
        loginMsg.textContent = "Please fill all fields!";
        return;
    }
    players.push({ name, email, password, lastLogin: Date.now() });
    savePlayers(players);
    playerName = name;
    setLastLogin(email);
    loginMsg.textContent = "";
    introScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    gameRunning = true;
    resetGame();
    gameLoop();
});

// عند فتح الموقع، دائماً تظهر القائمة الرئيسية حتى لو سجل دخول مؤخراً
window.onload = () => {
    mainMenu.classList.remove("hidden");
    introScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    globalScoresScreen.classList.add("hidden");
    let lastLoginEmail = getLastLogin();
    let players = getPlayers();
    let player = players.find(p => p.email === lastLoginEmail);
    if (player) {
        playerName = player.name;
        // لا تظهر شاشة تسجيل الدخول مرة أخرى، فقط عند الضغط على ستارت يبدأ اللعب فوراً
    }
    updateGlobalScores();
};

// زر Start Game من القائمة الرئيسية
menuStartBtn.addEventListener("click", () => {
    let lastLoginEmail = getLastLogin();
    let players = getPlayers();
    let player = players.find(p => p.email === lastLoginEmail);
    if (player) {
        // إذا سجل دخول مسبقاً، يبدأ اللعب فوراً
        playerName = player.name;
        mainMenu.classList.add("hidden");
        introScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        gameRunning = true;
        resetGame();
        gameLoop();
    } else {
        // إذا لم يسجل دخول، يظهر شاشة تسجيل الدخول
        mainMenu.classList.add("hidden");
        introScreen.classList.remove("hidden");
        playerNameInput.value = "";
        playerEmailInput.value = "";
        playerPasswordInput.value = "";
        playerNameInput.focus();
    }
});

function updateGlobalScores() {
    let scores = JSON.parse(localStorage.getItem("globalScores") || "[]");
    // تحديث سكور اللاعب إذا حقق نتيجة أعلى
    let found = false;
    for (let i = 0; i < scores.length; i++) {
        if (scores[i].name === playerName) {
            found = true;
            if (score > scores[i].score) scores[i].score = score;
        }
    }
    if (!found && score > 0) {
        scores.push({ name: playerName, score });
    }
    scores.sort((a, b) => b.score - a.score);
    // إزالة التكرار لنفس الاسم
    let uniqueScores = [];
    let names = new Set();
    for (let s of scores) {
        if (!names.has(s.name)) {
            uniqueScores.push(s);
            names.add(s.name);
        }
    }
    const top10 = uniqueScores.slice(0, 10);
    localStorage.setItem("globalScores", JSON.stringify(top10));
    scoreList.innerHTML = "";
    top10.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name}: ${s.score}`;
        scoreList.appendChild(li);
    });
}

// تحسين واقعية اللعبة: اهتزاز الشاشة عند التصادم
function shakeScreen() {
    gameScreen.style.transition = "transform 0.1s";
    gameScreen.style.transform = "translate(" + (Math.random() * 20 - 10) + "px," + (Math.random() * 20 - 10) + "px)";
    setTimeout(() => {
        gameScreen.style.transform = "";
    }, 150);
}

function endGame() {
    cancelAnimationFrame(animationFrameId);
    gameRunning = false;
    shakeScreen();
    finalScoreEl.textContent = 'Your Score: ' + score;
    gameOverScreen.classList.remove("hidden");
    updateGlobalScores();
}

function resetGame() {
    obstacles.length = 0;
    asteroids.length = 0;
    player.y = canvas.height / 2 - player.height / 2;
    player.dy = 0;
    score = 0;
    scoreEl.textContent = 'Score: 0';
    highScore = parseInt(localStorage.getItem("highScore_" + playerName)) || 0;
    highScoreEl.textContent = 'High Score: ' + highScore;
    gameOverScreen.classList.add("hidden");
    obstacleSpeed = baseObstacleSpeed;
    asteroidActive = false;
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

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (gameRunning) {
            paused = !paused;
            if (paused) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        }
        return;
    }
    if (!gameRunning || paused) return;
    if (e.key === "ArrowUp" || e.key === "w") {
        player.dy = -player.speed;
    } else if (e.key === "ArrowDown" || e.key === "s") {
        player.dy = player.speed;
    }
});

document.addEventListener("keyup", (e) => {
    if (!gameRunning || paused) return;
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
        player.dy = 0;
    }
});

restartBtn.addEventListener("click", () => {
    // إصلاح إعادة التشغيل بعد الجيم أوفر
    gameOverScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    gameRunning = true;
    resetGame();
    animationFrameId = requestAnimationFrame(gameLoop);
});
