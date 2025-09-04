/**
 * 🚗 BALAP MOBIL - JavaScript Logic dengan Audio Integration
 * Fitur: Lintasan 3 lajur, obstacle mobil lawan, power-up, level & kecepatan meningkat,
 * skor & high score (localStorage), audio event, dan UI status.
 */

class BalapMobil {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('carRaceHighScore') || '0', 10);
        this.level = 1;
        this.speedMultiplier = 1.0; // tampilkan di UI

        // Track & lanes (3 lanes)
        this.laneCount = 3;
        this.laneWidth = this.canvas.width / this.laneCount;

        // Player car
        this.player = {
            lane: 1, // 0..2
            width: Math.floor(this.laneWidth * 0.6),
            height: 90,
            color: '#00c3ff',
        };
        this.player.x = this.getLaneCenterX(this.player.lane) - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;

        // Obstacles
        this.obstacles = []; // { lane, x, y, width, height, speed }
        this.baseObstacleSpeed = 3.0;
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnInterval = 70; // frames

        // Power-ups
        this.powerUps = []; // { lane, x, y, width, height, type }
        this.activePowerUps = {};
        this.powerUpTimers = {};
        this.basePowerUpDuration = 5000;
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 600; // frames
        this.powerUpTypes = ['shield', 'slow', 'score'];

        // UI
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('highScore');
        this.speedEl = document.getElementById('speed');
        this.statusEl = document.getElementById('gameStatus');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');

        // Audio
        this.audioManager = window.audioManager;

        this.bindEvents();
        this.updateDisplay();
        this.draw();
    }

    getLaneCenterX(laneIndex) {
        return laneIndex * this.laneWidth + this.laneWidth / 2;
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => {
            if (this.audioManager) this.audioManager.playAction('click');
            this.startGame();
        });
        this.restartButton.addEventListener('click', () => {
            if (this.audioManager) this.audioManager.playAction('click');
            this.restartGame();
        });

        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gameOver) return;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.moveLeft();
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.moveRight();
            }
        });

        // Start with space
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameRunning) {
                this.startButton.click();
            }
        });

        // Mouse/touch on canvas to move lanes
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameRunning || this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const targetLane = Math.floor(clickX / this.laneWidth);
            if (targetLane < this.player.lane) this.moveLeft();
            else if (targetLane > this.player.lane) this.moveRight();
        });

        // Mobile control buttons if present
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');
        if (leftButton) {
            leftButton.addEventListener('click', () => { if (this.gameRunning && !this.gameOver) this.moveLeft(); });
            leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); if (this.gameRunning && !this.gameOver) this.moveLeft(); }, { passive: false });
        }
        if (rightButton) {
            rightButton.addEventListener('click', () => { if (this.gameRunning && !this.gameOver) this.moveRight(); });
            rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); if (this.gameRunning && !this.gameOver) this.moveRight(); }, { passive: false });
        }
    }

    startGame() {
        if (this.audioManager) this.audioManager.playGameEvent('start');
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.speedMultiplier = 1.0;
        this.obstacles = [];
        this.powerUps = [];
        this.clearAllPowerUps();
        this.player.lane = 1;
        this.player.x = this.getLaneCenterX(this.player.lane) - this.player.width / 2;
        this.obstacleSpawnTimer = 0;
        this.powerUpSpawnTimer = 0;

        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'none';
        this.updateStatus('Gas!');
        this.gameLoop();
    }

    restartGame() {
        this.gameOver = false;
        this.gameRunning = false;
        this.updateStatus('Siap Balap!');
        this.startButton.style.display = 'inline-block';
        this.restartButton.style.display = 'none';
        this.updateDisplay();
        this.draw();
    }

    moveLeft() {
        if (this.player.lane > 0) {
            this.player.lane--;
            this.player.x = this.getLaneCenterX(this.player.lane) - this.player.width / 2;
            if (this.audioManager) this.audioManager.playAction('move');
        }
    }

    moveRight() {
        if (this.player.lane < this.laneCount - 1) {
            this.player.lane++;
            this.player.x = this.getLaneCenterX(this.player.lane) - this.player.width / 2;
            if (this.audioManager) this.audioManager.playAction('move');
        }
    }

    update() {
        if (!this.gameRunning) return;

        // Spawn obstacles
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.spawnObstacle();
            this.obstacleSpawnTimer = 0;
        }

        // Spawn power-ups occasionally
        this.powerUpSpawnTimer++;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            if (Math.random() < 0.5) this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }

        // Move obstacles
        const obstacleSpeed = this.baseObstacleSpeed * this.speedMultiplier * (this.activePowerUps['slow'] ? 0.7 : 1);
        this.obstacles.forEach((o) => {
            o.y += obstacleSpeed;
        });
        // Remove off-screen obstacles and add score
        this.obstacles = this.obstacles.filter(o => {
            if (o.y > this.canvas.height) {
                this.score += 1;
                this.levelUpCheck();
                if (this.audioManager) this.audioManager.playAction('hover');
                return false;
            }
            return true;
        });

        // Move power-ups
        this.powerUps.forEach(p => p.y += obstacleSpeed * 0.8);
        this.powerUps = this.powerUps.filter(p => p.y <= this.canvas.height);

        // Collision
        this.checkCollisions();

        // Update UI
        this.updateDisplay();
    }

    levelUpCheck() {
        // Every 10 points: increase level and speed slightly
        const newLevel = Math.floor(this.score / 10) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.speedMultiplier = 1.0 + (this.level - 1) * 0.1;
            if (this.audioManager) this.audioManager.playGameEvent('resume');
            this.updateStatus(`Level ${this.level}!`);
        }
    }

    spawnObstacle() {
        const lane = Math.floor(Math.random() * this.laneCount);
        const width = Math.floor(this.laneWidth * 0.6);
        const height = 90;
        const x = this.getLaneCenterX(lane) - width / 2;
        const y = -height;
        // Pick a random vibrant color for enemy cars to avoid monotony
        const palette = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#3742fa', '#e84393', '#eccc68', '#ff6b81', '#7bed9f', '#70a1ff'];
        const color = palette[Math.floor(Math.random() * palette.length)];
        this.obstacles.push({ lane, x, y, width, height, color });
    }

    spawnPowerUp() {
        const lane = Math.floor(Math.random() * this.laneCount);
        const width = Math.floor(this.laneWidth * 0.4);
        const height = 40;
        const x = this.getLaneCenterX(lane) - width / 2;
        const y = -height;
        const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        this.powerUps.push({ lane, x, y, width, height, type });
    }

    checkCollisions() {
        // Obstacle collision (game over unless shield)
        for (const o of this.obstacles) {
            if (this.rectsOverlap(this.player, o)) {
                if (this.activePowerUps['shield']) {
                    // consume shield and remove obstacle
                    this.consumePowerUp('shield');
                    this.obstacles = this.obstacles.filter(x => x !== o);
                    if (this.audioManager) this.audioManager.playAction('break');
                } else {
                    this.endGame();
                    return;
                }
            }
        }

        // Power-up collection
        this.powerUps.forEach((p, idx) => {
            if (this.rectsOverlap(this.player, p)) {
                this.applyPowerUp(p.type);
                this.powerUps.splice(idx, 1);
                if (this.audioManager) this.audioManager.playAction('collect');
            }
        });
    }

    rectsOverlap(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    applyPowerUp(type) {
        switch(type) {
            case 'shield':
                this.applyTemporaryPowerUp('shield', () => {
                    this.updateStatus('Shield aktif! 🛡️');
                }, () => {
                    this.updateStatus('Shield habis.');
                });
                break;
            case 'slow':
                this.applyTemporaryPowerUp('slow', () => {
                    this.updateStatus('Lalu lintas melambat 🐌');
                }, () => {
                    this.updateStatus('Kecepatan normal.');
                });
                break;
            case 'score':
                // +5 skor langsung
                this.score += 5;
                this.updateStatus('+5 Skor! ⭐');
                break;
        }
    }

    applyTemporaryPowerUp(key, onStart, onEnd, duration = this.basePowerUpDuration) {
        if (this.activePowerUps[key]) {
            clearTimeout(this.powerUpTimers[key]);
        }
        this.activePowerUps[key] = true;
        onStart();
        this.powerUpTimers[key] = setTimeout(() => {
            delete this.activePowerUps[key];
            onEnd();
        }, duration);
    }

    consumePowerUp(key) {
        if (this.activePowerUps[key]) {
            clearTimeout(this.powerUpTimers[key]);
            delete this.activePowerUps[key];
        }
    }

    clearAllPowerUps() {
        Object.keys(this.powerUpTimers).forEach(k => clearTimeout(this.powerUpTimers[k]));
        this.activePowerUps = {};
        this.powerUpTimers = {};
    }

    endGame() {
        if (this.audioManager) this.audioManager.playGameEvent('over');
        this.gameOver = true;
        this.gameRunning = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('carRaceHighScore', String(this.highScore));
        }
        this.restartButton.style.display = 'inline-block';
        this.updateStatus('Game Over!');
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.scoreEl) this.scoreEl.textContent = String(this.score);
        if (this.highScoreEl) this.highScoreEl.textContent = String(this.highScore);
        if (this.speedEl) this.speedEl.textContent = `${this.speedMultiplier.toFixed(1)}x`;
    }

    updateStatus(text) {
        if (this.statusEl) this.statusEl.textContent = text;
    }

    gameLoop() {
        if (!this.gameRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#0a0a14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Road background with lanes
        this.drawRoad();

        // Draw obstacles
        this.obstacles.forEach(o => this.drawCar(o.x, o.y, o.width, o.height, o.color || '#ff4757'));

        // Draw power-ups
        this.powerUps.forEach(p => this.drawPowerUp(p));

        // Draw player
        this.drawCar(this.player.x, this.player.y, this.player.width, this.player.height, this.activePowerUps['shield'] ? '#00ff88' : this.player.color);

        // UI overlay on game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 10);
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`Skor: ${this.score}  |  High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }

    drawRoad() {
        // Road
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Lane lines
        this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        this.ctx.lineWidth = 2;
        for (let i = 1; i < this.laneCount; i++) {
            const x = i * this.laneWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        // Moving dash center lines for speed effect
        this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        this.ctx.setLineDash([20, 20]);
        this.ctx.lineDashOffset = -(Date.now() / 10 * this.speedMultiplier) % 40;
        const center = this.laneWidth / 2;
        for (let i = 0; i < this.laneCount; i++) {
            const cx = i * this.laneWidth + center;
            this.ctx.beginPath();
            this.ctx.moveTo(cx, 0);
            this.ctx.lineTo(cx, this.canvas.height);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);
    }

    drawCar(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
        // simple wheels
        this.ctx.fillStyle = '#111';
        const wheelH = 10;
        this.ctx.fillRect(x + 6, y + 8, w - 12, wheelH);
        this.ctx.fillRect(x + 6, y + h - 18, w - 12, wheelH);
    }

    drawPowerUp(p) {
        let color = '#ffd700';
        if (p.type === 'shield') color = '#00ff88';
        else if (p.type === 'slow') color = '#00b4ff';
        else if (p.type === 'score') color = '#ffd700';
        this.ctx.fillStyle = color;
        this.ctx.fillRect(p.x, p.y, p.width, p.height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(p.x, p.y, p.width, p.height);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        new BalapMobil();
        console.log('Balap Mobil initialized successfully');
    } catch (e) {
        console.error('Error initializing Balap Mobil:', e);
    }
});
