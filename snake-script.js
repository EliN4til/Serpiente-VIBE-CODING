// Elementos del DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');
const startScreenElement = document.getElementById('startScreen');
const pauseMenuElement = document.getElementById('pauseMenu');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');
const resumeButton = document.getElementById('resumeButton');
const restartPauseButton = document.getElementById('restartPauseButton');

// Configuración del juego
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Variables del juego
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameStarted = false;
let gameLoop;

// Inicializar el juego
function initGame() {
    // Inicializar la serpiente en el centro
    snake = [
        {x: 10, y: 10}
    ];
    
    // Generar comida
    generateFood();
    
    // Establecer dirección inicial (hacia la derecha)
    dx = 1;
    dy = 0;
    
    // Reiniciar puntuación
    score = 0;
    updateScore();
    
    // Mostrar récord
    highScoreElement.textContent = highScore;
    
    // Ocultar pantallas de inicio, fin y pausa
    gameOverElement.style.display = 'none';
    startScreenElement.style.display = 'none';
    pauseMenuElement.style.display = 'none';
    
    // Estado del juego
    gameRunning = true;
    gameStarted = true;
    
    // Habilitar botón de pausa
    pauseButton.disabled = false;
    
    // Limpiar intervalo anterior si existe
    if (gameLoop) clearInterval(gameLoop);
    
    // Iniciar bucle del juego
    gameLoop = setInterval(updateGame, 150);
    
    // Dibujar el estado inicial
    drawGame();
}

// Generar comida en una posición aleatoria
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Asegurarse de que la comida no aparezca en la serpiente
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Actualizar el estado del juego
function updateGame() {
    if (!gameRunning) return;
    
    // Mover la serpiente
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Verificar colisiones con los bordes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Verificar colisiones con el cuerpo (excluyendo la cola que se va a mover)
    // Esto soluciona el bug de colisión falsa durante cambios rápidos de dirección
    for (let i = 0; i < snake.length - 1; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // Agregar nueva cabeza
    snake.unshift(head);
    
    // Verificar si la serpiente comió la comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        // Si no comió, quitar la cola
        snake.pop();
    }
    
    // Dibujar el juego
    drawGame();
}

// Dibujar el juego
function drawGame() {
    // Limpiar el canvas
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar la serpiente
    ctx.fillStyle = '#27ae60';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // Dibujar la cabeza de la serpiente de otro color
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    
    // Dibujar la comida
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Actualizar la puntuación
function updateScore() {
    scoreElement.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// Fin del juego
function gameOver() {
    gameRunning = false;
    gameStarted = false;
    clearInterval(gameLoop);
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    pauseButton.disabled = true;
}

// Controlar la dirección de la serpiente
function changeDirection(event) {
    if (!gameRunning || !gameStarted) return;
    
    // Flecha izquierda
    if (event.key === 'ArrowLeft' && dx === 0) {
        dx = -1;
        dy = 0;
    }
    // Flecha arriba
    else if (event.key === 'ArrowUp' && dy === 0) {
        dx = 0;
        dy = -1;
    }
    // Flecha derecha
    else if (event.key === 'ArrowRight' && dx === 0) {
        dx = 1;
        dy = 0;
    }
    // Flecha abajo
    else if (event.key === 'ArrowDown' && dy === 0) {
        dx = 0;
        dy = 1;
    }
    // Tecla Escape para pausar
    else if (event.key === 'Escape') {
        togglePause();
    }
}

// Pausar/reanudar el juego
function togglePause() {
    if (!gameRunning && gameStarted) {
        // Reanudar juego
        gameRunning = true;
        gameLoop = setInterval(updateGame, 150);
        pauseButton.textContent = 'Pausa';
        pauseMenuElement.style.display = 'none';
    } else if (gameRunning) {
        // Pausar juego
        gameRunning = false;
        clearInterval(gameLoop);
        pauseButton.textContent = 'Reanudar';
        pauseMenuElement.style.display = 'block';
    }
}

// Event Listeners
document.addEventListener('keydown', changeDirection);

startButton.addEventListener('click', () => {
    if (!gameStarted) {
        initGame();
        pauseButton.textContent = 'Pausa';
    }
});

pauseButton.addEventListener('click', togglePause);

restartButton.addEventListener('click', () => {
    initGame();
    pauseButton.textContent = 'Pausa';
});

resumeButton.addEventListener('click', () => {
    togglePause();
});

restartPauseButton.addEventListener('click', () => {
    initGame();
    pauseButton.textContent = 'Pausa';
});

// Inicializar el juego al cargar la página
window.onload = function() {
    highScoreElement.textContent = highScore;
    
    // Dibujar pantalla de inicio
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Presiona "Iniciar Juego"', canvas.width / 2, canvas.height / 2);
};