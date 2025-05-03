 // Инициализация игры
 const canvas = document.getElementById('game-canvas');
 const ctx = canvas.getContext('2d');
 const scoreElement = document.getElementById('score');
 const startButton = document.getElementById('start-btn');
 const pauseButton = document.getElementById('pause-btn');
 const gameContainer = document.getElementById('game-container');

 // Параметры игры
 const gridSize = 15;
 const tileSize = canvas.width / gridSize;
 let score = 0;
 let gameSpeed = 150;
 let gameInterval;
 let isPaused = false;
 let isGameRunning = false;

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

 // Создаем элементы интерфейса
 const startScreen = document.createElement('div');
 startScreen.style.position = 'absolute';
 startScreen.style.top = '0';
 startScreen.style.left = '0';
 startScreen.style.width = '100%';
 startScreen.style.height = '100%';
 startScreen.style.backgroundColor = 'rgba(42, 88, 133, 0.9)';
 startScreen.style.display = 'flex';
 startScreen.style.flexDirection = 'column';
 startScreen.style.justifyContent = 'center';
 startScreen.style.alignItems = 'center';
 startScreen.style.zIndex = '1000';

 const gameTitle = document.createElement('h1');
 gameTitle.textContent = 'ЗМЕЙКА VK';
 gameTitle.style.color = 'white';
 gameTitle.style.fontSize = '3rem';
 gameTitle.style.marginBottom = '2rem';
 gameTitle.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';

 const startPrompt = document.createElement('div');
 startPrompt.textContent = 'Нажмите START чтобы начать';
 startPrompt.style.color = 'white';
 startPrompt.style.fontSize = '1.5rem';
 startPrompt.style.marginBottom = '2rem';

 startScreen.appendChild(gameTitle);
 startScreen.appendChild(startPrompt);
 gameContainer.appendChild(startScreen);

 const gameOverScreen = document.createElement('div');
 gameOverScreen.style.position = 'absolute';
 gameOverScreen.style.top = '0';
 gameOverScreen.style.left = '0';
 gameOverScreen.style.width = '100%';
 gameOverScreen.style.height = '100%';
 gameOverScreen.style.backgroundColor = 'rgba(230, 70, 70, 0.9)';
 gameOverScreen.style.display = 'none';
 gameOverScreen.style.flexDirection = 'column';
 gameOverScreen.style.justifyContent = 'center';
 gameOverScreen.style.alignItems = 'center';
 gameOverScreen.style.zIndex = '1000';

 const gameOverTitle = document.createElement('h1');
 gameOverTitle.textContent = 'GAME OVER';
 gameOverTitle.style.color = 'white';
 gameOverTitle.style.fontSize = '3rem';
 gameOverTitle.style.marginBottom = '1rem';
 gameOverTitle.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';

 const finalScore = document.createElement('div');
 finalScore.style.color = 'white';
 finalScore.style.fontSize = '2rem';
 finalScore.style.marginBottom = '2rem';

 const restartPrompt = document.createElement('div');
 restartPrompt.textContent = 'Нажмите START чтобы сыграть снова';
 restartPrompt.style.color = 'white';
 restartPrompt.style.fontSize = '1.2rem';

 gameOverScreen.appendChild(gameOverTitle);
 gameOverScreen.appendChild(finalScore);
 gameOverScreen.appendChild(restartPrompt);
 gameContainer.appendChild(gameOverScreen);

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
         
         // Глаза у головы
         if (index === 0) {
             ctx.fillStyle = 'white';
             const eyeSize = tileSize / 5;
             
             let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
             
             switch (direction) {
                 case 'up':
                     leftEyeX = segment.x * tileSize + tileSize / 4;
                     leftEyeY = segment.y * tileSize + tileSize / 4;
                     rightEyeX = segment.x * tileSize + 3 * tileSize / 4;
                     rightEyeY = segment.y * tileSize + tileSize / 4;
                     break;
                 case 'down':
                     leftEyeX = segment.x * tileSize + tileSize / 4;
                     leftEyeY = segment.y * tileSize + 3 * tileSize / 4;
                     rightEyeX = segment.x * tileSize + 3 * tileSize / 4;
                     rightEyeY = segment.y * tileSize + 3 * tileSize / 4;
                     break;
                 case 'left':
                     leftEyeX = segment.x * tileSize + tileSize / 4;
                     leftEyeY = segment.y * tileSize + tileSize / 4;
                     rightEyeX = segment.x * tileSize + tileSize / 4;
                     rightEyeY = segment.y * tileSize + 3 * tileSize / 4;
                     break;
                 case 'right':
                     leftEyeX = segment.x * tileSize + 3 * tileSize / 4;
                     leftEyeY = segment.y * tileSize + tileSize / 4;
                     rightEyeX = segment.x * tileSize + 3 * tileSize / 4;
                     rightEyeY = segment.y * tileSize + 3 * tileSize / 4;
                     break;
             }
             
             ctx.beginPath();
             ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
             ctx.fill();
             
             ctx.beginPath();
             ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
             ctx.fill();
         }
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
     gameSpeed = 150;
     generateFood();
     gameOverScreen.style.display = 'none';
 }

 // Управление
 document.addEventListener('keydown', e => {
     if (!isGameRunning) return;
     
     switch (e.key) {
         case 'ArrowUp': if (direction !== 'down') nextDirection = 'up'; break;
         case 'ArrowDown': if (direction !== 'up') nextDirection = 'down'; break;
         case 'ArrowLeft': if (direction !== 'right') nextDirection = 'left'; break;
         case 'ArrowRight': if (direction !== 'left') nextDirection = 'right'; break;
         case ' ': togglePause(); break;
     }
 });

 // Свайпы для мобильных
 let touchStartX = 0, touchStartY = 0;

 canvas.addEventListener('touchstart', (e) => {
     touchStartX = e.touches[0].clientX;
     touchStartY = e.touches[0].clientY;
 }, {passive: false});

 canvas.addEventListener('touchmove', (e) => {
     if (!isGameRunning) return;
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
     const controls = document.createElement('div');
     controls.style.position = 'fixed';
     controls.style.bottom = '20px';
     controls.style.left = '0';
     controls.style.right = '0';
     controls.style.display = 'flex';
     controls.style.flexDirection = 'column';
     controls.style.alignItems = 'center';
     controls.style.zIndex = '100';
     controls.style.padding = '10px';
     controls.style.backgroundColor = 'rgba(0,0,0,0.3)';
     controls.style.borderRadius = '20px';
     controls.style.maxWidth = '300px';
     controls.style.margin = '0 auto';

     const upBtn = document.createElement('button');
     upBtn.innerHTML = '&#8593;';
     upBtn.style.width = '60px';
     upBtn.style.height = '50px';
     upBtn.style.margin = '5px';
     upBtn.style.fontSize = '24px';
     upBtn.style.borderRadius = '10px';
     upBtn.style.border = 'none';
     upBtn.style.background = 'rgba(255,255,255,0.7)';

     const row = document.createElement('div');
     const leftBtn = document.createElement('button');
     leftBtn.innerHTML = '&#8592;';
     leftBtn.style.width = '60px';
     leftBtn.style.height = '50px';
     leftBtn.style.margin = '5px';
     leftBtn.style.fontSize = '24px';
     leftBtn.style.borderRadius = '10px';
     leftBtn.style.border = 'none';
     leftBtn.style.background = 'rgba(255,255,255,0.7)';

     const downBtn = document.createElement('button');
     downBtn.innerHTML = '&#8595;';
     downBtn.style.width = '60px';
     downBtn.style.height = '50px';
     downBtn.style.margin = '5px';
     downBtn.style.fontSize = '24px';
     downBtn.style.borderRadius = '10px';
     downBtn.style.border = 'none';
     downBtn.style.background = 'rgba(255,255,255,0.7)';

     const rightBtn = document.createElement('button');
     rightBtn.innerHTML = '&#8594;';
     rightBtn.style.width = '60px';
     rightBtn.style.height = '50px';
     rightBtn.style.margin = '5px';
     rightBtn.style.fontSize = '24px';
     rightBtn.style.borderRadius = '10px';
     rightBtn.style.border = 'none';
     rightBtn.style.background = 'rgba(255,255,255,0.7)';

     // Обработчики
     const handleDirection = (dir) => {
         if ((dir === 'up' && direction !== 'down') ||
             (dir === 'down' && direction !== 'up') ||
             (dir === 'left' && direction !== 'right') ||
             (dir === 'right' && direction !== 'left')) {
             nextDirection = dir;
         }
     };

     upBtn.addEventListener('touchstart', () => handleDirection('up'));
     downBtn.addEventListener('touchstart', () => handleDirection('down'));
     leftBtn.addEventListener('touchstart', () => handleDirection('left'));
     rightBtn.addEventListener('touchstart', () => handleDirection('right'));

     // Сборка
     row.appendChild(leftBtn);
     row.appendChild(downBtn);
     row.appendChild(rightBtn);
     
     controls.appendChild(upBtn);
     controls.appendChild(row);
     
     document.body.appendChild(controls);
 }

 if ('ontouchstart' in window) {
     createMobileControls();
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
     
     if (isPaused) {
         const pauseOverlay = document.createElement('div');
         pauseOverlay.id = 'pause-overlay';
         pauseOverlay.style.position = 'absolute';
         pauseOverlay.style.top = '0';
         pauseOverlay.style.left = '0';
         pauseOverlay.style.width = '100%';
         pauseOverlay.style.height = '100%';
         pauseOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
         pauseOverlay.style.display = 'flex';
         pauseOverlay.style.justifyContent = 'center';
         pauseOverlay.style.alignItems = 'center';
         pauseOverlay.style.zIndex = '500';
         
         const pauseText = document.createElement('div');
         pauseText.textContent = 'ПАУЗА';
         pauseText.style.color = 'white';
         pauseText.style.fontSize = '3rem';
         pauseText.style.fontWeight = 'bold';
         
         pauseOverlay.appendChild(pauseText);
         gameContainer.appendChild(pauseOverlay);
     } else {
         const overlay = document.getElementById('pause-overlay');
         if (overlay) overlay.remove();
     }
 }

 // Первоначальная отрисовка
 draw();