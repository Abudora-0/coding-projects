// ─── State ───────────────────────────────────────────────────────────────────
let score = 0;
let hiScore = parseInt(localStorage.getItem('dinoHiScore') || '0');
let gameRunning = false;
let canJump = true;
let crossedObstacle = true;
let obstacleSpeed = 4;          // seconds for one full pass (decreases = faster)
let collisionInterval = null;
let scoreInterval = null;

// ─── Audio ───────────────────────────────────────────────────────────────────
const bgMusic    = new Audio('music.mp3');
const gameOverSfx = new Audio('gameover.mp3');
bgMusic.loop = true;

// ─── DOM refs ────────────────────────────────────────────────────────────────
const dino           = document.getElementById('dino');
const obstacle       = document.getElementById('obstacle');
const startScreen    = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreVal       = document.getElementById('scoreVal');
const finalScore     = document.getElementById('finalScore');
const finalBest      = document.getElementById('finalBest');
const hiScoreNav     = document.getElementById('hiScoreNav');

// Init hi-score display
hiScoreNav.textContent = hiScore;

// ─── Start ───────────────────────────────────────────────────────────────────
function startGame() {
    startScreen.classList.add('hidden');
    resetGameVars();
    launchGame();
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    resetGameVars();
    launchGame();
}

function resetGameVars() {
    score = 0;
    obstacleSpeed = 4;
    crossedObstacle = true;
    canJump = true;
    scoreVal.textContent = '0';

    // Reset obstacle animation
    obstacle.classList.remove('obstacleRunning');
    obstacle.style.removeProperty('--obstacle-speed');
    // Force reflow so animation restarts cleanly
    void obstacle.offsetWidth;
}

function launchGame() {
    gameRunning = true;

    // Start obstacle
    obstacle.style.setProperty('--obstacle-speed', obstacleSpeed + 's');
    obstacle.classList.add('obstacleRunning');

    // Start music
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {}); // graceful fail on autoplay block

    // Score ticker: +1 every 600ms
    scoreInterval = setInterval(() => {
        if (!gameRunning) return;
        score++;
        scoreVal.textContent = score;

        // Speed up every 10 points
        if (score % 10 === 0) {
            obstacleSpeed = Math.max(1.2, obstacleSpeed - 0.2);
            setObstacleSpeed(obstacleSpeed);
        }
    }, 600);

    // Collision detection: 60fps-ish
    collisionInterval = setInterval(checkCollision, 16);
}

// ─── Obstacle speed ──────────────────────────────────────────────────────────
function setObstacleSpeed(speed) {
    // Restart animation with new duration without visual glitch
    const currentLeft = obstacle.getBoundingClientRect().left;
    obstacle.classList.remove('obstacleRunning');
    obstacle.style.setProperty('--obstacle-speed', speed + 's');
    void obstacle.offsetWidth;
    obstacle.classList.add('obstacleRunning');
}

// ─── Jump ────────────────────────────────────────────────────────────────────
function jump() {
    if (!gameRunning || !canJump) return;
    canJump = false;
    dino.classList.add('animateDino');
    setTimeout(() => {
        dino.classList.remove('animateDino');
        canJump = true;
    }, 620);
}

// ─── Move left/right ─────────────────────────────────────────────────────────
function moveDino(dir) {
    if (!gameRunning) return;
    const current = parseInt(window.getComputedStyle(dino).left);
    const newPos = Math.max(0, Math.min(window.innerWidth - 220, current + dir * 100));
    dino.style.left = newPos + 'px';
}

// ─── Collision ───────────────────────────────────────────────────────────────
function checkCollision() {
    const dr = dino.getBoundingClientRect();
    const or = obstacle.getBoundingClientRect();

    // Shrink hitbox by 20% on each side for fairness
    const margin = 0.2;
    const dHit = {
        left:   dr.left   + dr.width  * margin,
        right:  dr.right  - dr.width  * margin,
        top:    dr.top    + dr.height * margin,
        bottom: dr.bottom - dr.height * margin,
    };
    const oHit = {
        left:   or.left   + or.width  * margin,
        right:  or.right  - or.width  * margin,
        top:    or.top    + or.height * margin,
        bottom: or.bottom - or.height * margin,
    };

    const hit = dHit.right > oHit.left &&
                dHit.left  < oHit.right &&
                dHit.bottom > oHit.top &&
                dHit.top   < oHit.bottom;

    if (hit) {
        triggerGameOver();
    }
}

// ─── Game Over ───────────────────────────────────────────────────────────────
function triggerGameOver() {
    gameRunning = false;
    clearInterval(collisionInterval);
    clearInterval(scoreInterval);

    bgMusic.pause();
    gameOverSfx.play().catch(() => {});

    // Stop obstacle
    obstacle.classList.remove('obstacleRunning');

    // Update hi score
    if (score > hiScore) {
        hiScore = score;
        localStorage.setItem('dinoHiScore', hiScore);
        hiScoreNav.textContent = hiScore;
    }

    finalScore.textContent = score;
    finalBest.textContent = hiScore;
    gameOverScreen.classList.remove('hidden');
}

// ─── Input ───────────────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp' || e.code === 'Space') { e.preventDefault(); jump(); }
    if (e.code === 'ArrowLeft')  moveDino(-1);
    if (e.code === 'ArrowRight') moveDino(1);
});

// Mobile touch support
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 30) jump();           // tap = jump
    else if (dx < -30) moveDino(-1);         // swipe left
    else if (dx > 30)  moveDino(1);          // swipe right
});
