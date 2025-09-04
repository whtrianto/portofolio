/**
 * 🐍 SNAKE GAME - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat lanjut:
 * - ES6 Classes dan Object-Oriented Programming
 * - Canvas API untuk rendering graphics
 * - Game Loop dengan setInterval
 * - Collision Detection
 * - Array manipulation (unshift, pop, slice, some)
 * - Event handling untuk keyboard input
 * - Game State Management
 * - Coordinate system dan grid-based movement
 * - Animation dan drawing
 * - Audio integration dengan AudioManager
 */

/**
 * Class SnakeGame - Main game controller
 * 
 * Konsep yang dipelajari:
 * - ES6 Class syntax
 * - Constructor method
 * - Instance properties (this.property)
 * - Method definitions
 * - Canvas context dan 2D rendering
 * - Audio event handling
 */
class SnakeGame {
    /**
     * Constructor - Inisialisasi semua properti dan setup game
     * 
     * Konsep yang dipelajari:
     * - Constructor method
     * - Canvas setup dan context
     * - Game state initialization
     * - DOM element selection
     * - Method chaining
     * - Audio initialization
     */
    constructor() {
        // ===== CANVAS SETUP =====
        // Canvas adalah elemen HTML untuk menggambar graphics
        this.canvas = document.getElementById('gameCanvas');
        
        // getContext('2d') memberikan context untuk menggambar 2D
        // Context ini memiliki method seperti fillRect, stroke, fillText, dll
        this.ctx = this.canvas.getContext('2d');
        
        // ===== GRID SYSTEM =====
        // Grid size menentukan ukuran setiap tile dalam game
        this.gridSize = 20;
        
        // tileCount menghitung berapa tile yang bisa muat dalam canvas
        // canvas.width / gridSize = 400 / 20 = 20 tile
        this.tileCount = this.canvas.width / this.gridSize;
        
        // ===== GAME STATE INITIALIZATION =====
        // Snake adalah array of objects, setiap object memiliki x dan y coordinates
        // [{x: 10, y: 10}] artinya snake dimulai di posisi (10, 10)
        this.snake = [{x: 10, y: 10}];
        
        // Food adalah object dengan koordinat x, y yang di-generate secara acak
        this.food = this.generateFood();
        
        // Direction vectors: dx dan dy menentukan arah pergerakan snake
        // dx = 1, dy = 0 artinya bergerak ke kanan
        // dx = -1, dy = 0 artinya bergerak ke kiri
        // dx = 0, dy = 1 artinya bergerak ke bawah
        // dx = 0, dy = -1 artinya bergerak ke atas
        this.dx = 1; // Start moving right
        this.dy = 0;
        
        // ===== GAME VARIABLES =====
        this.score = 0;           // Skor player
        this.gameRunning = false; // Boolean flag untuk status game
        this.gameLoop = null;     // Reference ke interval timer
        this.directionLocked = false; // Kunci arah per tick untuk cegah multi-input
        
        // ===== DOM ELEMENTS =====
        // Mengambil elemen HTML yang diperlukan untuk UI
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.scoreElement = document.getElementById('score');
        this.lengthElement = document.getElementById('length');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // ===== AUDIO INTEGRATION =====
        this.audioManager = window.audioManager;
        
        // ===== INITIALIZATION =====
        this.bindEvents();        // Setup event listeners
        this.draw();              // Draw initial game state
        this.updateDisplay();     // Update UI elements
        this.updateStatus('Siap Main'); // Set initial status
    }
    
    /**
     * bindEvents() - Setup semua event listeners
     * 
     * Konsep yang dipelajari:
     * - Event listeners untuk buttons
     * - Keyboard event handling
     * - Arrow functions untuk event handlers
     * - Switch statements
     * - Input validation untuk mencegah reverse direction
     * - Audio feedback untuk user interactions
     * - Mobile touch controls
     */
    bindEvents() {
        // Event listener untuk tombol start dan restart
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // Event listener untuk keyboard input
        // 'keydown' event terjadi setiap kali tombol ditekan
        document.addEventListener('keydown', (e) => {
            // Hanya proses input jika game sedang berjalan
            if (!this.gameRunning) return;
            if (this.directionLocked) return; // cegah perubahan ganda dalam satu tick
            
            // Switch statement untuk menangani berbagai key input
            switch(e.key) {
                case 'ArrowUp':
                    // Mencegah snake bergerak ke arah berlawanan (ke bawah)
                    if (this.dy !== 1) { 
                        this.dx = 0; this.dy = -1; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
                case 'ArrowDown':
                    // Mencegah snake bergerak ke arah berlawanan (ke atas)
                    if (this.dy !== -1) { 
                        this.dx = 0; this.dy = 1; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
                case 'ArrowLeft':
                    // Mencegah snake bergerak ke arah berlawanan (ke kanan)
                    if (this.dx !== 1) { 
                        this.dx = -1; this.dy = 0; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
                case 'ArrowRight':
                    // Mencegah snake bergerak ke arah berlawanan (ke kiri)
                    if (this.dx !== -1) { 
                        this.dx = 1; this.dy = 0; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
            }
            // Switch statement untuk menangani berbagai key input
            switch(e.key) {
                case 'w':
                    // Mencegah snake bergerak ke arah berlawanan (ke bawah)
                    if (this.dy !== 1 && !this.directionLocked) { 
                        this.dx = 0; this.dy = -1; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
                case 's':
                    // Mencegah snake bergerak ke arah berlawanan (ke atas)
                    if (this.dy !== -1 && !this.directionLocked) { 
                        this.dx = 0; this.dy = 1; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
                case 'a':
                    // Mencegah snake bergerak ke arah berlawanan (ke kanan)
                    if (this.dx !== 1 && !this.directionLocked) { 
                        this.dx = -1; this.dy = 0; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
                case 'd':
                    // Mencegah snake bergerak ke arah berlawanan (ke kiri)
                    if (this.dx !== -1 && !this.directionLocked) { 
                        this.dx = 1; this.dy = 0; 
                        this.playMoveSound();
                        this.directionLocked = true;
                    }
                    break;
            }
        });
        
        // Event listener untuk mobile controls
        this.bindMobileControls();
    }
    
    /**
     * bindMobileControls() - Setup event listeners untuk kontrol mobile
     */
    bindMobileControls() {
        const upButton = document.getElementById('upButton');
        const downButton = document.getElementById('downButton');
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');
        
        if (upButton) {
            upButton.addEventListener('click', () => this.handleMobileInput('up'));
            upButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileInput('up');
            });
        }
        
        if (downButton) {
            downButton.addEventListener('click', () => this.handleMobileInput('down'));
            downButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileInput('down');
            });
        }
        
        if (leftButton) {
            leftButton.addEventListener('click', () => this.handleMobileInput('left'));
            leftButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileInput('left');
            });
        }
        
        if (rightButton) {
            rightButton.addEventListener('click', () => this.handleMobileInput('right'));
            rightButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileInput('right');
            });
        }
        
        // Add swipe gesture support for mobile
        this.setupSwipeGestures();
    }
    
    /**
     * setupSwipeGestures() - Setup swipe gesture detection untuk mobile
     */
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const canvas = this.canvas;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: false });
    }
    
    /**
     * handleSwipe() - Process swipe gesture dan convert ke direction
     */
    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 30; // Minimum distance untuk swipe
        
        // Cek apakah swipe cukup jauh
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return; // Swipe terlalu pendek
        }
        
        // Determine direction berdasarkan delta yang lebih besar
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.handleMobileInput('right');
            } else {
                this.handleMobileInput('left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.handleMobileInput('down');
            } else {
                this.handleMobileInput('up');
            }
        }
    }
    
    /**
     * handleMobileInput() - Handle input dari tombol kontrol mobile
     */
    handleMobileInput(direction) {
        if (!this.gameRunning) return;
        if (this.directionLocked) return;
        
        switch(direction) {
            case 'up':
                if (this.dy !== 1) { 
                    this.dx = 0; this.dy = -1; 
                    this.playMoveSound();
                    this.directionLocked = true;
                }
                break;
            case 'down':
                if (this.dy !== -1) { 
                    this.dx = 0; this.dy = 1; 
                    this.playMoveSound();
                    this.directionLocked = true;
                }
                break;
            case 'left':
                if (this.dx !== 1) { 
                    this.dx = -1; this.dy = 0; 
                    this.playMoveSound();
                    this.directionLocked = true;
                }
                break;
            case 'right':
                if (this.dx !== -1) { 
                    this.dx = 1; this.dy = 0; 
                    this.playMoveSound();
                    this.directionLocked = true;
                }
                break;
        }
    }
    
    /**
     * playMoveSound() - Play move sound effect
     */
    playMoveSound() {
        if (this.audioManager) {
            this.audioManager.playAction('move');
        }
    }
    
    /**
     * startGame() - Memulai game
     * 
     * Konsep yang dipelajari:
     * - Game state management
     * - setInterval untuk game loop
     * - UI state changes
     * - Game reset logic
     * - Audio event handling
     */
    startGame() {
        // Mencegah multiple start jika game sudah berjalan
        if (this.gameRunning) return;
        
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('start');
        }
        
        // ===== SET GAME STATE =====
        this.gameRunning = true;
        this.startButton.style.display = 'none';    // Sembunyikan tombol start
        this.restartButton.style.display = 'none';  // Sembunyikan tombol restart
        
        // ===== RESET GAME ELEMENTS =====
        // Reset snake ke posisi awal
        this.snake = [{x: 10, y: 10}];
        
        // Reset direction ke kanan
        this.dx = 1;
        this.dy = 0;
        
        // Reset skor dan generate food baru
        this.score = 0;
        this.food = this.generateFood();
        
        // ===== UPDATE UI =====
        this.updateDisplay();
        this.updateStatus('Game Berjalan');
        this.draw();
        
        // ===== START GAME LOOP =====
        // setInterval menjalankan fungsi update() setiap 220ms (kecepatan ular)
        // Ini menciptakan game loop yang smooth (60 FPS equivalent)
        this.gameLoop = setInterval(() => {
            this.update();
        }, 220);
    }
    
    /**
     * restartGame() - Restart game dari awal
     * 
     * Konsep yang dipelajari:
     * - clearInterval untuk stop timer
     * - Complete game state reset
     * - UI state management
     * - Audio feedback
     */
    restartGame() {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playAction('click');
        }
        
        // ===== STOP CURRENT GAME =====
        // clearInterval menghentikan timer yang sedang berjalan
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // ===== RESET GAME STATE =====
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        
        // ===== UPDATE UI =====
        this.restartButton.style.display = 'none';
        this.startButton.style.display = 'inline-block';
        
        this.updateDisplay();
        this.updateStatus('Siap Main');
        this.draw();
    }
    
    /**
     * generateFood() - Generate posisi food baru secara acak
     * 
     * Konsep yang dipelajari:
     * - Math.random() untuk generate koordinat acak
     * - do-while loop
     * - Array.some() method untuk collision detection
     * - Object creation
     * - Collision avoidance
     */
    generateFood() {
        let newFood;
        let attempts = 0;
        const maxAttempts = 100; // Mencegah infinite loop
        
        // do-while loop: jalankan minimal sekali, lalu cek kondisi
        do {
            // Generate koordinat acak dalam range 0 sampai tileCount-1
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
            
            // Cek apakah food tidak overlap dengan snake
            // some() return true jika ada elemen yang memenuhi kondisi
            // Jika overlap, generate ulang
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) && attempts < maxAttempts);
        
        return newFood;
    }
    
    /**
     * update() - Update game state setiap frame
     * 
     * Konsep yang dipelajari:
     * - Game loop logic
     * - Collision detection
     * - Snake movement mechanics
     * - Food eating mechanics
     * - Array manipulation (unshift, pop)
     * - Audio feedback untuk game events
     */
    update() {
        if (!this.gameRunning) return;
        // Buka kunci arah di awal tick sehingga hanya 1 perubahan arah/tick
        this.directionLocked = false;
        
        // ===== CALCULATE NEW HEAD POSITION =====
        // Buat posisi kepala baru berdasarkan direction saat ini
        const newHead = {
            x: this.snake[0].x + this.dx,  // snake[0] adalah kepala
            y: this.snake[0].y + this.dy
        };
        
        // ===== WALL COLLISION DETECTION =====
        // Cek apakah kepala baru menabrak dinding
        if (newHead.x < 0 || newHead.x >= this.tileCount || 
            newHead.y < 0 || newHead.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // ===== SELF COLLISION DETECTION =====
        // slice(1) mengambil semua elemen kecuali kepala (index 0)
        // some() mengecek apakah ada segment yang overlap dengan kepala baru
        if (this.snake.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.gameOver();
            return;
        }
        
        // ===== MOVE SNAKE =====
        // unshift() menambah elemen baru di awal array (menjadi kepala)
        this.snake.unshift(newHead);
        
        // ===== FOOD COLLISION DETECTION =====
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            // Snake makan food
            this.score += 10;
            
            // ===== AUDIO =====
            if (this.audioManager) {
                this.audioManager.playAction('eat');
            }
            
            this.food = this.generateFood(); // Generate food baru
            // Tidak perlu pop() karena snake bertambah panjang
        } else {
            // Snake tidak makan food
            this.snake.pop(); // Hapus ekor (snake tidak bertambah panjang)
        }
        
        // ===== UPDATE GAME =====
        this.updateDisplay();
        this.draw();
    }
    
    /**
     * gameOver() - Handle game over state
     * 
     * Konsep yang dipelajari:
     * - Game state management
     * - Canvas drawing untuk game over screen
     * - Text rendering pada canvas
     * - UI state changes
     * - Audio feedback untuk game over
     */
    gameOver() {
        this.gameRunning = false;
        
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('over');
        }
        
        // Stop game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Show restart button
        this.restartButton.style.display = 'inline-block';
        this.updateStatus('Game Over!');
        
        // ===== DRAW GAME OVER SCREEN =====
        // fillRect menggambar rectangle merah transparan
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // fillText menggambar text putih
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillText(`Skor: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    /**
     * updateDisplay() - Update UI elements
     * 
     * Konsep yang dipelajari:
     * - Null checking untuk safety
     * - DOM manipulation
     */
    updateDisplay() {
        // Null checking: hanya update jika elemen ada
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.lengthElement) this.lengthElement.textContent = this.snake.length;
    }
    
    /**
     * updateStatus() - Update game status display
     * 
     * Konsep yang dipelajari:
     * - Null checking untuk safety
     * - Function parameters
     */
    updateStatus(status) {
        if (this.gameStatusElement) this.gameStatusElement.textContent = status;
    }
    
    /**
     * draw() - Render game pada canvas
     * 
     * Konsep yang dipelajari:
     * - Canvas drawing methods
     * - For loops untuk grid drawing
     * - Array.forEach() untuk rendering
     * - Color management
     * - Coordinate calculations
     */
    draw() {
        if (!this.ctx) return;
        
        // ===== CLEAR CANVAS =====
        // fillRect menggambar rectangle hitam untuk background
        this.ctx.fillStyle = '#0a0a14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ===== DRAW GRID =====
        // Grid membantu visualisasi movement
        this.ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // ===== DRAW SNAKE =====
        // forEach menjalankan fungsi untuk setiap segment snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head: warna pink
                this.ctx.fillStyle = '#ff0000';
            } else {
                // Body: warna hijau
                this.ctx.fillStyle = '#00ff9d';
            }
            
            // fillRect menggambar rectangle untuk setiap segment
            // +1 dan -2 memberikan margin kecil antar segment
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // ===== DRAW FOOD =====
        if (this.food) {
            this.ctx.fillStyle = '#ff6b6b'; // Warna merah
            this.ctx.fillRect(
                this.food.x * this.gridSize + 2,
                this.food.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
        }
    }
}

// ===== GAME INITIALIZATION =====
// DOMContentLoaded event terjadi setelah semua HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Buat instance baru dari class SnakeGame
        new SnakeGame();
        console.log('Snake Game with Audio initialized successfully');
    } catch (error) {
        // Error handling jika ada masalah saat inisialisasi
        console.error('Error initializing Snake Game with Audio:', error);
    }
});
