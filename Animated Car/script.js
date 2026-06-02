// Speed levels: [track-seconds, wheel-seconds, bounce-seconds, km/h display]
const SPEEDS = [
    [22, 0.38, 0.65, 20],
    [17, 0.30, 0.55, 35],
    [13, 0.22, 0.40, 60],
    [9,  0.16, 0.28, 90],
    [6,  0.10, 0.18, 130],
    [4,  0.07, 0.12, 180],
];

let speedLevel = 2; // default index = 60 km/h
let isNight = false;

const track        = document.getElementById('track');
const trees        = document.getElementById('trees');
const leftWheel    = document.getElementById('leftWheel');
const rightWheel   = document.getElementById('rightWheel');
const car          = document.getElementById('car');
const speedDisplay = document.getElementById('speedDisplay');
const speedFill    = document.getElementById('speedFill');
const hornAudio    = new Audio('sound.mp3');

function applySpeed() {
    const [trackS, wheelS, bounceS, kmh] = SPEEDS[speedLevel];
    track.style.animationDuration      = trackS + 's';
    trees.style.animationDuration      = (trackS * 1.1) + 's';
    leftWheel.style.animationDuration  = wheelS + 's';
    rightWheel.style.animationDuration = wheelS + 's';
    car.style.animationDuration        = bounceS + 's';
    speedDisplay.textContent = kmh;
    speedFill.style.width = ((speedLevel + 1) / SPEEDS.length * 100) + '%';
    if (speedLevel <= 1)      speedDisplay.style.color = '#27ae60';
    else if (speedLevel <= 3) speedDisplay.style.color = '#f39c12';
    else                      speedDisplay.style.color = '#e74c3c';
}

function changeSpeed(dir) {
    speedLevel = Math.max(0, Math.min(SPEEDS.length - 1, speedLevel + dir));
    applySpeed();
}

function toggleNight() {
    isNight = !isNight;
    document.body.classList.toggle('night', isNight);
    const icon = document.getElementById('nightIcon');
    icon.className = isNight ? 'fas fa-sun' : 'fas fa-moon';
}

function honk() {
    hornAudio.currentTime = 0;
    hornAudio.play().catch(() => {});
}

document.getElementById('hornBtn').addEventListener('click', honk);

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp'   || e.key === '+') changeSpeed(1);
    if (e.code === 'ArrowDown' || e.key === '-') changeSpeed(-1);
    if (e.code === 'KeyN') toggleNight();
    if (e.code === 'KeyH' || e.code === 'Space') { e.preventDefault(); honk(); }
});

applySpeed();
