/**
 * 🧩 2048 PUZZLE GAME - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat lanjut:
 * - ES6 Classes dan Object-Oriented Programming
 * - 2D Arrays dan nested loops
 * - Array methods (filter, map, concat, splice)
 * - Game logic dan algorithm implementation
 * - State management dan undo functionality
 * - localStorage untuk high score persistence
 * - Keyboard event handling
 * - Dynamic DOM creation dan manipulation
 * - Game state checking (win/lose conditions)
 * - Audio integration dengan AudioManager
 */

/**
 * Class Puzzle2048 - Main game controller untuk 2048 puzzle game
 * 
 * Konsep yang dipelajari:
 * - ES6 Class syntax
 * - Constructor method
 * - Instance properties dan methods
 * - 2D array representation untuk game board
 * - Game state tracking
 */
class Puzzle2048 {
    /**
     * Constructor - Inisialisasi game state dan setup
     * 
     * Konsep yang dipelajari:
     * - Game state variables
     * - localStorage untuk data persistence
     * - DOM element selection
     * - Method chaining
     */
    constructor() {
        // ===== GAME STATE VARIABLES =====
        this.board = [];                    // 2D array untuk game board (4x4)
        this.score = 0;                     // Skor saat ini
        // localStorage.getItem() mengambil high score yang tersimpan, || 0 adalah default value
        this.highScore = localStorage.getItem('puzzle2048HighScore') || 0;
        this.gameWon = false;               // Boolean flag untuk win condition
        this.gameOver = false;              // Boolean flag untuk game over
        this.previousBoard = [];            // Array untuk menyimpan state sebelumnya (undo)
        this.previousScore = 0;             // Skor sebelumnya untuk undo
        
        // ===== DOM ELEMENTS =====
        this.boardElement = document.getElementById('puzzleBoard');      // Container untuk game board
        this.scoreElement = document.getElementById('score');            // Display skor
        this.highScoreElement = document.getElementById('highScore');    // Display high score
        this.gameStatusElement = document.getElementById('gameStatus');  // Display status game
        this.newGameButton = document.getElementById('newGameButton');   // Tombol new game
        this.undoButton = document.getElementById('undoButton');         // Tombol undo
        
        // ===== AUDIO INTEGRATION =====
        this.audioManager = window.audioManager;
        
        // ===== INITIALIZATION =====
        this.bindEvents();        // Setup event listeners
        this.initBoard();         // Inisialisasi board
        this.updateDisplay();     // Update tampilan awal
    }
    
    /**
     * bindEvents() - Setup semua event listeners
     * 
     * Konsep yang dipelajari:
     * - Event listeners untuk buttons
     * - Keyboard event handling dengan arrow keys
     * - Event prevention (preventDefault)
     * - Switch statements untuk direction handling
     * - Mobile touch controls
     */
    bindEvents() {
        this.newGameButton.addEventListener('click', () => {
            // ===== AUDIO =====
            if (this.audioManager) {
                this.audioManager.playAction('click');
            }
            this.newGame();
        });
        
        this.undoButton.addEventListener('click', () => {
            // ===== AUDIO =====
            if (this.audioManager) {
                this.audioManager.playAction('click');
            }
            this.undo();
        });
        
        // ===== KEYBOARD CONTROLS =====
        // 'keydown' event terjadi setiap kali tombol ditekan
        document.addEventListener('keydown', (e) => {
            // Hanya proses input jika game belum berakhir
            if (this.gameOver) return;
            
            // Switch statement untuk menangani berbagai key input
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault(); // Mencegah scroll halaman
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
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
     * handleMobileInput() - Handle input dari tombol kontrol mobile
     */
    handleMobileInput(direction) {
        if (this.gameOver) return;
        
        switch(direction) {
            case 'up':
                this.move('up');
                break;
            case 'down':
                this.move('down');
                break;
            case 'left':
                this.move('left');
                break;
            case 'right':
                this.move('right');
                break;
        }
    }
    
    /**
     * setupSwipeGestures() - Setup swipe gesture detection untuk mobile
     */
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const boardElement = this.boardElement;
        
        boardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: false });
        
        boardElement.addEventListener('touchend', (e) => {
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
        if (this.gameOver) return;
        
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
                this.move('right');
            } else {
                this.move('left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                this.move('down');
            } else {
                this.move('up');
            }
        }
    }
    
    /**
     * initBoard() - Inisialisasi game board
     * 
     * Konsep yang dipelajari:
     * - Array(4).fill() untuk membuat array dengan 4 elemen
     * - map() method untuk membuat nested arrays
     * - 2D array initialization
     * - Method chaining
     */
    initBoard() {
        // Array(4).fill() membuat array dengan 4 elemen
        // map(() => Array(4).fill(0)) membuat setiap elemen menjadi array baru dengan 4 elemen, semuanya berisi 0
        // Hasil: [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        
        // Tambah 2 tile random di awal game
        this.addRandomTile();
        this.addRandomTile();
        
        // Render board ke DOM
        this.renderBoard();
    }
    
    /**
     * addRandomTile() - Tambah tile baru secara random
     * 
     * Konsep yang dipelajari:
     * - Nested for loops untuk 2D array
     * - Array.push() untuk menambah elemen
     * - Math.random() untuk random selection
     * - Conditional probability (90% tile 2, 10% tile 4)
     */
    addRandomTile() {
        // ===== FIND EMPTY CELLS =====
        const emptyCells = [];
        
        // Nested loops untuk mencari semua cell kosong (bernilai 0)
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    // Simpan posisi cell kosong dengan object {row, col}
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        // ===== ADD RANDOM TILE =====
        if (emptyCells.length > 0) {
            // Pilih cell kosong secara random
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            // 90% kemungkinan tile 2, 10% kemungkinan tile 4
            this.board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    /**
     * saveState() - Simpan state game saat ini untuk undo
     * 
     * Konsep yang dipelajari:
     * - Deep copying arrays
     * - map() method untuk array copying
     * - State preservation
     */
    saveState() {
        // Deep copy board: map(row => [...row]) mengcopy setiap row
        // [...row] adalah spread operator untuk mengcopy array
        this.previousBoard = this.board.map(row => [...row]);
        this.previousScore = this.score;
    }
    
    /**
     * undo() - Kembalikan ke state sebelumnya
     * 
     * Konsep yang dipelajari:
     * - State restoration
     * - Array deep copying
     * - Game state reset
     */
    undo() {
        if (this.previousBoard.length > 0) {
            // Restore board dan score
            this.board = this.previousBoard.map(row => [...row]);
            this.score = this.previousScore;
            
            // Reset game state
            this.gameWon = false;
            this.gameOver = false;
            
            // Update tampilan
            this.renderBoard();
            this.updateDisplay();
            this.updateStatus('Game berhasil di-undo!');
        }
    }
    
    /**
     * move() - Handle movement berdasarkan direction
     * 
     * Konsep yang dipelajari:
     * - Function parameters
     * - Switch statements
     * - Method calls
     * - Conditional logic
     */
    move(direction) {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playAction('move');
        }
        
        // Simpan state sebelum move
        this.saveState();
        let moved = false;
        
        // Panggil method yang sesuai berdasarkan direction
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        // Jika ada pergerakan, update game
        if (moved) {
            this.addRandomTile();    // Tambah tile baru
            this.renderBoard();      // Update tampilan
            this.updateDisplay();    // Update skor
            this.checkGameState();   // Cek win/lose conditions
        }
    }
    
    /**
     * moveLeft() - Move tiles ke kiri
     * 
     * Konsep yang dipelajari:
     * - Array.filter() untuk menghapus nilai 0
     * - Array merging logic
     * - Score calculation
     * - Array comparison dengan JSON.stringify()
     */
    moveLeft() {
        let moved = false;
        
        // Loop melalui setiap row
        for (let i = 0; i < 4; i++) {
            // Filter: hapus semua nilai 0, ambil hanya nilai non-zero
            const row = this.board[i].filter(cell => cell !== 0);
            
            // ===== MERGE ADJACENT TILES =====
            // Loop dari kiri ke kanan untuk merge tiles yang sama
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;                    // Merge tiles
                    this.score += row[j];            // Tambah skor
                    row.splice(j + 1, 1);           // Hapus tile yang sudah di-merge
                    moved = true;
                }
            }
            
            // ===== PAD WITH ZEROS =====
            // Array(4 - row.length).fill(0) membuat array dengan zeros
            // concat() menggabungkan row dengan zeros
            const newRow = row.concat(Array(4 - row.length).fill(0));
            
            // ===== CHECK IF MOVED =====
            // JSON.stringify() mengubah array menjadi string untuk comparison
            if (JSON.stringify(this.board[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            
            this.board[i] = newRow;
        }
        return moved;
    }
    
    /**
     * moveRight() - Move tiles ke kanan
     * 
     * Konsep yang dipelajari:
     * - Reverse loop untuk right movement
     * - Array manipulation dari kanan ke kiri
     * - Array padding di awal
     */
    moveRight() {
        let moved = false;
        
        for (let i = 0; i < 4; i++) {
            const row = this.board[i].filter(cell => cell !== 0);
            
            // ===== MERGE FROM RIGHT TO LEFT =====
            // Loop dari kanan ke kiri untuk merge
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }
            
            // ===== PAD WITH ZEROS AT BEGINNING =====
            // Array(4 - row.length).fill(0) di awal, lalu concat dengan row
            const newRow = Array(4 - row.length).fill(0).concat(row);
            
            if (JSON.stringify(this.board[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.board[i] = newRow;
        }
        return moved;
    }
    
    /**
     * moveUp() - Move tiles ke atas
     * 
     * Konsep yang dipelajari:
     * - Column extraction dari 2D array
     * - Vertical movement logic
     * - Array manipulation untuk columns
     */
    moveUp() {
        let moved = false;
        
        // Loop melalui setiap column (j)
        for (let j = 0; j < 4; j++) {
            const column = [];
            
            // ===== EXTRACT COLUMN =====
            // Loop dari atas ke bawah untuk extract column
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            // ===== MERGE ADJACENT TILES =====
            // Merge dari atas ke bawah
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            // ===== PAD WITH ZEROS =====
            const newColumn = column.concat(Array(4 - column.length).fill(0));
            
            // ===== UPDATE BOARD =====
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.board[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    /**
     * moveDown() - Move tiles ke bawah
     * 
     * Konsep yang dipelajari:
     * - Reverse loop untuk downward movement
     * - Column manipulation dari bawah ke atas
     * - Array padding di akhir
     */
    moveDown() {
        let moved = false;
        
        for (let j = 0; j < 4; j++) {
            const column = [];
            
            // Extract column
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            // ===== MERGE FROM BOTTOM TO TOP =====
            // Loop dari bawah ke atas untuk merge
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            
            // ===== PAD WITH ZEROS AT END =====
            const newColumn = Array(4 - column.length).fill(0).concat(column);
            
            // Update board
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.board[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    /**
     * checkGameState() - Cek kondisi win/lose
     * 
     * Konsep yang dipelajari:
     * - Win condition checking
     * - Game over detection
     * - High score updating
     * - localStorage untuk data persistence
     */
    checkGameState() {
        // ===== CHECK FOR WIN =====
        // Loop melalui semua cell untuk mencari tile 2048
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 2048 && !this.gameWon) {
                    this.gameWon = true;
                    
                    // ===== AUDIO =====
                    if (this.audioManager) {
                        this.audioManager.playGameEvent('win');
                    }
                    
                    this.updateStatus('Selamat! Kamu menang! 🎉');
                }
            }
        }
        
        // ===== CHECK FOR GAME OVER =====
        if (this.isGameOver()) {
            this.gameOver = true;
            
            // ===== AUDIO =====
            if (this.audioManager) {
                this.audioManager.playGameEvent('over');
            }
            
            this.updateStatus('Game Over! Tidak ada gerakan yang mungkin 😔');
        }
        
        // ===== UPDATE HIGH SCORE =====
        if (this.score > this.highScore) {
            this.highScore = this.score;
            // Simpan high score baru ke localStorage
            localStorage.setItem('puzzle2048HighScore', this.highScore);
            this.updateStatus('High Score Baru! 🏆');
        }
    }
    
    /**
     * isGameOver() - Cek apakah game sudah berakhir
     * 
     * Konsep yang dipelajari:
     * - Game logic algorithms
     * - Nested loops untuk checking
     * - Boundary checking
     * - Merge possibility detection
     */
    isGameOver() {
        // ===== CHECK FOR EMPTY CELLS =====
        // Jika ada cell kosong, game belum berakhir
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) return false;
            }
        }
        
        // ===== CHECK FOR POSSIBLE MERGES =====
        // Cek apakah ada tile yang bisa di-merge
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.board[i][j];
                
                // Cek horizontal merge (kiri-kanan)
                if (j < 3 && this.board[i][j + 1] === current) return false;
                
                // Cek vertical merge (atas-bawah)
                if (i < 3 && this.board[i + 1][j] === current) return false;
            }
        }
        
        // Jika tidak ada cell kosong dan tidak ada merge yang mungkin
        return true;
    }
    
    /**
     * renderBoard() - Render game board ke DOM
     * 
     * Konsep yang dipelajari:
     * - Dynamic DOM creation
     * - CSS classes dan styling
     * - Nested loops untuk rendering
     * - DOM manipulation
     */
    renderBoard() {
        // Kosongkan board container
        this.boardElement.innerHTML = '';
        
        // ===== CREATE TILES =====
        // Nested loops untuk membuat 4x4 grid
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                // Buat div element untuk setiap tile
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                
                // Set text content (kosong jika nilai 0)
                tile.textContent = this.board[i][j] || '';
                
                // ===== STYLING DAN ANIMATION =====
                if (this.board[i][j] !== 0) {
                    // Tambah CSS class berdasarkan nilai tile
                    tile.classList.add(`tile-${this.board[i][j]}`);
                    
                    // Tambah animation untuk tile baru
                    tile.style.animation = 'tile-appear 0.3s ease-out';
                }
                
                // Tambahkan tile ke board
                this.boardElement.appendChild(tile);
            }
        }
    }
    
    /**
     * newGame() - Mulai game baru
     * 
     * Konsep yang dipelajari:
     * - Game state reset
     * - Complete reinitialization
     * - Method chaining
     */
    newGame() {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('start');
        }
        
        // ===== RESET ALL GAME STATE =====
        this.board = [];
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.previousBoard = [];
        this.previousScore = 0;
        
        // ===== REINITIALIZE GAME =====
        this.initBoard();
        this.updateDisplay();
        this.updateStatus('Game baru dimulai! 🚀');
    }
    
    /**
     * updateDisplay() - Update skor dan high score display
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
     * updateStatus() - Update status game display
     * 
     * Konsep yang dipelajari:
     * - Function parameters
     * - setTimeout untuk delayed actions
     * - Conditional status updates
     */
    updateStatus(status) {
        this.gameStatusElement.textContent = status;
        
        // ===== AUTO-RESET STATUS =====
        // Reset status ke default setelah 2 detik (kecuali game over/win)
        setTimeout(() => {
            if (!this.gameOver && !this.gameWon) {
                this.gameStatusElement.textContent = 'Gunakan tombol panah untuk bermain';
            }
        }, 2000);
    }
}

// ===== GAME INITIALIZATION =====
// DOMContentLoaded event terjadi setelah semua HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    try {
        new Puzzle2048(); // Buat instance baru dari game
        console.log('2048 Puzzle initialized successfully');
    } catch (error) {
        // Error handling jika ada masalah saat inisialisasi
        console.error('Error initializing 2048 Puzzle:', error);
    }
});
