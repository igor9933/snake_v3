        // Инициализация игры
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const startButton = document.getElementById('start-btn');
        const pauseButton = document.getElementById('pause-btn');
        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        const finalScore = document.getElementById('final-score');
        const controlsSelect = document.getElementById('controls-select');
        const pauseOverlay = document.getElementById('pause-overlay');

        // Адаптация размера холста под экран
        function resizeCanvas() {
            const size = Math.min(window.innerWidth, window.innerHeight * 0.6);
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
        let currentControls = 'touch'; // По умолчанию сенсорное управление

        // Змейка
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

        // Проверка, находится ли еда на змейке
        function isFoodOnSnake() {
            return snake.some(segment => segment.x === food.x && segment.y === food.y);
        }

        // Генерация новой еды
        function generateFood() {
            do {
                food = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize)
                };
            } while (isFoodOnSnake());
        }

        // Отрисовка игры
        function draw() {
            // Очистка холста
            ctx.fillStyle = '#f9f9f9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Отрисовка сетки
            ctx.strokeStyle = '#e7e8ec';
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < gridSize; i++) {
                // Вертикальные линии
                ctx.beginPath();
                ctx.moveTo(i * tileSize, 0);
                ctx.lineTo(i * tileSize, canvas.height);
                ctx.stroke();
                
                // Горизонтальные линии
                ctx.beginPath();
                ctx.moveTo(0, i * tileSize);
                ctx.lineTo(canvas.width, i * tileSize);
                ctx.stroke();
            }
            
            // Отрисовка змейки
            snake.forEach((segment, index) => {
                if (index === 0) {
                    // Голова змейки
                    ctx.fillStyle = '#2a5885';
                } else {
                    // Тело змейки
                    ctx.fillStyle = '#4a76a8';
                }
                
                ctx.fillRect(
                    segment.x * tileSize + 1,
                    segment.y * tileSize + 1,
                    tileSize - 2,
                    tileSize - 2
                );
            });
            
            // Отрисовка еды
            ctx.fillStyle = '#e64646';
            ctx.beginPath();
            ctx.arc(
                food.x * tileSize + tileSize / 2,
                food.y * tileSize + tileSize / 2,
                tileSize / 2 - 1,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Обновление игры
        function update() {
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
                snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = `Счет: ${score}`;
                finalScore.textContent = `Ваш счет: ${score}`;
                
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
            scoreElement.textContent = `Счет: ${score}`;
            finalScore.textContent = `Ваш счет: ${score}`;
            gameSpeed = 150;
            generateFood();
            gameOverScreen.style.display = 'none';
        }

        // Управление с клавиатуры (только для десктопов)
        document.addEventListener('keydown', e => {
            if (!isGameRunning && e.key !== 'Enter') return;
            
            if (currentControls !== 'keyboard' && e.key !== 'Enter' && e.key !== ' ') return;
            
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            
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
                case ' ': togglePause(); break;
                case 'Enter': 
                    if (!isGameRunning) startButton.click(); 
                    break;
            }
        });

        // Свайпы для мобильных
        let touchStartX = 0, touchStartY = 0;

        canvas.addEventListener('touchstart', (e) => {
            if (currentControls !== 'touch') return;
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, {passive: false});

        canvas.addEventListener('touchmove', (e) => {
            if (!isGameRunning || currentControls !== 'touch') return;
            e.preventDefault();
            
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0 && direction !== 'left') nextDirection = 'right';
                else if (dx < 0 && direction !== 'right') nextDirection = 'left';
            } else {
                if (dy > 0 && direction !== 'up') nextDirection = 'down';
                else if (dy < 0 && direction !== 'down') nextDirection = 'up';
            }
        }, {passive: false});

        // Виртуальные кнопки для мобильных
        function createMobileControls() {
            if (document.getElementById('mobile-controls')) return;
            
            const controls = document.createElement('div');
            controls.id = 'mobile-controls';
            
            const upBtn = document.createElement('button');
            upBtn.innerHTML = '↑';
            upBtn.id = 'up-btn';

            const row = document.createElement('div');
            row.className = 'controls-row';
            
            const leftBtn = document.createElement('button');
            leftBtn.innerHTML = '←';
            leftBtn.id = 'left-btn';

            const downBtn = document.createElement('button');
            downBtn.innerHTML = '↓';
            downBtn.id = 'down-btn';

            const rightBtn = document.createElement('button');
            rightBtn.innerHTML = '→';
            rightBtn.id = 'right-btn';

            // Обработчики
            const handleDirection = (dir) => {
                if ((dir === 'up' && direction !== 'down') ||
                    (dir === 'down' && direction !== 'up') ||
                    (dir === 'left' && direction !== 'right') ||
                    (dir === 'right' && direction !== 'left')) {
                    nextDirection = dir;
                }
            };

            [upBtn, downBtn, leftBtn, rightBtn].forEach(btn => {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const dir = btn.innerHTML === '↑' ? 'up' : 
                                btn.innerHTML === '↓' ? 'down' : 
                                btn.innerHTML === '←' ? 'left' : 'right';
                    handleDirection(dir);
                });
                
                // Для совместимости с некоторыми браузерами
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const dir = btn.innerHTML === '↑' ? 'up' : 
                                btn.innerHTML === '↓' ? 'down' : 
                                btn.innerHTML === '←' ? 'left' : 'right';
                    handleDirection(dir);
                });
            });

            // Сборка
            row.appendChild(leftBtn);
            row.appendChild(downBtn);
            row.appendChild(rightBtn);
            
            controls.appendChild(upBtn);
            controls.appendChild(row);
            
            document.body.appendChild(controls);
        }

        function removeMobileControls() {
            const controls = document.getElementById('mobile-controls');
            if (controls) {
                controls.remove();
            }
        }

        // Управление кнопками
        startButton.addEventListener('click', () => {
            if (!isGameRunning) {
                startScreen.style.display = 'none';
                isGameRunning = true;
                isPaused = false;
                resetGame();
                gameInterval = setInterval(gameLoop, gameSpeed);
                startButton.textContent = 'Заново';
                
                if (currentControls === 'touch') {
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

        pauseButton.addEventListener('click', togglePause);

        function togglePause() {
            if (!isGameRunning) return;
            
            isPaused = !isPaused;
            pauseButton.textContent = isPaused ? 'Продолжить' : 'Пауза';
            pauseOverlay.style.display = isPaused ? 'flex' : 'none';
        }

        // Обработка изменения способа управления
        controlsSelect.addEventListener('change', (e) => {
            currentControls = e.target.value;
            
            if (currentControls === 'touch' && isGameRunning) {
                createMobileControls();
            } else {
                removeMobileControls();
            }
        });

        // Обработка ресайза окна
        window.addEventListener('resize', () => {
            resizeCanvas();
            draw();
        });

        // Первоначальная настройка
        resizeCanvas();
        draw();

        // Автоматически создаем мобильные кнопки при загрузке
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            controlsSelect.value = 'touch';
            currentControls = 'touch';
        }

        // Основной игровой цикл
        function mainLoop() {
            requestAnimationFrame(mainLoop);
        }

        mainLoop();