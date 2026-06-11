// ============================================================================
// SNAKE GAME
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let difficulty = 1;
let gameSpeed = 100;
let gameLoopInterval = null;
let foodPulse = 0;

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameStatusDisplay = document.getElementById('gameStatus');
const startBtn = document.getElementById('startBtn');
const levelDisplay = document.getElementById('level');

// Initialize high score display
highScoreDisplay.textContent = highScore;

// ============================================================================
// GAME CONTROLS
// ============================================================================

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
  const key = e.key.toLowerCase();

  // Arrow keys
  if (e.key === 'ArrowUp' && dy === 0) {
    nextDx = 0;
    nextDy = -1;
    e.preventDefault();
  }
  if (e.key === 'ArrowDown' && dy === 0) {
    nextDx = 0;
    nextDy = 1;
    e.preventDefault();
  }
  if (e.key === 'ArrowLeft' && dx === 0) {
    nextDx = -1;
    nextDy = 0;
    e.preventDefault();
  }
  if (e.key === 'ArrowRight' && dx === 0) {
    nextDx = 1;
    nextDy = 0;
    e.preventDefault();
  }

  // WASD keys
  if (key === 'w' && dy === 0) {
    nextDx = 0;
    nextDy = -1;
  }
  if (key === 's' && dy === 0) {
    nextDx = 0;
    nextDy = 1;
  }
  if (key === 'a' && dx === 0) {
    nextDx = -1;
    nextDy = 0;
  }
  if (key === 'd' && dx === 0) {
    nextDx = 1;
    nextDy = 0;
  }

  // Space to pause
  if (key === ' ') {
    e.preventDefault();
    togglePause();
  }
}

// ============================================================================
// GAME FUNCTIONS
// ============================================================================

function setDifficulty(level) {
  if (gameRunning) return;

  difficulty = level;
  const difficultyMap = {
    1: { speed: 100, color: '#10b981' },
    2: { speed: 70, color: '#f59e0b' },
    3: { speed: 40, color: '#ef4444' },
    4: { speed: 20, color: '#8b5cf6' },
  };

  gameSpeed = difficultyMap[level].speed;
  levelDisplay.textContent = level;

  // Update button styles
  document.querySelectorAll('.difficulty-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

function toggleGame() {
  if (!gameRunning) {
    startGame();
  } else {
    endGame();
  }
}

function togglePause() {
  if (gameRunning) {
    gamePaused = !gamePaused;
    gameStatusDisplay.textContent = gamePaused ? 'Paused' : 'Playing';
  }
}

function startGame() {
  gameRunning = true;
  gamePaused = false;
  gameStatusDisplay.textContent = 'Playing';
  startBtn.textContent = 'Pause Game';

  gameLoopInterval = setInterval(update, gameSpeed);
}

function endGame() {
  gameRunning = false;
  gamePaused = false;
  gameStatusDisplay.textContent = 'Paused';
  startBtn.textContent = 'Resume';
  clearInterval(gameLoopInterval);
}

function resetSnake() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  scoreDisplay.textContent = '0';
  gameStatusDisplay.textContent = 'Ready';
  gameRunning = false;
  gamePaused = false;
  startBtn.textContent = 'Start Game';
  clearInterval(gameLoopInterval);
  draw();
}

function generateFood() {
  let newFood;
  let foodOnSnake;

  do {
    foodOnSnake = false;
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    for (let segment of snake) {
      if (segment.x === newFood.x && segment.y === newFood.y) {
        foodOnSnake = true;
        break;
      }
    }
  } while (foodOnSnake);

  return newFood;
}

function update() {
  if (gamePaused) return;

  dx = nextDx;
  dy = nextDy;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Check self collision
  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10 * difficulty;
    scoreDisplay.textContent = score;
    food = generateFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameLoopInterval);
  gameStatusDisplay.textContent = 'Game Over';
  startBtn.textContent = 'Start Game';

  // Check and update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreDisplay.textContent = highScore;
    gameUtils.showNotification(`🎉 New High Score: ${score}!`, 'success');
  } else {
    gameUtils.showNotification(`Game Over! Score: ${score}`, 'success');
  }
}

function draw() {
  // Clear canvas with better gradient
  const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGradient.addColorStop(0, 'rgba(30, 35, 70, 0.8)');
  bgGradient.addColorStop(0.5, 'rgba(35, 45, 85, 0.8)');
  bgGradient.addColorStop(1, 'rgba(25, 30, 60, 0.8)');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid with better styling
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= tileCount; i++) {
    const coord = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(coord, 0);
    ctx.lineTo(coord, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, coord);
    ctx.lineTo(canvas.width, coord);
    ctx.stroke();
  }

  // Draw snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Head with glow effect
      ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
      ctx.shadowBlur = 15;
      
      const headGradient = ctx.createRadialGradient(
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        0,
        segment.x * gridSize + gridSize / 2,
        segment.y * gridSize + gridSize / 2,
        gridSize / 2
      );
      headGradient.addColorStop(0, 'rgba(0, 255, 200, 1)');
      headGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.9)');
      headGradient.addColorStop(1, 'rgba(131, 56, 236, 0.8)');
      ctx.fillStyle = headGradient;
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );

      // Draw eyes
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#000';
      const eyeSize = 2;
      const eyeOffsets = {
        0: { x1: 5, y1: 5, x2: 13, y2: 5 }, // up
        1: { x1: 13, y1: 5, x2: 13, y2: 13 }, // right
        2: { x1: 13, y1: 13, x2: 5, y2: 13 }, // down
        3: { x1: 5, y1: 13, x2: 5, y2: 5 }, // left
      };
      
      let direction = 0;
      if (dx === 0 && dy === -1) direction = 0;
      else if (dx === 1 && dy === 0) direction = 1;
      else if (dx === 0 && dy === 1) direction = 2;
      else if (dx === -1 && dy === 0) direction = 3;
      
      const eyes = eyeOffsets[direction];
      ctx.beginPath();
      ctx.arc(segment.x * gridSize + eyes.x1, segment.y * gridSize + eyes.y1, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(segment.x * gridSize + eyes.x2, segment.y * gridSize + eyes.y2, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Body segments with gradient
      const bodyGradient = ctx.createLinearGradient(
        segment.x * gridSize,
        segment.y * gridSize,
        segment.x * gridSize + gridSize,
        segment.y * gridSize + gridSize
      );
      const fadeAlpha = 0.8 - (index / snake.length) * 0.5;
      bodyGradient.addColorStop(0, `rgba(0, 212, 255, ${fadeAlpha})`);
      bodyGradient.addColorStop(1, `rgba(131, 56, 236, ${fadeAlpha * 0.6})`);
      ctx.fillStyle = bodyGradient;
      
      ctx.shadowColor = `rgba(0, 212, 255, ${fadeAlpha * 0.4})`;
      ctx.shadowBlur = 8;
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );
    }

    // Draw segment border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });

  // Draw food with pulsing animation
  foodPulse += 0.05;
  const foodSize = gridSize - 4 + Math.sin(foodPulse) * 2;
  
  const foodGradient = ctx.createRadialGradient(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    0,
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    foodSize / 2
  );
  foodGradient.addColorStop(0, 'rgba(255, 100, 150, 1)');
  foodGradient.addColorStop(0.5, 'rgba(255, 50, 110, 0.9)');
  foodGradient.addColorStop(1, 'rgba(255, 0, 110, 0.7)');
  
  ctx.shadowColor = 'rgba(255, 0, 110, 0.8)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = foodGradient;
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    foodSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // Food highlight
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2 - 2,
    food.y * gridSize + gridSize / 2 - 2,
    foodSize / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Initial draw
draw();

