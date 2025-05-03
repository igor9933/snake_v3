// Основные исправления:

// 1. В функции generateFood() была опечатка в имени функции isFoodOnSnake (было isFoodOnSnake)
// 2. В обработчике столкновений не хватало закрывающей скобки
// 3. Добавлена проверка на валидность уровня при выборе
// 4. Улучшена логика перехода между уровнями

// Вот исправленный код:

// В функции generateFood() исправлено:
do {
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
} while (isFoodOnSnake() || 
        (currentLevel === 2 && obstacles.some(obs => obs.x === food.x && obs.y === food.y)));

// В функции update() исправлена проверка столкновений:
if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize ||
    snake.some(segment => segment.x === head.x && segment.y === head.y) ||
    (currentLevel === 2 && obstacles.some(obs => obs.x === head.x && obs.y === head.y))) {
    gameOver();
    return;
}

// В функции resetGame() добавлена валидация уровня:
currentLevel = Math.min(2, Math.max(1, parseInt(levelSelect.value) || 1));

// В обработчике нажатия кнопки старта:
startButton.addEventListener('click', () => {
    if (!isGameRunning) {
        startScreen.style.display = 'none';
        isGameRunning = true;
        isPaused = false;
        resetGame();
        
        // Очищаем предыдущий интервал, если был
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        gameInterval = setInterval(gameLoop, gameSpeed);
        startButton.textContent = 'Заново';
        
        if (currentControls === 'touch' && 'ontouchstart' in window) {
            createMobileControls();
        } else {
            removeMobileControls();
        }
    } else {
        clearInterval(gameInterval);
        resetGame();
        isGameRunning = true;
        isPaused = false;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
});

// Полный исправленный код:

// Инициализация игры
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const restartPrompt = document.getElementById('restart-prompt');
const controlsSelect = document.getElementById('controls-select');
const levelSelect = document.getElementById('level-select');
const pauseOverlay = document.getElementById('pause-overlay');
const pauseText = document.getElementById('pause-text');

// Адаптация размера холста
function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight * 0.7);
    canvas.width = size;
    canvas.height = size;
    tileSize = canvas.width / gridSize;
}

// Параметры игры
const gridSize = 15;
let tileSize = canvas.width / gridSize;
let score = 0;
let gameSpeed = 150;
let gameInterval;
let isPaused = false;
let isGameRunning = false;
let currentControls = 'keyboard';
let currentLevel = 1;
let obstacles = [];

// Змейка/Дракон
let snake = [
    {x: 7, y: 7},
    {x: 6, y: 7},
    {x: 5, y: 7}
];

let direction = 'right';
let nextDirection = 'right';

// Еда
let food = {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
};

// Анимация поедания
let eatAnimation = {
    active: false,
    x: 0,
    y: 0,
    progress: 0,
    maxProgress: 10
};

// Генерация препятствий
function generateObstacles() {
    obstacles = [];
    const obstacleCount = 10;
    
    for (let i = 0; i < obstacleCount; i++) {
        let obstacle;
        do {
            obstacle = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
        } while (
            snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) ||
            (food.x === obstacle.x && food.y === obstacle.y)
        );
        
        obstacles.push(obstacle);
    }
}

// Проверка еды на змейке
function isFoodOnSnake() {
    return snake.some(segment => segment.x === food.x && segment.y === food.y);
}

// Генерация еды
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (isFoodOnSnake() || 
            (currentLevel === 2 && obstacles.some(obs => obs.x === food.x && obs.y === food.y)));
}

// Обновление анимации
function updateEatAnimation() {
    if (eatAnimation.active) {
        eatAnimation.progress++;
        if (eatAnimation.progress >= eatAnimation.maxProgress) {
            eatAnimation.active = false;
        }
    }
}

// Отрисовка дракона (остается без изменений)
// ... (код функций drawDragonHead и drawDragonBody)

// Отрисовка игры
function draw() {
    // Очистка
    ctx.fillStyle = currentLevel === 1 ? '#f9f9f9' : '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Сетка
    ctx.strokeStyle = currentLevel === 1 ? '#e7e8ec' : '#2a2a4a';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }
    
    // Препятствия
    if (currentLevel === 2) {
        ctx.fillStyle = '#5d3a1a';
        obstacles.forEach(obs => {
            ctx.beginPath();
            ctx.arc(
                obs.x * tileSize + tileSize / 2,
                obs.y * tileSize + tileSize / 2,
                tileSize / 2 - 1,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            ctx.fillStyle = '#3d2813';
            ctx.beginPath();
            ctx.arc(
                obs.x * tileSize + tileSize / 3,
                obs.y * tileSize + tileSize / 3,
                tileSize / 6,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(
                obs.x * tileSize + 2 * tileSize / 3,
                obs.y * tileSize + 2 * tileSize / 3,
                tileSize / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            ctx.fillStyle = '#5d3a1a';
        });
    }
    
    // Змейка/Дракон
    snake.forEach((segment, index) => {
        if (index === 0) {
            if (currentLevel === 1) {
                ctx.fillStyle = '#2a5885';
                ctx.fillRect(
                    segment.x * tileSize + 1,
                    segment.y * tileSize + 1,
                    tileSize - 2,
                    tileSize - 2
                );
                
                // Глаза
                ctx.fillStyle = 'white';
                const eyeSize = tileSize / 5;
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                // ... (код отрисовки глаз)
            } else {
                drawDragonHead(segment.x, segment.y, direction);
            }
        } else {
            if (currentLevel === 1) {
                ctx.fillStyle = '#4a76a8';
                ctx.fillRect(
                    segment.x * tileSize + 1,
                    segment.y * tileSize + 1,
                    tileSize - 2,
                    tileSize - 2
                );
            } else {
                drawDragonBody(segment.x, segment.y, index, snake.length);
            }
        }
    });
    
    // Еда
    if (!eatAnimation.active) {
        ctx.fillStyle = currentLevel === 1 ? '#e64646' : '#ffcc00';
        ctx.beginPath();
        ctx.arc(
            food.x * tileSize + tileSize / 2,
            food.y * tileSize + tileSize / 2,
            tileSize / 2 - 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        if (currentLevel === 2) {
            // Детали еды для уровня 2
        }
    }
    
    // Анимация поедания
    if (eatAnimation.active) {
        const size = (tileSize / 2) * (1 - eatAnimation.progress / eatAnimation.maxProgress);
        ctx.fillStyle = currentLevel === 1 ? '#ffcc00' : '#ff0000';
        ctx.beginPath();
        ctx.arc(
            eatAnimation.x * tileSize + tileSize / 2,
            eatAnimation.y * tileSize + tileSize / 2,
            size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// Обновление игры
function update() {
    updateEatAnimation();
    direction = nextDirection;
    
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }
    
    // Проверка столкновений
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize ||
        snake.some(segment => segment.x === head.x && segment.y === head.y) ||
        (currentLevel === 2 && obstacles.some(obs => obs.x === head.x && obs.y === head.y))) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        eatAnimation.active = true;
        eatAnimation.x = food.x;
        eatAnimation.y = food.y;
        eatAnimation.progress = 0;
        
        score += 10;
        scoreElement.textContent = `Счет: ${score} | Уровень: ${currentLevel}`;
        finalScore.textContent = `Ваш счет: ${score}`;
        
        // Переход на уровень 2
        if (levelSelect.value === '1' && score >= 200 && currentLevel === 1) {
            currentLevel = 2;
            generateObstacles();
            gameSpeed = 120;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
            pauseText.textContent = "Уровень 2! Вы превратились в дракона!";
            togglePause();
            setTimeout(togglePause, 2000);
        }
        
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
        
        generateFood();
    } else {
        snake.pop();
    }
}

// Игровой цикл
function gameLoop() {
    if (!isPaused) {
        update();
        draw();
    }
}

// Конец игры
function gameOver() {
    clearInterval(gameInterval);
    isGameRunning = false;
    finalScore.textContent = `Ваш счет: ${score}`;
    gameOverScreen.style.display = 'flex';
}

// Сброс игры
function resetGame() {
    snake = [
        {x: 7, y: 7},
        {x: 6, y: 7},
        {x: 5, y: 7}
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    currentLevel = Math.min(2, Math.max(1, parseInt(levelSelect.value) || 1));
    obstacles = [];
    
    if (currentLevel === 2) {
        generateObstacles();
        gameSpeed = 120;
    } else {
        gameSpeed = 150;
    }
    
    scoreElement.textContent = `Счет: ${score} | Уровень: ${currentLevel}`;
    finalScore.textContent = `Ваш счет: ${score}`;
    generateFood();
    gameOverScreen.style.display = 'none';
    eatAnimation.active = false;
}

// Остальные функции (управление и т.д.) остаются без изменений
// ... (код обработчиков событий и mainLoop)

// Первоначальная настройка
resizeCanvas();
draw();

// Основной цикл
function mainLoop() {
    if (gamepadConnected && currentControls === 'gamepad') {
        checkGamepad();
    }
    requestAnimationFrame(mainLoop);
}

mainLoop();