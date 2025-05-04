// Инициализация игры
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const startButtonMain = document.getElementById('start-btn-main');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const resumeButton = document.getElementById('resume-btn');
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const restartPrompt = document.getElementById('restart-prompt');
const controlsSelect = document.getElementById('controls-select');
const levelSelect = document.getElementById('level-select');
const pauseOverlay = document.getElementById('pause-overlay');
const pauseText = document.getElementById('pause-text');
const mobileControls = document.getElementById('mobile-controls');

// Мобильные кнопки
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

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
let gamepadConnected = false;

// Дракон
let dragon = [
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 }
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
    const obstacleCount = currentLevel === 2 ? 10 : 0;

    for (let i = 0; i < obstacleCount; i++) {
        let obstacle;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!validPosition && attempts < maxAttempts) {
            obstacle = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
            
            const onDragon = dragon.some(segment => segment.x === obstacle.x && segment.y === obstacle.y);
            const onFood = (food.x === obstacle.x && food.y === obstacle.y);
            const onOtherObstacle = obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y);
            
            validPosition = !onDragon && !onFood && !onOtherObstacle;
            attempts++;
        }

        if (validPosition) {
            obstacles.push(obstacle);
        }
    }
}

// Проверка еды на драконе
function isFoodOnDragon() {
    return dragon.some(segment => segment.x === food.x && segment.y === food.y);
}

// Генерация еды
function generateFood() {
    let attempts = 0;
    const maxAttempts = 100;

    do {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        attempts++;

        if (attempts >= maxAttempts) {
            // Если не удалось найти свободное место, ищем вручную
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const cellFree = !dragon.some(s => s.x === x && s.y === y) &&
                        !(currentLevel === 2 && obstacles.some(o => o.x === x && o.y === y));
                    if (cellFree) {
                        food = { x, y };
                        return;
                    }
                }
            }
            break;
        }
    } while (isFoodOnDragon() ||
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

// Рисуем голову дракона
function drawDragonHead(x, y) {
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;
    const size = tileSize / 2 - 1;
    
    // Основная голова
    ctx.fillStyle = currentLevel === 1 ? '#4a148c' : '#6a1b9a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза
    ctx.fillStyle = '#fff';
    let eyeOffsetX = 0;
    let eyeOffsetY = -size / 3;
    
    if (direction === 'right') eyeOffsetX = size / 3;
    else if (direction === 'left') eyeOffsetX = -size / 3;
    else if (direction === 'up') eyeOffsetY = -size / 3;
    else if (direction === 'down') eyeOffsetY = size / 3;
    
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, size / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Зрачки
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, size / 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Рот (только если смотрит вправо/влево)
    if (direction === 'right' || direction === 'left') {
        ctx.strokeStyle = '#ff5252';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0.2 * Math.PI, 0.8 * Math.PI, direction === 'left');
        ctx.stroke();
    }
}

// Рисуем тело дракона
function drawDragonBody(x, y, index) {
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;
    const size = tileSize / 2 - 1;
    
    // Чешуя дракона
    const hue = (index * 10) % 360;
    ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Детали чешуи
    ctx.strokeStyle = `hsl(${hue}, 80%, 30%)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.stroke();
    
    // Штрихи на чешуе
    for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * size * 0.7,
            centerY + Math.sin(angle) * size * 0.7
        );
        ctx.stroke();
    }
}

// Рисуем хвост дракона
function drawDragonTail(x, y) {
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;
    const size = tileSize / 2 - 1;
    
    ctx.fillStyle = currentLevel === 1 ? '#7b1fa2' : '#9c27b0';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Кончик хвоста
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

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
            
            // Текстура камней
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const length = tileSize / 3;
                ctx.beginPath();
                ctx.moveTo(
                    obs.x * tileSize + tileSize / 2,
                    obs.y * tileSize + tileSize / 2
                );
                ctx.lineTo(
                    obs.x * tileSize + tileSize / 2 + Math.cos(angle) * length,
                    obs.y * tileSize + tileSize / 2 + Math.sin(angle) * length
                );
                ctx.stroke();
            }
        });
    }

    // Дракон
    dragon.forEach((segment, index) => {
        if (index === 0) {
            // Голова
            drawDragonHead(segment.x, segment.y);
        } else if (index === dragon.length - 1) {
            // Хвост
            drawDragonTail(segment.x, segment.y);
        } else {
            // Тело
            drawDragonBody(segment.x, segment.y, index);
        }
    });

    // Еда (драгоценный камень)
    if (!eatAnimation.active) {
        const centerX = food.x * tileSize + tileSize / 2;
        const centerY = food.y * tileSize + tileSize / 2;
        const size = tileSize / 2 - 1;
        
        // Градиент для драгоценного камня
        const gradient = ctx.createRadialGradient(
            centerX - size/3, centerY - size/3, size/4,
            centerX, centerY, size
        );
        gradient.addColorStop(0, currentLevel === 1 ? '#ff5252' : '#ffeb3b');
        gradient.addColorStop(1, currentLevel === 1 ? '#d50000' : '#ff9800');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Форма драгоценного камня
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX + size * 0.7, centerY - size * 0.3);
        ctx.lineTo(centerX + size * 0.5, centerY + size * 0.8);
        ctx.lineTo(centerX - size * 0.5, centerY + size * 0.8);
        ctx.lineTo(centerX - size * 0.7, centerY - size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Блики
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size * 0.7);
        ctx.lineTo(centerX + size * 0.3, centerY - size * 0.5);
        ctx.lineTo(centerX + size * 0.2, centerY - size * 0.2);
        ctx.lineTo(centerX - size * 0.2, centerY - size * 0.4);
        ctx.closePath();
        ctx.fill();
    }

    // Анимация поедания
    if (eatAnimation.active) {
        const size = (tileSize / 2) * (1 - eatAnimation.progress / eatAnimation.maxProgress);
        ctx.fillStyle = currentLevel === 1 ? 'rgba(255, 235, 59, 0.7)' : 'rgba(255, 0, 0, 0.7)';
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

    const head = { x: dragon[0].x, y: dragon[0].y };

    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }

    // Проверка столкновений
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize ||
        dragon.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y) ||
        (currentLevel === 2 && obstacles.some(obs => obs.x === head.x && obs.y === head.y))) {
        gameOver();
        return;
    }

    dragon.unshift(head);

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
        }

        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }

        generateFood();
    } else {
        dragon.pop();
    }
}

// Игровой цикл
function gameLoop() {
    if (!isPaused && isGameRunning) {
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
    dragon = [
        { x: 7, y: 7 },
        { x: 6, y: 7 },
        { x: 5, y: 7 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    currentLevel = parseInt(levelSelect.value) || 1;
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

// Пауза
function togglePause() {
    if (!isGameRunning) return;
    
    isPaused = !isPaused;
    pauseOverlay.style.display = isPaused ? 'flex' : 'none';
}

// Обработка клавиатуры
function handleKeyDown(e) {
    if (gameOverScreen.style.display === 'flex' && e.code === 'Space') {
        restartButton.click();
        return;
    }

    if (!isGameRunning || isPaused) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
        case 'Escape':
            togglePause();
            break;
    }
}

// Обработка геймпада
function checkGamepad() {
    const gamepads = navigator.getGamepads();
    if (!gamepads[0]) return;

    const gamepad = gamepads[0];

    // Проверка осей (джойстик)
    const axisX = gamepad.axes[0];
    const axisY = gamepad.axes[1];

    // Определяем направление по осям
    if (Math.abs(axisX) > Math.abs(axisY)) {
        if (axisX > 0.5 && direction !== 'left') nextDirection = 'right';
        else if (axisX < -0.5 && direction !== 'right') nextDirection = 'left';
    } else {
        if (axisY > 0.5 && direction !== 'up') nextDirection = 'down';
        else if (axisY < -0.5 && direction !== 'down') nextDirection = 'up';
    }

    // Проверка кнопок (крестовина)
    if (gamepad.buttons[12]?.pressed && direction !== 'down') nextDirection = 'up';
    if (gamepad.buttons[13]?.pressed && direction !== 'up') nextDirection = 'down';
    if (gamepad.buttons[14]?.pressed && direction !== 'right') nextDirection = 'left';
    if (gamepad.buttons[15]?.pressed && direction !== 'left') nextDirection = 'right';

    // Кнопка START для рестарта
    if (gameOverScreen.style.display === 'flex' && (gamepad.buttons[9]?.pressed || gamepad.buttons[7]?.pressed)) {
        restartButton.click();
    }

    // Кнопка A или START для паузы
    if (gamepad.buttons[0]?.pressed || gamepad.buttons[9]?.pressed) {
        togglePause();
    }
}

// Создание мобильного управления
function createMobileControls() {
    if (currentControls !== 'touch') return;
    
    mobileControls.style.display = 'block';

    // Удаляем старые обработчики перед добавлением новых
    upBtn.removeEventListener('touchstart', handleUp);
    downBtn.removeEventListener('touchstart', handleDown);
    leftBtn.removeEventListener('touchstart', handleLeft);
    rightBtn.removeEventListener('touchstart', handleRight);
    upBtn.removeEventListener('mousedown', handleUp);
    downBtn.removeEventListener('mousedown', handleDown);
    leftBtn.removeEventListener('mousedown', handleLeft);
    rightBtn.removeEventListener('mousedown', handleRight);

    function handleUp() {
        if (direction !== 'down') nextDirection = 'up';
    }

    function handleDown() {
        if (direction !== 'up') nextDirection = 'down';
    }

    function handleLeft() {
        if (direction !== 'right') nextDirection = 'left';
    }

    function handleRight() {
        if (direction !== 'left') nextDirection = 'right';
    }

    // Добавляем новые обработчики
    upBtn.addEventListener('touchstart', handleUp, { passive: true });
    downBtn.addEventListener('touchstart', handleDown, { passive: true });
    leftBtn.addEventListener('touchstart', handleLeft, { passive: true });
    rightBtn.addEventListener('touchstart', handleRight, { passive: true });
    upBtn.addEventListener('mousedown', handleUp);
    downBtn.addEventListener('mousedown', handleDown);
    leftBtn.addEventListener('mousedown', handleLeft);
    rightBtn.addEventListener('mousedown', handleRight);
}

// Удаление мобильного управления
function removeMobileControls() {
    mobileControls.style.display = 'none';
}

// Обработчики событий
document.addEventListener('keydown', handleKeyDown);

window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad.id);
    gamepadConnected = true;
});

window.addEventListener('gamepaddisconnected', (e) => {
    console.log('Gamepad disconnected:', e.gamepad.id);
    gamepadConnected = false;
});

controlsSelect.addEventListener('change', () => {
    currentControls = controlsSelect.value;

    if (currentControls === 'touch' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        createMobileControls();
    } else {
        removeMobileControls();
    }
});

startButton.addEventListener('click', () => {
    if (!isGameRunning) {
        startScreen.style.display = 'none';
        isGameRunning = true;
        isPaused = false;
        resetGame();

        if (gameInterval) {
            clearInterval(gameInterval);
        }

        gameInterval = setInterval(gameLoop, gameSpeed);
        startButton.textContent = 'Заново';

        if (currentControls === 'touch' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
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

startButtonMain.addEventListener('click', () => {
    startScreen.style.display = 'none';
    isGameRunning = true;
    isPaused = false;
    resetGame();

    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(gameLoop, gameSpeed);
    startButton.textContent = 'Заново';

    if (currentControls === 'touch' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        createMobileControls();
    } else {
        removeMobileControls();
    }
});

pauseButton.addEventListener('click', togglePause);
resumeButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    resetGame();
    isGameRunning = true;
    isPaused = false;

    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(gameLoop, gameSpeed);
});

// Первоначальная настройка
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
draw();

// Основной цикл
function mainLoop() {
    if (currentControls === 'gamepad') {
        checkGamepad();
    }
    requestAnimationFrame(mainLoop);
}

// Запуск игры
requestAnimationFrame(mainLoop);