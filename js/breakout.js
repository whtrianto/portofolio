/**
 * 🏓 CYBER BREAKOUT GAME - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat lanjut:
 * - ES6 Classes dan Object-Oriented Programming
 * - Canvas API untuk 2D graphics dan animation
 * - Game physics (ball bouncing, collision detection)
 * - requestAnimationFrame untuk smooth game loop
 * - Mouse event handling dan coordinate systems
 * - Power-up system dan game progression
 * - Level management dan difficulty scaling
 * - Complex collision detection algorithms
 * - Game state management
 * - Audio integration dengan AudioManager
 */

/**
 * Class CyberBreakout - Main game controller untuk breakout game
 * 
 * Konsep yang dipelajari:
 * - ES6 Class syntax
 * - Constructor method
 * - Instance properties dan methods
 * - Game object representation
 * - Physics simulation
 */
class CyberBreakout {
    /**
     * Constructor - Inisialisasi game state dan setup
     * 
     * Konsep yang dipelajari:
     * - Canvas setup dan 2D context
     * - Game state variables
     * - Object properties untuk game entities
     * - Array initialization
     * - Method chaining
     */
    constructor() {
        // ===== CANVAS SETUP =====
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d'); // 2D rendering context
        
        // ===== GAME STATE =====
        this.gameRunning = false;  // Boolean flag untuk game loop
        this.gameOver = false;     // Boolean flag untuk game over state
        this.score = 0;            // Skor saat ini
        this.level = 1;            // Level saat ini
        this.lives = 5;            // Sisa nyawa
        this.highScore = localStorage.getItem('cyberBreakoutHighScore') || 0; // High score dari localStorage
        
        // ===== PADDLE PROPERTIES =====
        // Object berisi semua properti paddle
        this.paddle = {
            x: this.canvas.width / 2 - 50,  // Posisi X (center canvas)
            y: this.canvas.height - 30,      // Posisi Y (dekat bawah)
            width: 100,                      // Lebar paddle
            height: 15,                      // Tinggi paddle
            speed: 8,                        // Kecepatan paddle
            holdSpeed: 8,                   // Kecepatan ketika tombol ditahan
            isMovingLeft: false,             // Flag untuk tombol kiri ditahan
            isMovingRight: false,            // Flag untuk tombol kanan ditahan
            holdTimer: null                  // Timer untuk hold movement
        };
        
        // ===== BALL PROPERTIES =====
        // Object berisi semua properti bola
        this.ball = {
            x: this.canvas.width / 2,       // Posisi X (center canvas)
            y: this.canvas.height - 50,     // Posisi Y (di atas paddle)
            radius: 8,                       // Radius bola
            dx: 4,                          // Kecepatan horizontal
            dy: -4,                         // Kecepatan vertical (negatif = ke atas)
            speed: 4,                       // Kecepatan dasar bola
            baseSpeed: 4                    // Kecepatan dasar untuk reset
        };
        
        // ===== BLOCK PROPERTIES =====
        this.blocks = [];                   // Array untuk menyimpan semua block
        this.blockRows = 5;                 // Jumlah baris block
        this.blockCols = 10;                // Jumlah kolom block
        this.blockWidth = 70;               // Lebar setiap block
        this.blockHeight = 25;              // Tinggi setiap block
        this.blockPadding = 5;              // Jarak antar block
        
        // ===== POWER-UP SYSTEM =====
        this.powerUps = [];                 // Array untuk menyimpan power-up yang aktif
        this.powerUpTypes = ['wide', 'narrow', 'fast', 'slow', 'life']; // Jenis power-up
        this.activePowerUps = {};           // Object untuk tracking power-up yang aktif
        this.powerUpTimers = {};            // Object untuk timer power-up
        this.powerUpCountdowns = {};       // Object untuk interval countdown power-up
        
        // ===== UI ELEMENTS =====
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.livesElement = document.getElementById('lives');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // ===== AUDIO INTEGRATION =====
        this.audioManager = window.audioManager;
        
        // ===== INITIALIZATION =====
        this.bindEvents();        // Setup event listeners
        this.initBlocks();        // Inisialisasi blocks
        this.updateDisplay();     // Update tampilan awal
        this.draw();              // Draw initial game state
    }
    
    /**
     * bindEvents() - Setup semua event listeners
     * 
     * Konsep yang dipelajari:
     * - Event listeners untuk buttons
     * - Mouse movement handling
     * - Canvas coordinate system
     * - Boundary checking
     * - Click event handling
     * - Mobile touch controls
     */
    bindEvents() {
        this.startButton.addEventListener('click', () => {
            // ===== AUDIO =====
            if (this.audioManager) {
                this.audioManager.playAction('click');
            }
            this.startGame();
        });
        
        this.restartButton.addEventListener('click', () => {
            // ===== AUDIO =====
            if (this.audioManager) {
                this.audioManager.playAction('click');
            }
            this.restartGame();
        });
        
        // ===== MOUSE MOVEMENT FOR PADDLE =====
        // 'mousemove' event terjadi setiap kali mouse bergerak
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameRunning && !this.gameOver) {
                // getBoundingClientRect() memberikan posisi canvas relatif terhadap viewport
                const rect = this.canvas.getBoundingClientRect();
                
                // e.clientX adalah posisi mouse relatif terhadap viewport
                // rect.left adalah posisi kiri canvas relatif terhadap viewport
                // Hasil: posisi mouse relatif terhadap canvas
                const mouseX = e.clientX - rect.left;
                
                // Set posisi paddle ke posisi mouse (center paddle pada mouse)
                this.paddle.x = mouseX - this.paddle.width / 2;
                
                // ===== BOUNDARY CHECKING =====
                // Pastikan paddle tidak keluar dari canvas
                if (this.paddle.x < 0) this.paddle.x = 0;
                if (this.paddle.x + this.paddle.width > this.canvas.width) {
                    this.paddle.x = this.canvas.width - this.paddle.width;
                }
            }
        });
        
        // ===== CLICK TO LAUNCH BALL =====
        // Click pada canvas meluncurkan bola
        this.canvas.addEventListener('click', () => {
            // Hanya launch jika game running, belum game over, dan bola masih di posisi awal
            if (this.gameRunning && !this.gameOver && this.ball.y === this.canvas.height - 50) {
                this.launchBall();
            }
        });
        
        // Event listener untuk mobile controls
        this.bindMobileControls();
        
        // Add touch gesture support for mobile
        this.setupTouchGestures();
    }
    
    /**
     * bindMobileControls() - Setup event listeners untuk kontrol mobile
     */
    bindMobileControls() {
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');
        const launchButton = document.getElementById('launchButton');
        
        if (leftButton) {
            // Click event untuk single movement
            leftButton.addEventListener('click', () => this.handleMobileInput('left'));
            
            // Mousedown event untuk hold movement
            leftButton.addEventListener('mousedown', () => this.startHoldMovement('left'));
            leftButton.addEventListener('mouseup', () => this.stopHoldMovement('left'));
            leftButton.addEventListener('mouseleave', () => this.stopHoldMovement('left'));
            
            // Touch events untuk mobile
            leftButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startHoldMovement('left');
            });
            leftButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopHoldMovement('left');
            });
            leftButton.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.stopHoldMovement('left');
            });
        }
        
        if (rightButton) {
            // Click event untuk single movement
            rightButton.addEventListener('click', () => this.handleMobileInput('right'));
            
            // Mousedown event untuk hold movement
            rightButton.addEventListener('mousedown', () => this.startHoldMovement('right'));
            rightButton.addEventListener('mouseup', () => this.stopHoldMovement('right'));
            rightButton.addEventListener('mouseleave', () => this.stopHoldMovement('right'));
            
            // Touch events untuk mobile
            rightButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startHoldMovement('right');
            });
            rightButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopHoldMovement('right');
            });
            rightButton.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.stopHoldMovement('right');
            });
        }
        
        if (launchButton) {
            launchButton.addEventListener('click', () => this.handleMobileInput('launch'));
            launchButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileInput('launch');
            });
        }
    }
    
    /**
     * handleMobileInput() - Handle input dari tombol kontrol mobile
     */
    handleMobileInput(action) {
        if (!this.gameRunning || this.gameOver) return;
        
        switch(action) {
            case 'left':
                this.movePaddleLeft();
                break;
            case 'right':
                this.movePaddleRight();
                break;
            case 'launch':
                if (this.ball.y === this.canvas.height - 50) {
                    this.launchBall();
                }
                break;
        }
    }
    
    /**
     * startHoldMovement() - Mulai hold movement untuk paddle
     */
    startHoldMovement(direction) {
        if (this.gameOver) return;
        
        if (direction === 'left') {
            this.paddle.isMovingLeft = true;
            const leftButton = document.getElementById('leftButton');
            if (leftButton) leftButton.classList.add('holding');
        } else if (direction === 'right') {
            this.paddle.isMovingRight = true;
            const rightButton = document.getElementById('rightButton');
            if (rightButton) rightButton.classList.add('holding');
        }
    }

    /**
     * stopHoldMovement() - Hentikan hold movement untuk paddle
     */
    stopHoldMovement(direction) {
        if (direction === 'left') {
            this.paddle.isMovingLeft = false;
            const leftButton = document.getElementById('leftButton');
            if (leftButton) leftButton.classList.remove('holding');
        } else if (direction === 'right') {
            this.paddle.isMovingRight = false;
            const rightButton = document.getElementById('rightButton');
            if (rightButton) rightButton.classList.remove('holding');
        }
    }
    
    /**
     * movePaddleLeft() - Gerakkan paddle ke kiri
     */
    movePaddleLeft() {
        this.paddle.x -= this.paddle.speed;
        if (this.paddle.x < 0) this.paddle.x = 0;
    }
    
    /**
     * movePaddleRight() - Gerakkan paddle ke kanan
     */
    movePaddleRight() {
        this.paddle.x += this.paddle.speed;
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }
    }
    
    /**
     * setupTouchGestures() - Setup touch gesture detection untuk mobile
     */
    setupTouchGestures() {
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
            
            this.handleTouchGesture(startX, startY, endX, endY);
        }, { passive: false });
        
        // Touch move untuk paddle control
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameRunning && !this.gameOver) {
                const rect = this.canvas.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                
                this.paddle.x = touchX - this.paddle.width / 2;
                
                // Boundary checking
                if (this.paddle.x < 0) this.paddle.x = 0;
                if (this.paddle.x + this.paddle.width > this.canvas.width) {
                    this.paddle.x = this.canvas.width - this.paddle.width;
                }
            }
        }, { passive: false });
    }
    
    /**
     * handleTouchGesture() - Process touch gesture dan convert ke action
     */
    handleTouchGesture(startX, startY, endX, endY) {
        if (!this.gameRunning || this.gameOver) return;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 30; // Minimum distance untuk swipe
        
        // Cek apakah swipe cukup jauh
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            // Tap gesture - launch ball
            if (this.ball.y === this.canvas.height - 50) {
                this.launchBall();
            }
            return;
        }
        
        // Determine direction berdasarkan delta yang lebih besar
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                // Swipe ke kanan
                this.movePaddleRight();
            } else {
                // Swipe ke kiri
                this.movePaddleLeft();
            }
        }
    }
    
    /**
     * initBlocks() - Inisialisasi grid blocks
     * 
     * Konsep yang dipelajari:
     * - Nested for loops untuk 2D grid
     * - Object creation dalam loops
     * - Coordinate calculation
     * - Array.push() method
     */
    initBlocks() {
        this.blocks = [];
        
        // Nested loops untuk membuat grid 5x10
        for (let row = 0; row < this.blockRows; row++) {
            for (let col = 0; col < this.blockCols; col++) {
                // Buat object block dengan properti lengkap
                const block = {
                    x: col * (this.blockWidth + this.blockPadding) + this.blockPadding,
                    y: row * (this.blockHeight + this.blockPadding) + this.blockPadding + 50,
                    width: this.blockWidth,
                    height: this.blockHeight,
                    visible: true,                    // Block terlihat
                    color: this.getBlockColor(row)    // Warna berdasarkan baris
                };
                
                this.blocks.push(block);
            }
        }
    }
    
    /**
     * getBlockColor() - Mendapatkan warna block berdasarkan baris
     * 
     * Konsep yang dipelajari:
     * - Array indexing
     * - Fallback values dengan || operator
     * - Color management
     */
    getBlockColor(row) {
        const colors = ['#ff8000', '#ffff00', '#00ff00', '#0080ff', '#ff00ff'];
        return colors[row] || '#ff0000'; // Default pink jika row > 4
    }
    
    /**
     * launchBall() - Meluncurkan bola dengan arah random
     * 
     * Konsep yang dipelajari:
     * - Math.random() untuk random direction
     * - Conditional operator (ternary)
     * - Object property modification
     */
    launchBall() {
        // Math.random() > 0.5: 50% kemungkinan ke kiri atau kanan
        this.ball.dx = Math.random() > 0.5 ? this.ball.speed : -this.ball.speed;
        this.ball.dy = -this.ball.speed; // Selalu ke atas
    }
    
    /**
     * startGame() - Memulai game
     * 
     * Konsep yang dipelajari:
     * - Game state initialization
     * - Object property reset
     * - UI state changes
     * - Game loop initialization
     * - Power-up cleanup
     */
    startGame() {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('start');
        }
        
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.ball.speed = this.ball.baseSpeed; // Reset kecepatan bola ke awal
        
        // ===== CLEAR ACTIVE POWER-UPS =====
        this.clearAllPowerUps();
        
        this.initBlocks();        // Reset blocks
        this.resetBall();         // Reset bola
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'none';
        this.updateStatus('Ready!');
        
        this.gameLoop();          // Mulai game loop
    }
    
    /**
     * restartGame() - Restart game dari awal
     * 
     * Konsep yang dipelajari:
     * - Complete game state reset
     * - UI restoration
     * - Method chaining
     * - Power-up cleanup
     */
    restartGame() {
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.ball.speed = this.ball.baseSpeed; // Reset kecepatan bola ke awal
        
        // ===== CLEAR ACTIVE POWER-UPS =====
        this.clearAllPowerUps();
        
        this.initBlocks();
        this.resetBall();
        this.restartButton.style.display = 'none';
        this.startButton.style.display = 'inline-block';
        this.updateStatus('Siap Main!');
        
        this.updateDisplay();
        this.draw();
    }
    
    /**
     * resetBall() - Reset bola ke posisi awal
     * 
     * Konsep yang dipelajari:
     * - Object property reset
     * - Canvas center calculation
     */
    resetBall() {
        this.ball.x = this.canvas.width / 2;  // Center horizontal
        this.ball.y = this.canvas.height - 50; // Di atas paddle
        this.ball.dx = 0;                     // Tidak bergerak horizontal
        this.ball.dy = 0;                     // Tidak bergerak vertical
    }
    
    /**
     * update() - Update game state setiap frame
     * 
     * Konsep yang dipelajari:
     * - Game loop logic
     * - Physics calculations
     * - Collision detection
     * - Game progression
     */
    update() {
        if (!this.gameRunning) return;
        
        // ===== UPDATE BALL POSITION =====
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // ===== BALL COLLISION WITH WALLS =====
        // Bounce off left and right walls
        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx; // Reverse horizontal direction
        }
        
        // Bounce off top wall
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy; // Reverse vertical direction
        }
        
        // ===== HOLD MOVEMENT FOR PADDLE =====
        // Handle continuous movement ketika tombol ditahan
        if (this.paddle.isMovingLeft) {
            this.paddle.x -= this.paddle.holdSpeed;
            if (this.paddle.x < 0) this.paddle.x = 0;
        }
        
        if (this.paddle.isMovingRight) {
            this.paddle.x += this.paddle.holdSpeed;
            if (this.paddle.x + this.paddle.width > this.canvas.width) {
                this.paddle.x = this.canvas.width - this.paddle.width;
            }
        }
        
        // ===== BALL COLLISION WITH PADDLE =====
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            
            // ===== CALCULATE BOUNCE ANGLE =====
            // hitPoint: 0 = kiri paddle, 0.5 = tengah, 1 = kanan paddle
            const hitPoint = (this.ball.x - this.paddle.x) / this.paddle.width;
            
            // angle: -30° sampai +30° (dalam radians)
            const angle = (hitPoint - 0.5) * Math.PI / 3;
            
            // Set velocity berdasarkan angle
            this.ball.dx = this.ball.speed * Math.sin(angle);
            this.ball.dy = -this.ball.speed * Math.cos(angle);
        }
        
        // ===== BALL FALLS BELOW PADDLE =====
        if (this.ball.y + this.ball.radius > this.canvas.height) {
            // ===== AUDIO LOSE LIFE =====
            if (this.audioManager) {
                this.audioManager.playAction('wrong');
                // Play defeat sound after a short delay for more dramatic effect
                setTimeout(() => {
                    this.audioManager.playGameEvent('defeat');
                }, 300);
            }
            
            this.lives--; // Kurangi nyawa
            this.updateDisplay();
            
            if (this.lives <= 0) {
                this.endGame(); // Game over jika tidak ada nyawa
            } else {
                this.resetBall(); // Reset bola jika masih ada nyawa
                this.updateStatus(`Bola jatuh! Sisa Nyawa: ${this.lives}`);
            }
        }
        
        // ===== CHECK BLOCK COLLISIONS =====
        this.checkBlockCollisions();
        
        // ===== UPDATE POWER-UPS =====
        this.updatePowerUps();
        
        // ===== CHECK LEVEL COMPLETION =====
        // every() return true jika semua block tidak visible
        if (this.blocks.every(block => !block.visible)) {
            this.nextLevel();
        }
    }
    
    /**
     * checkBlockCollisions() - Deteksi collision antara bola dan blocks
     * 
     * Konsep yang dipelajari:
     * - Rectangle-circle collision detection
     * - Collision response algorithms
     * - Power-up drops
     * - Score management
     */
    checkBlockCollisions() {
        this.blocks.forEach(block => {
            if (block.visible) {
                // ===== COLLISION DETECTION =====
                // Cek apakah bola overlap dengan block
                if (this.ball.x + this.ball.radius > block.x &&
                    this.ball.x - this.ball.radius < block.x + block.width &&
                    this.ball.y + this.ball.radius > block.y &&
                    this.ball.y - this.ball.radius < block.y + block.height) {
                    
                    // ===== DETERMINE COLLISION SIDE =====
                    // Hitung center bola dan block
                    const ballCenterX = this.ball.x;
                    const ballCenterY = this.ball.y;
                    const blockCenterX = block.x + block.width / 2;
                    const blockCenterY = block.y + block.height / 2;
                    
                    // Hitung jarak horizontal dan vertical
                    const dx = ballCenterX - blockCenterX;
                    const dy = ballCenterY - blockCenterY;
                    
                    // ===== BOUNCE RESPONSE =====
                    // Jika jarak horizontal > vertical, collision horizontal
                    if (Math.abs(dx) > Math.abs(dy)) {
                        this.ball.dx = -this.ball.dx; // Reverse horizontal
                    } else {
                        this.ball.dy = -this.ball.dy; // Reverse vertical
                    }
                    
                    // ===== BLOCK DESTRUCTION =====
                    block.visible = false; // Sembunyikan block
                    this.score += 10;      // Tambah skor
                    
                    // ===== AUDIO =====
                    if (this.audioManager) {
                        this.audioManager.playAction('break');
                    }
                    
                    // ===== POWER-UP DROP =====
                    // 10% kemungkinan drop power-up
                    if (Math.random() < 0.1) {
                        this.dropPowerUp(block.x + block.width / 2, block.y + block.height);
                    }
                    
                    this.updateDisplay();
                }
            }
        });
    }
    
    /**
     * dropPowerUp() - Drop power-up dari block yang hancur
     * 
     * Konsep yang dipelajari:
     * - Math.random() untuk random selection
     * - Object creation
     * - Array.push() method
     */
    dropPowerUp(x, y) {
        // Pilih jenis power-up secara random
        const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        
        // Buat object power-up baru
        this.powerUps.push({
            x: x,                    // Posisi X (center block)
            y: y,                    // Posisi Y (bawah block)
            width: 20,               // Lebar power-up
            height: 20,              // Tinggi power-up
            type: type,              // Jenis power-up
            speed: 2                 // Kecepatan jatuh
        });
    }
    
    /**
     * updatePowerUps() - Update posisi dan collision power-ups
     * 
     * Konsep yang dipelajari:
     * - Array manipulation dengan splice
     * - Collision detection
     * - Power-up application
     */
    updatePowerUps() {
        this.powerUps.forEach((powerUp, index) => {
            // ===== MOVE POWER-UP DOWN =====
            powerUp.y += powerUp.speed;
            
            // ===== CHECK COLLISION WITH PADDLE =====
            if (powerUp.y + powerUp.height > this.paddle.y &&
                powerUp.x > this.paddle.x &&
                powerUp.x < this.paddle.x + this.paddle.width) {
                
                this.applyPowerUp(powerUp.type);     // Terapkan power-up
                this.powerUps.splice(index, 1);      // Hapus power-up
            }
            
            // ===== REMOVE OFF-SCREEN POWER-UPS =====
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    /**
     * applyPowerUp() - Terapkan efek power-up
     * 
     * Konsep yang dipelajari:
     * - Switch statements
     * - Math.min() dan Math.max() untuk clamping
     * - Object property modification
     * - setTimeout untuk temporary effects
     * - Power-up timer management
     */
    applyPowerUp(type) {
        switch(type) {
            case 'wide':
                // Perlebar paddle (temporary effect - 5 detik)
                this.applyTemporaryPowerUp('wide', () => {
                    this.paddle.width = Math.min(this.paddle.width * 1.5, 200);
                }, () => {
                    this.paddle.width = Math.max(this.paddle.width / 1.5, 100); // Kembali ke ukuran normal
                }, 5000); // 5 detik
                break;
            case 'narrow':
                // Kecilkan paddle (temporary effect - 5 detik)
                this.applyTemporaryPowerUp('narrow', () => {
                    this.paddle.width = Math.max(this.paddle.width * 0.7, 50);
                }, () => {
                    this.paddle.width = Math.min(this.paddle.width / 0.7, 100); // Kembali ke ukuran normal
                }, 5000); // 5 detik
                break;
            case 'fast':
                // Percepat bola (temporary effect - 5 detik)
                this.applyTemporaryPowerUp('fast', () => {
                    this.ball.speed *= 1.3;
                }, () => {
                    this.ball.speed /= 1.3;
                }, 5000); // 5 detik
                break;
            case 'slow':
                // Perlambat bola (temporary effect - 5 detik)
                this.applyTemporaryPowerUp('slow', () => {
                    this.ball.speed *= 0.7;
                }, () => {
                    this.ball.speed /= 0.7;
                }, 5000); // 5 detik
                break;
            case 'life':
                // Tambah 1 nyawa (permanent effect)
                this.lives++;
                this.updateDisplay(); // Update tampilan lives
                this.updateStatus('+1 Nyawa! ❤️');
                
                // Play audio effect jika tersedia
                if (this.audioManager) {
                    this.audioManager.playAction('collect');
                }
                break;
        }
    }
    
    /**
     * applyTemporaryPowerUp() - Terapkan power-up sementara dengan timer
     * 
     * Konsep yang dipelajari:
     * - setTimeout dan clearTimeout
     * - Callback functions
     * - Timer management
     * - Power-up state tracking
     */
    applyTemporaryPowerUp(type, applyEffect, removeEffect, duration = 5000) {
        // Jika power-up sudah aktif, JANGAN terapkan efek lagi. Hanya refresh timer & countdown.
        if (this.activePowerUps[type]) {
            // Reset timer yang lama
            if (this.powerUpTimers[type]) {
                clearTimeout(this.powerUpTimers[type]);
            }
            
            // Reset countdown interval jika ada
            if (this.powerUpCountdowns[type]) {
                clearInterval(this.powerUpCountdowns[type]);
            }
            
            // Mulai ulang countdown
            let remainingMs = duration;
            const updateCountdown = () => {
                const remainingSec = Math.ceil(remainingMs / 1000);
                this.updateStatus(this.getPowerUpStatusText(type, remainingSec));
                remainingMs -= 1000;
                if (remainingMs < 0) remainingMs = 0;
            };
            updateCountdown();
            this.powerUpCountdowns[type] = setInterval(updateCountdown, 1000);
            
            // Set timer baru untuk menghapus efek nanti
            this.powerUpTimers[type] = setTimeout(() => {
                clearInterval(this.powerUpCountdowns[type]);
                delete this.powerUpCountdowns[type];
                removeEffect();
                this.activePowerUps[type] = false;
                delete this.powerUpTimers[type];
                this.updateStatus('Efek power-up berakhir');
            }, duration);
            
            return; // Keluar agar tidak terjadi stacking efek
        }
        
        // Power-up belum aktif: terapkan efek sekali
        applyEffect();
        this.activePowerUps[type] = true;
        
        // Setup countdown tampilan status
        let remainingMs = duration;
        const updateCountdown = () => {
            const remainingSec = Math.ceil(remainingMs / 1000);
            this.updateStatus(this.getPowerUpStatusText(type, remainingSec));
            remainingMs -= 1000;
            if (remainingMs < 0) remainingMs = 0;
        };
        updateCountdown();
        this.powerUpCountdowns[type] = setInterval(updateCountdown, 1000);
        
        // Set timer untuk menghapus efek
        this.powerUpTimers[type] = setTimeout(() => {
            clearInterval(this.powerUpCountdowns[type]);
            delete this.powerUpCountdowns[type];
            removeEffect();
            this.activePowerUps[type] = false;
            delete this.powerUpTimers[type];
            this.updateStatus('Efek power-up berakhir');
        }, duration);
    }

    // Helper untuk teks status countdown per power-up
    getPowerUpStatusText(type, remainingSec) {
        switch(type) {
            case 'wide':
                return `Paddle diperlebar! 📏 (${remainingSec}s)`;
            case 'narrow':
                return `Paddle dikecilkan! 🔪 (${remainingSec}s)`;
            case 'fast':
                return `Bola dipercepat! ⚡ (${remainingSec}s)`;
            case 'slow':
                return `Bola diperlambat! 🐌 (${remainingSec}s)`;
            default:
                return `Power-up aktif (${remainingSec}s)`;
        }
    }
    
    /**
     * nextLevel() - Naik ke level berikutnya
     * 
     * Konsep yang dipelajari:
     * - Level progression
     * - Difficulty scaling
     * - Game state reset
     * - Power-up cleanup
     * - Audio feedback untuk level completion
     */
    nextLevel() {
        // ===== AUDIO VICTORY =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('win');
            // Play additional victory sound after a short delay
            // setTimeout(() => {
            //     this.audioManager.playAction('victory');
            // }, 1000);
        }
        
        this.level++;                    // Naik level
        this.ball.speed += 0.7;          // Tambah kecepatan bola
        
        // ===== CLEAR ACTIVE POWER-UPS =====
        this.clearAllPowerUps();
        
        this.initBlocks();               // Reset blocks
        this.resetBall();                // Reset bola
        this.updateStatus(`Level ${this.level}! Semakin sulit! 🎯`);
        this.updateDisplay();
    }
    
    /**
     * endGame() - Akhiri game
     * 
     * Konsep yang dipelajari:
     * - Game state management
     * - UI state changes
     * - Power-up cleanup
     */
    endGame() {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('over');
        }
        
        // ===== HIGH SCORE CHECKING =====
        if (this.score > this.highScore) {
            this.highScore = this.score;
            // Simpan high score baru ke localStorage
            localStorage.setItem('cyberBreakoutHighScore', this.highScore);
        }
        
        // ===== CLEAR ACTIVE POWER-UPS =====
        this.clearAllPowerUps();
        
        this.gameOver = true;
        this.gameRunning = false;
        this.restartButton.style.display = 'inline-block';
        this.updateStatus('Game Over! Kamu kalah! 😔');
    }
    
    /**
     * clearAllPowerUps() - Hapus semua power-up yang aktif
     * 
     * Konsep yang dipelajari:
     * - Object iteration dengan Object.keys()
     * - clearTimeout untuk cleanup
     * - Power-up state reset
     */
    clearAllPowerUps() {
        // Clear semua timer power-up
        Object.keys(this.powerUpTimers).forEach(type => {
            clearTimeout(this.powerUpTimers[type]);
        });
        
        // Reset power-up state
        this.activePowerUps = {};
        this.powerUpTimers = {};
        this.powerUpCountdowns = {}; // Clear countdown timers
        this.powerUps = []; // Clear power-up objects yang sedang jatuh
    }
    
    /**
     * draw() - Render semua game elements
     * 
     * Konsep yang dipelajari:
     * - Canvas drawing methods
     * - Method organization
     * - Drawing order (background -> objects -> UI)
     */
    draw() {
        // ===== CLEAR CANVAS =====
        this.ctx.fillStyle = '#0a0a14'; // Warna background gelap
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ===== DRAW BACKGROUND =====
        this.drawBackground();
        
        // ===== DRAW GAME OBJECTS =====
        this.drawBlocks();
        this.drawPaddle();
        this.drawBall();
        this.drawPowerUps();
        
        // ===== DRAW UI OVERLAY =====
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    /**
     * drawBackground() - Gambar background grid
     * 
     * Konsep yang dipelajari:
     * - Canvas stroke methods
     * - For loops untuk grid drawing
     * - Line drawing dengan beginPath, moveTo, lineTo
     */
    drawBackground() {
        this.ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)'; // Warna grid transparan
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * drawBlocks() - Gambar semua blocks
     * 
     * Konsep yang dipelajari:
     * - forEach loop dengan drawing
     * - Conditional drawing (hanya visible blocks)
     * - Canvas rectangle drawing
     * - Stroke untuk borders
     */
    drawBlocks() {
        this.blocks.forEach(block => {
            if (block.visible) {
                // Fill block dengan warna
                this.ctx.fillStyle = block.color;
                this.ctx.fillRect(block.x, block.y, block.width, block.height);
                
                // Border putih
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(block.x, block.y, block.width, block.height);
            }
        });
    }
    
    /**
     * drawPaddle() - Gambar paddle dengan glow effect
     * 
     * Konsep yang dipelajari:
     * - Canvas shadow effects
     * - Rectangle drawing
     * - Stroke untuk borders
     */
    drawPaddle() {
        // ===== PADDLE GLOW =====
        this.ctx.shadowColor = '#ff0000'; // Warna shadow coklat
        this.ctx.shadowBlur = 20;         // Intensitas blur
        this.ctx.fillStyle = '#ff0000';   // Warna paddle coklat
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.shadowBlur = 0;          // Reset shadow
        
        // ===== PADDLE BORDER =====
        this.ctx.strokeStyle = '#886441'; // Border merah
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    }
    
    /**
     * drawBall() - Gambar bola dengan glow effect
     * 
     * Konsep yang dipelajari:
     * - Canvas arc method untuk lingkaran
     * - Shadow effects
     * - Stroke untuk borders
     */
    drawBall() {
        // ===== BALL GLOW =====
        this.ctx.shadowColor = '#ffff'; // Warna shadow pink
        this.ctx.shadowBlur = 15;         // Intensitas blur
        this.ctx.fillStyle = '#ffff';   // Warna bola pink
        this.ctx.beginPath();
        // arc(x, y, radius, startAngle, endAngle)
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;          // Reset shadow
        
        // ===== BALL BORDER =====
        this.ctx.strokeStyle = '#ffffff'; // Border putih
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * drawPowerUps() - Gambar semua power-ups
     * 
     * Konsep yang dipelajari:
     * - Switch statements untuk color selection
     * - forEach loop dengan drawing
     * - Rectangle drawing
     */
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            // ===== COLOR SELECTION =====
            let color;
            switch(powerUp.type) {
                case 'wide': color = '#00ff00'; break;    // Hijau
                case 'narrow': color = '#b300ff'; break;  // Merah
                case 'fast': color = '#ffff00'; break;    // Kuning
                case 'slow': color = '#0080ff'; break;    // Biru
                case 'life': color = '#ff0000'; break;    // Pink
            }
            
            // ===== DRAW POWER-UP =====
            this.ctx.fillStyle = color;
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            
            // Border putih
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        });
    }
    
    /**
     * drawGameOver() - Gambar game over screen
     * 
     * Konsep yang dipelajari:
     * - Conditional drawing
     * - Text rendering pada canvas
     * - Font styling dan alignment
     */
    drawGameOver() {
        // ===== GAME OVER OVERLAY =====
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; // Background merah transparan
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ===== GAME OVER TEXT =====
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // ===== SCORE AND LEVEL TEXT =====
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Skor: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Level: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    /**
     * updateDisplay() - Update UI elements
     * 
     * Konsep yang dipelajari:
     * - DOM text content update
     * - Score, level, dan lives display
     */
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.livesElement.textContent = this.lives;
        this.highScoreElement.textContent = this.highScore;
    }
    
    /**
     * updateStatus() - Update game status display
     * 
     * Konsep yang dipelajari:
     * - Function parameters
     * - DOM text content update
     */
    updateStatus(status) {
        this.gameStatusElement.textContent = status;
    }
    
    /**
     * gameLoop() - Main game loop menggunakan requestAnimationFrame
     * 
     * Konsep yang dipelajari:
     * - requestAnimationFrame untuk smooth animation
     * - Recursive function calls
     * - Game loop architecture
     */
    gameLoop() {
        if (this.gameRunning) {
            this.update();  // Update game state
            this.draw();    // Render game
            // requestAnimationFrame memanggil gameLoop lagi pada frame berikutnya
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// ===== GAME INITIALIZATION =====
// DOMContentLoaded event terjadi setelah semua HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    try {
        new CyberBreakout(); // Buat instance baru dari game
        console.log('Cyber Breakout initialized successfully');
    } catch (error) {
        // Error handling jika ada masalah saat inisialisasi
        console.error('Error initializing Cyber Breakout:', error);
    }
});
