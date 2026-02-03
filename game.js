/**
 * MINI GAME: SNAKE
 * Supports Keyboard (Desktop) and Swipe (Mobile).
 * Includes Local Leaderboard (LocalStorage).
 */
function initSnakeGame() {
    const canvas = document.getElementById('gameCanvas');
    const scoreElement = document.getElementById('gameScore');
    const restartBtn = document.getElementById('restartGame');
    const leaderboardElement = document.getElementById('leaderboard'); // New: Leaderboard container
    
    if (!canvas || !scoreElement || !restartBtn) return;

    const ctx = canvas.getContext('2d');
    const gridSize = 15; 
    const tileCount = canvas.width / gridSize;

    let snake = [];
    let food = { x: 10, y: 10 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameLoop;
    let isGameOver = false;

    // Colors (dynamic based on theme)
    function getColors() {
        const isLight = document.body.classList.contains('light-mode');
        return {
            snake: isLight ? '#0066cc' : '#00ff88',
            food: isLight ? '#cc0000' : '#ff0055',
            bg: isLight ? '#f0f2f5' : '#111',
            grid: isLight ? '#ddd' : '#222'
        };
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        isGameOver = false;
        scoreElement.innerText = `Score: ${score}`;
        placeFood();
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, 100);
        renderLeaderboard(); // Clear any "Game Over" messages
    }

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) placeFood();
        });
    }

    function gameStep() {
        const colors = getColors();
        
        // Move Snake
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wall Collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // Self Collision
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.innerText = `Score: ${score}`;
            placeFood();
        } else {
            snake.pop();
        }

        draw(colors);
    }

    function draw(colors) {
        // Clear
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Snake
        ctx.fillStyle = colors.snake;
        snake.forEach(part => {
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // Draw Food
        ctx.fillStyle = colors.food;
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function gameOver() {
        clearInterval(gameLoop);
        isGameOver = true;
        saveScore(score);
        scoreElement.innerText = `Game Over! Score: ${score}`;
        renderLeaderboard();
    }

    // --- LEADERBOARD (LocalStorage) ---
    function saveScore(newScore) {
        if (newScore === 0) return;
        
        let scores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
        
        // Ask for name (simple prompt)
        const name = prompt("New High Score! Enter your name (max 10 chars):", "Player") || "Player";
        const cleanName = name.substring(0, 10);

        scores.push({ name: cleanName, score: newScore, date: new Date().toLocaleDateString() });
        
        // Sort descending
        scores.sort((a, b) => b.score - a.score);
        
        // Keep top 5
        scores = scores.slice(0, 5);
        
        localStorage.setItem('snakeLeaderboard', JSON.stringify(scores));
    }

    function renderLeaderboard() {
        if (!leaderboardElement) return;

        const scores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
        
        let html = '<h4>🏆 Local Leaderboard</h4>';
        if (scores.length === 0) {
            html += '<p>No scores yet. Be the first!</p>';
        } else {
            html += '<ul>';
            scores.forEach((entry, index) => {
                html += `<li><span>#${index + 1} ${entry.name}</span> <span>${entry.score}</span></li>`;
            });
            html += '</ul>';
        }
        
        leaderboardElement.innerHTML = html;
    }

    // --- CONTROLS ---

    // 1. Keyboard (Desktop)
    document.addEventListener('keydown', (e) => {
        if (isGameOver && e.key === 'Enter') {
            resetGame();
            return;
        }
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'ArrowUp': if (dy !== 1) { dx = 0; dy = -1; } break;
            case 'ArrowDown': if (dy !== -1) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': if (dx !== 1) { dx = -1; dy = 0; } break;
            case 'ArrowRight': if (dx !== -1) { dx = 1; dy = 0; } break;
        }
    });

    // 2. Touch / Swipe (Mobile)
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (isGameOver) return; // Don't move if game over

        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0 && dx !== -1) { dx = 1; dy = 0; }
            else if (diffX < 0 && dx !== 1) { dx = -1; dy = 0; }
        } else {
            if (diffY > 0 && dy !== -1) { dx = 0; dy = 1; }
            else if (diffY < 0 && dy !== 1) { dx = 0; dy = -1; }
        }
        e.preventDefault();
    }, { passive: false });

    restartBtn.addEventListener('click', resetGame);

    // Initial Render
    renderLeaderboard();
}

document.addEventListener('DOMContentLoaded', initSnakeGame);
