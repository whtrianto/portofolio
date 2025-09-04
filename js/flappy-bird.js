/**
 * 🐦 CYBER BIRD (FLAPPY BIRD CLONE) - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat lanjut:
 * - ES6 Classes dan Object-Oriented Programming
 * - Canvas API untuk 2D graphics dan animation
 * - Game physics (gravity, velocity, collision detection)
 * - requestAnimationFrame untuk smooth game loop
 * - Object-oriented game design
 * - Background animation dan parallax effects
 * - localStorage untuk high score persistence
 * - Event handling untuk keyboard dan mouse
 * - Game state management
 * - Audio integration dengan AudioManager
 */

/**
 * Class CyberBird - Main game controller untuk flappy bird game
 * 
 * Konsep yang dipelajari:
 * - ES6 Class syntax
 * - Constructor method
 * - Instance properties dan methods
 * - Game object representation
 * - Physics simulation
 */
class CyberBird {
    /**
     * Constructor - Inisialisasi game state dan setup
     * 
     * Konsep yang dipelajari:
     * - Canvas setup dan 2D context
     * - Game state variables
     * - Object properties untuk game entities
     * - Array initialization
     * - localStorage untuk data persistence
     */
    constructor() {
        // ===== CANVAS SETUP =====
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d'); // 2D rendering context
        
        // ===== GAME STATE =====
        this.gameRunning = false;  // Boolean flag untuk game loop
        this.gameOver = false;     // Boolean flag untuk game over state
        this.score = 0;            // Skor saat ini
        // localStorage.getItem() mengambil data yang tersimpan, || 0 adalah default value
        this.highScore = localStorage.getItem('cyberBirdHighScore') || 0;
        
        // ===== BIRD PROPERTIES =====
        // Object berisi semua properti burung
        this.bird = {
            x: 100,           // Posisi X (horizontal)
            y: 200,           // Posisi Y (vertical)
            width: 30,        // Lebar burung
            height: 30,       // Tinggi burung
            velocity: 0,      // Kecepatan vertical (positif = turun, negatif = naik)
            gravity: 0.3,     // Gaya gravitasi (mempercepat ke bawah) - DIKURANGI untuk lebih mudah
            jumpPower: -6     // Kekuatan lompat (negatif = ke atas) - DIKURANGI untuk kontrol lebih halus
        };
        
        // ===== PIPE PROPERTIES =====
        this.pipes = [];      // Array untuk menyimpan semua pipe
        this.pipeWidth = 60;  // Lebar pipe
        this.pipeGap = 180;   // Jarak antara pipe atas dan bawah - DIPERBESAR untuk lebih mudah
        this.pipeSpeed = 1.5; // Kecepatan pipe bergerak ke kiri - DIPERLAMBAT untuk lebih mudah
        this.basePipeSpeed = this.pipeSpeed; // Kecepatan dasar untuk scaling
        this.oscillationEnabled = false; // Aktif saat skor >= 20
        this.oscillationPhase = 0; // Fase osilasi
        
        // ===== BACKGROUND ELEMENTS =====
        this.backgroundY = 0; // Posisi Y untuk background scrolling
        this.stars = [];      // Array untuk menyimpan bintang-bintang
        this.generateStars(); // Generate bintang-bintang
        
        // ===== UI ELEMENTS =====
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.jumpButton = document.getElementById('jumpButton');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // ===== AUDIO INTEGRATION =====
        this.audioManager = window.audioManager;
        
        // ===== INITIALIZATION =====
        this.bindEvents();        // Setup event listeners
        this.updateDisplay();     // Update tampilan awal
        this.draw();              // Draw initial game state
    }
    
    /**
     * bindEvents() - Setup semua event listeners
     * 
     * Konsep yang dipelajari:
     * - Event listeners untuk buttons
     * - Keyboard event handling dengan key codes
     * - Mouse/touch event handling
     * - Event prevention (preventDefault)
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
        
        // ===== JUMP BUTTON =====
        this.jumpButton.addEventListener('click', () => {
            if (this.gameRunning && !this.gameOver) {
                this.jump();
            }
        });
        
        // ===== KEYBOARD CONTROLS =====
        // 'keydown' event terjadi setiap kali tombol ditekan
        document.addEventListener('keydown', (e) => {
            // e.code === 'Space' mengecek apakah tombol yang ditekan adalah spasi
            if (e.code === 'Space' && this.gameRunning && !this.gameOver) {
                e.preventDefault(); // Mencegah scroll halaman
                this.jump();
            }
        });
        
        // ===== MOUSE/TOUCH CONTROLS =====
        // Click pada canvas juga bisa membuat burung lompat
        this.canvas.addEventListener('click', () => {
            if (this.gameRunning && !this.gameOver) {
                this.jump();
            }
        });
    }
    
    /**
     * generateStars() - Generate bintang-bintang untuk background
     * 
     * Konsep yang dipelajari:
     * - Array initialization dengan loop
     * - Math.random() untuk random positioning
     * - Object creation dalam loop
     * - Canvas coordinate system
     */
    generateStars() {
        this.stars = [];
        // Generate 50 bintang
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,      // Random X position
                y: Math.random() * this.canvas.height,     // Random Y position
                size: Math.random() * 2 + 1,              // Random size (1-3)
                speed: Math.random() * 0.5 + 0.1          // Random speed (0.1-0.6)
            });
        }
    }
    
    /**
     * startGame() - Memulai game dengan countdown 3 detik
     * 
     * Konsep yang dipelajari:
     * - Game state management
     * - Object property reset
     * - UI state changes
     * - Game loop initialization
     * - setTimeout untuk countdown
     */
    startGame() {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('start');
        }
        
        // ===== RESET BIRD POSITION =====
        this.bird.y = 200;        // Reset posisi Y
        this.bird.velocity = 0;   // Reset velocity
        
        // ===== RESET PIPES =====
        this.pipes = [];          // Kosongkan array pipes
        
        // ===== UPDATE UI =====
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'none';
        this.jumpButton.style.display = 'inline-block'; // Tampilkan jump button langsung
        
        // ===== START COUNTDOWN =====
        this.startCountdown();
    }
    
    /**
     * startCountdown() - Menampilkan countdown 3 detik sebelum game dimulai
     * 
     * Konsep yang dipelajari:
     * - setTimeout untuk delay
     * - Recursive function calls
     * - UI updates selama countdown
     */
    startCountdown() {
        let countdown = 3;
        
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                this.updateStatus(`Mulai dalam ${countdown} detik`);
                this.draw(); // Update tampilan dengan status countdown
                countdown--;
            } else {
                clearInterval(countdownInterval);
                this.updateStatus('Terbang!');
                this.jumpButton.style.display = 'inline-block';
                
                // ===== START GAME =====
                this.gameRunning = true;
                this.gameOver = false;
                this.score = 0;
                
                // ===== START GAME LOOP =====
                this.gameLoop();
            }
        }, 1000); // Update setiap 1 detik
    }
    
    /**
     * restartGame() - Restart game dari awal
     * 
     * Konsep yang dipelajari:
     * - Game state reset
     * - UI restoration
     * - Method chaining
     */
    restartGame() {
        this.gameOver = false;
        this.score = 0;
        
        // ===== RESET BIRD =====
        this.bird.y = 200;
        this.bird.velocity = 0;
        
        // ===== RESET PIPES =====
        this.pipes = [];
        
        // ===== RESTORE UI =====
        this.jumpButton.style.display = 'none';
        this.restartButton.style.display = 'none';
        this.startButton.style.display = 'inline-block';
        this.updateStatus('Siap Terbang!');
        
        this.updateDisplay();
        this.draw();
    }
    
    /**
     * jump() - Membuat burung lompat
     * 
     * Konsep yang dipelajari:
     * - Physics simulation
     * - Object property modification
     * - Conditional logic
     */
    jump() {
        if (!this.gameOver) {
            // ===== AUDIO =====
            if (this.audioManager) {
                this.audioManager.playAction('jump');
            }
            
            // Set velocity ke nilai negatif (ke atas)
            this.bird.velocity = this.bird.jumpPower;
        }
    }
    
    /**
     * update() - Update game state setiap frame
     * 
     * Konsep yang dipelajari:
     * - Game loop logic
     * - Physics calculations
     * - Array manipulation
     * - Collision detection
     * - Boundary checking
     */
    update() {
        if (!this.gameRunning) return;
        
        // ===== UPDATE BIRD PHYSICS =====
        // Tambah gravitasi ke velocity
        this.bird.velocity += this.bird.gravity;
        // Update posisi Y berdasarkan velocity
        this.bird.y += this.bird.velocity;
        
        // ===== UPDATE BACKGROUND =====
        // Scrolling background effect
        this.backgroundY += 0.5;
        if (this.backgroundY > this.canvas.height) {
            this.backgroundY = 0; // Reset ke atas
        }
        
        // ===== UPDATE STARS =====
        // forEach loop melalui setiap bintang
        this.stars.forEach(star => {
            star.y += star.speed; // Gerakkan bintang ke bawah
            
            // Jika bintang keluar dari canvas, reset ke atas
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width; // Random X position
            }
        });
        
        // ===== GENERATE PIPES =====
        // Generate pipe baru jika:
        // 1. Tidak ada pipe sama sekali, atau
        // 2. Pipe terakhir sudah cukup jauh dari kanan
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 400) {
            this.generatePipe();
        }
        
        // ===== UPDATE PIPES =====
        // forEach loop dengan index untuk splice operation
        this.pipes.forEach((pipe, index) => {
            pipe.x -= this.pipeSpeed; // Gerakkan pipe ke kiri
            
            // ===== REMOVE OFF-SCREEN PIPES =====
            // Jika pipe sudah keluar dari canvas kiri
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(index, 1); // Hapus pipe dari array
                this.score++;                 // Tambah skor
                
                // ===== AUDIO =====
                if (this.audioManager) {
                    this.audioManager.playAction('collect');
                }
                
                this.updateDifficultyScaling();
                this.updateDisplay();         // Update tampilan
            }
        });
        
        // ===== COLLISION DETECTION =====
        this.checkCollisions();
        
        // ===== BOUNDARY CHECKING =====
        // Cek apakah burung menabrak batas atas atau bawah canvas
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) {
            this.endGame();
        }
    }
    
    /**
     * generatePipe() - Generate pipe baru
     * 
     * Konsep yang dipelajari:
     * - Math.random() untuk random positioning
     * - Object creation
     * - Array.push() method
     */
    generatePipe() {
        // Generate posisi Y untuk gap secara random
        // Math.random() * (canvas.height - pipeGap - 150) + 75
        // Memastikan gap tidak terlalu dekat dengan atas atau bawah - DIPERBESAR margin
        const gapY = Math.random() * (this.canvas.height - this.pipeGap - 150) + 75;
        
        // Buat object pipe baru
        this.pipes.push({
            x: this.canvas.width,        // Mulai dari kanan canvas
            gapY: gapY,                  // Posisi Y untuk gap (akan diubah saat osilasi)
            gapHeight: this.pipeGap,     // Tinggi gap
            baseGapY: gapY               // Simpan posisi dasar untuk osilasi
        });
    }
    
    /**
     * checkCollisions() - Deteksi collision antara burung dan pipe
     * 
     * Konsep yang dipelajari:
     * - Collision detection algorithms
     * - Rectangle collision checking
     * - Logical operators (&&)
     * - Method calls dalam loop
     */
    checkCollisions() {
        this.pipes.forEach(pipe => {
            // ===== CHECK COLLISION WITH TOP PIPE =====
            // Collision terjadi jika:
            // 1. Burung di sebelah kanan pipe kiri
            // 2. Burung di sebelah kiri pipe kanan
            // 3. Burung di atas pipe bawah
            if (this.bird.x < pipe.x + this.pipeWidth &&
                this.bird.x + this.bird.width > pipe.x &&
                this.bird.y < pipe.gapY) {
                this.endGame();
            }
            
            // ===== CHECK COLLISION WITH BOTTOM PIPE =====
            // Collision terjadi jika:
            // 1. Burung di sebelah kanan pipe kiri
            // 2. Burung di sebelah kiri pipe kanan
            // 3. Burung di bawah pipe atas
            if (this.bird.x < pipe.x + this.pipeWidth &&
                this.bird.x + this.bird.width > pipe.x &&
                this.bird.y + this.bird.height > pipe.gapY + pipe.gapHeight) {
                this.endGame();
            }
        });
    }
    
    /**
     * endGame() - Mengakhiri game
     * 
     * Konsep yang dipelajari:
     * - Game state management
     * - High score checking dan updating
     * - localStorage untuk data persistence
     * - UI state changes
     */
    endGame() {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('over');
        }
        
        this.gameOver = true;
        this.gameRunning = false;
        
        // ===== HIGH SCORE CHECKING =====
        if (this.score > this.highScore) {
            this.highScore = this.score;
            // Simpan high score baru ke localStorage
            localStorage.setItem('cyberBirdHighScore', this.highScore);
        }
        
        // ===== UPDATE UI =====
        this.jumpButton.style.display = 'none';
        this.restartButton.style.display = 'inline-block';
        this.updateStatus('Game Over!');
        this.updateDisplay();
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
        
        // ===== DRAW STARS =====
        this.drawStars();
        
        // ===== DRAW PIPES =====
        this.drawPipes();
        
        // ===== DRAW BIRD =====
        this.drawBird();
        
        // ===== DRAW UI OVERLAY =====
        this.drawUI();
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
     * drawStars() - Gambar bintang-bintang
     * 
     * Konsep yang dipelajari:
     * - Canvas arc method untuk lingkaran
     * - forEach loop dengan drawing
     * - Math.PI untuk lingkaran penuh
     */
    drawStars() {
        this.ctx.fillStyle = '#ffffff'; // Warna putih untuk bintang
        
        this.stars.forEach(star => {
            this.ctx.beginPath();
            // arc(x, y, radius, startAngle, endAngle)
            // Math.PI * 2 = lingkaran penuh (360 derajat)
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    /**
     * drawPipes() - Gambar semua pipe
     * 
     * Konsep yang dipelajari:
     * - Canvas rectangle drawing
     * - Stroke untuk border
     * - forEach loop dengan drawing
     */
    drawPipes() {
        this.ctx.fillStyle = '#00ff9d'; // Warna hijau untuk pipe
        
        // Update fase osilasi jika aktif
        if (this.oscillationEnabled) {
            this.oscillationPhase += 0.05; // Kecepatan osilasi
        }

        this.pipes.forEach(pipe => {
            // Terapkan osilasi vertikal pada posisi gap jika aktif
            if (this.oscillationEnabled && typeof pipe.baseGapY === 'number') {
                const amplitude = 25; // tinggi osilasi
                pipe.gapY = pipe.baseGapY + Math.sin(this.oscillationPhase + pipe.x * 0.01) * amplitude;
                // Clamp dalam batas aman
                const minGapTop = 50;
                const maxGapTop = this.canvas.height - this.pipeGap - 50;
                if (pipe.gapY < minGapTop) pipe.gapY = minGapTop;
                if (pipe.gapY > maxGapTop) pipe.gapY = maxGapTop;
            }
            // ===== TOP PIPE =====
            // fillRect(x, y, width, height)
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
            
            // ===== BOTTOM PIPE =====
            // Posisi Y = gapY + gapHeight
            // Tinggi = canvas.height - (gapY + gapHeight)
            this.ctx.fillRect(
                pipe.x, 
                pipe.gapY + pipe.gapHeight, 
                this.pipeWidth, 
                this.canvas.height - (pipe.gapY + pipe.gapHeight)
            );
            
            // ===== PIPE BORDERS =====
            this.ctx.strokeStyle = '#444'; // Warna pink untuk border
            this.ctx.lineWidth = 3;
            
            // Stroke untuk top pipe
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
            
            // Stroke untuk bottom pipe
            this.ctx.strokeRect(
                pipe.x, 
                pipe.gapY + pipe.gapHeight, 
                this.pipeWidth, 
                this.canvas.height - (pipe.gapY + pipe.gapHeight)
            );
        });
    }
    
    /**
     * drawBird() - Gambar burung
     * 
     * Konsep yang dipelajari:
     * - Canvas shadow effects
     * - Multiple drawing operations
     * - Circle drawing untuk mata
     */
    drawBird() {
        // ===== BIRD BODY =====
        this.ctx.fillStyle = '#2196f3'; // Warna pink untuk tubuh
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        
        // ===== BIRD GLOW EFFECT =====
        this.ctx.shadowColor = '#2196f3'; // Warna shadow
        this.ctx.shadowBlur = 20;         // Intensitas blur
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        this.ctx.shadowBlur = 0;          // Reset shadow
        
        // ===== BIRD EYE =====
        this.ctx.fillStyle = '#ffffff'; // Warna putih untuk mata
        this.ctx.beginPath();
        // Mata di posisi x+20, y+10 dengan radius 5
        this.ctx.arc(this.bird.x + 20, this.bird.y + 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ===== BIRD PUPIL =====
        this.ctx.fillStyle = '#000000'; // Warna hitam untuk pupil
        this.ctx.beginPath();
        // Pupil di posisi yang sama dengan mata tapi radius 2
        this.ctx.arc(this.bird.x + 20, this.bird.y + 10, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * drawUI() - Gambar UI overlay
     * 
     * Konsep yang dipelajari:
     * - Conditional drawing
     * - Text rendering pada canvas
     * - Font styling
     * - Text alignment
     */
    drawUI() {
        if (this.gameOver) {
            // ===== GAME OVER OVERLAY =====
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; // Background merah transparan
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // ===== GAME OVER TEXT =====
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            // ===== SCORE TEXT =====
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Skor: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
    
    /**
     * updateDisplay() - Update UI elements
     * 
     * Konsep yang dipelajari:
     * - DOM text content update
     * - Score display management
     */
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }
    
    /**
     * updateDifficultyScaling() - Tingkatkan kesulitan berdasarkan skor
     * - Setiap kenaikan 5 skor: kecepatan pipe bertambah sedikit
     * - Ketika skor >= 20: aktifkan pergerakan osilasi vertikal pada pipe
     */
    updateDifficultyScaling() {
        // Tambah speed setiap kelipatan 5
        const increments = Math.floor(this.score / 5);
        this.pipeSpeed = this.basePipeSpeed + increments * 0.3; // setiap 5 skor +0.3
        
        // Aktifkan osilasi saat skor >= 20
        if (!this.oscillationEnabled && this.score >= 20) {
            this.oscillationEnabled = true;
        }
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
        new CyberBird(); // Buat instance baru dari game
        console.log('Cyber Bird initialized successfully');
    } catch (error) {
        // Error handling jika ada masalah saat inisialisasi
        console.error('Error initializing Cyber Bird:', error);
    }
});
