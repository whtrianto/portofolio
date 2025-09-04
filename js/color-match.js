/**
 * 🎨 COLOR MATCH GAME - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat lanjut:
 * - ES6 Classes dan Object-Oriented Programming
 * - Color theory dan hex color manipulation
 * - Dynamic DOM creation dan manipulation
 * - Event handling untuk multiple elements
 * - Timing dan reaction time calculation
 * - Array manipulation dan shuffling
 * - CSS styling dengan JavaScript
 * - Game progression dan scoring system
 * - Visual feedback dan animations
 * - Audio integration dengan AudioManager
 * - Progressive difficulty system
 */

/**
 * Class ColorMatch - Main game controller untuk color matching game
 * 
 * Konsep yang dipelajari:
 * - ES6 Class syntax
 * - Constructor method
 * - Instance properties dan methods
 * - Color arrays dan color names
 * - Game state management
 * - Progressive difficulty scaling
 */
class ColorMatch {
    /**
     * Constructor - Inisialisasi game state dan setup
     * 
     * Konsep yang dipelajari:
     * - Array initialization dengan hex colors
     * - Parallel arrays (colors dan colorNames)
     * - Game variables (score, level, timing)
     * - DOM element selection
     * - Method chaining
     * - Difficulty progression system
     */
    constructor() {
        // ===== COLOR DATA =====
        // Array berisi 18 hex color codes
        // Hex colors dimulai dengan # diikuti 6 karakter (RRGGBB)
        this.colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
            '#FF8000', '#8000FF', '#FF0080', '#80FF00', '#0080FF', '#FFFF80',
            '#FF8080', '#80FF80', '#8080FF', '#FFFF40', '#FF40FF', '#40FFFF'
        ];
        
        // Array parallel dengan nama warna dalam bahasa Indonesia
        // Index colors[0] = '#FF0000' berhubungan dengan colorNames[0] = 'Merah'
        this.colorNames = [
            'Merah', 'Hijau', 'Biru', 'Kuning', 'Magenta', 'Cyan',
            'Oranye', 'Ungu', 'Pink', 'Lime', 'Biru Muda', 'Kuning Muda',
            'Merah Muda', 'Hijau Muda', 'Biru Muda', 'Kuning Terang', 'Pink', 'Cyan Terang'
        ];
        
        // ===== DIFFICULTY COLORS =====
        // Warna-warna yang mirip untuk level tinggi
        this.similarColors = [
            // Merah
            '#FF3000', '#CC0000', '#990000', '#660000',
            // Hijau
            '#99FF00', '#00CC00', '#009900', '#006600',
            // Biru
            '#0040FF', '#0000CC', '#000099', '#000066',
            // Kuning
            '#FFFF99', '#CCCC00', '#999900', '#666600',
            // Magenta
            '#FF99FF', '#CC00CC', '#990099', '#660066',
            // Cyan
            '#99FFFF', '#00CCCC', '#009999', '#006666'
        ];
        
        
        // ===== GAME STATE VARIABLES =====
        this.score = 0;           // Skor total player
        this.level = 1;           // Level saat ini (berdasarkan skor)
        this.gameActive = false;  // Boolean flag untuk status game
        this.startTime = 0;       // Timestamp saat round dimulai
        this.currentRound = 0;    // Round saat ini
        this.maxRounds = 40;      // Total round dalam satu game
        this.timeLimit = 0;       // Time limit untuk round saat ini
        this.timeRemaining = 0;   // Sisa waktu
        this.timerInterval = null; // Interval untuk countdown timer
        
        // ===== DIFFICULTY SETTINGS =====
        this.baseTimeLimit = 5;  // Time limit dasar (detik)
        this.minTimeLimit = 3;    // Time limit minimum
        this.maxOptions = 8;      // Maksimum pilihan warna
        this.baseOptions = 4;     // Pilihan warna dasar
        
        // ===== DOM ELEMENTS =====
        this.targetColorElement = document.getElementById('targetColor');     // Display warna target
        this.targetTextElement = document.getElementById('targetText');       // Display nama warna target
        this.colorOptionsElement = document.getElementById('colorOptions');   // Container untuk pilihan warna
        this.scoreElement = document.getElementById('score');                 // Display skor
        this.timeElement = document.getElementById('time');                   // Display waktu reaksi
        this.levelElement = document.getElementById('level');                 // Display level
        this.startButton = document.getElementById('startButton');            // Tombol start
        this.restartButton = document.getElementById('restartButton');        // Tombol restart
        
        // ===== AUDIO INTEGRATION =====
        this.audioManager = window.audioManager;
        
        // ===== INITIALIZATION =====
        this.bindEvents();        // Setup event listeners
        this.updateDisplay();     // Update tampilan awal
    }
    
    /**
     * bindEvents() - Setup semua event listeners
     * 
     * Konsep yang dipelajari:
     * - Event listeners untuk buttons
     * - Click event pada color display
     * - Arrow functions untuk event handlers
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
        
        // Click pada target color juga bisa memulai game
        this.targetColorElement.addEventListener('click', () => {
            if (!this.gameActive) {
                // ===== AUDIO =====
                if (this.audioManager) {
                    this.audioManager.playAction('click');
                }
                this.startGame();
            }
        });
    }
    
    /**
     * startGame() - Memulai game baru
     * 
     * Konsep yang dipelajari:
     * - Game state initialization
     * - UI state changes
     * - Method chaining
     */
    startGame() {
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('start');
        }
        
        this.gameActive = true;
        this.score = 0;
        this.level = 1;
        this.currentRound = 0;
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'none';
        
        this.updateDisplay();
        this.nextRound(); // Mulai round pertama
    }
    
    /**
     * nextRound() - Memulai round baru dengan difficulty scaling
     * 
     * Konsep yang dipelajari:
     * - Game progression logic
     * - Math.random() untuk random selection
     * - Date.now() untuk timing
     * - Color contrast calculation
     * - Progressive difficulty system
     * - Time limit management
     */
    nextRound() {
        // Cek apakah game sudah selesai
        if (this.currentRound >= this.maxRounds) {
            this.endGame();
            return;
        }
        
        this.currentRound++;
        this.startTime = Date.now(); // Catat waktu mulai round
        
        // ===== CALCULATE DIFFICULTY =====
        this.calculateDifficulty();
        
        // ===== GENERATE RANDOM TARGET COLOR =====
        // Math.random() * this.colors.length menghasilkan 0-17.999...
        // Math.floor() membulatkan ke bawah menjadi 0-17
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const targetColor = this.colors[colorIndex];
        const targetName = this.colorNames[colorIndex];
        
        // ===== SET TARGET DISPLAY =====
        this.targetColorElement.style.backgroundColor = targetColor;
        this.targetTextElement.textContent = targetName;
        
        // getContrastColor() memastikan text terbaca di atas background
        this.targetTextElement.style.color = this.getContrastColor(targetColor);
        
        // Generate pilihan warna untuk player
        this.generateColorOptions(targetColor, targetName);
        
        // ===== START TIMER =====
        this.startTimer();
    }
    
    /**
     * calculateDifficulty() - Menghitung kesulitan berdasarkan level
     * 
     * Konsep yang dipelajari:
     * - Progressive difficulty scaling
     * - Math calculations untuk game balance
     * - Level-based adjustments
     */
    calculateDifficulty() {
        // ===== TIME LIMIT SCALING =====
        // Time limit berkurang setiap level
        // Level 1: 10 detik, Level 5: 7 detik, Level 10: 4 detik
        this.timeLimit = Math.max(
            this.minTimeLimit,
            this.baseTimeLimit - Math.floor(this.level / 2)
        );
        this.timeRemaining = this.timeLimit;
        
        // ===== OPTIONS SCALING =====
        // Jumlah pilihan warna bertambah setiap 3 level
        // Level 1-2: 4 pilihan, Level 3-5: 5 pilihan, Level 6+: 6 pilihan
        this.currentOptions = Math.min(
            this.maxOptions,
            this.baseOptions + Math.floor(this.level / 3)
        );
    }
    
    /**
     * startTimer() - Memulai countdown timer untuk round
     * 
     * Konsep yang dipelajari:
     * - Timer management
     * - setInterval dan clearInterval
     * - Time-based game mechanics
     */
    startTimer() {
        // Clear timer sebelumnya jika ada
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Update timer setiap 100ms untuk smooth countdown
        this.timerInterval = setInterval(() => {
            this.timeRemaining -= 0.1;
            
            // Update display
            this.updateDisplay();
            
            // Cek apakah waktu habis
            if (this.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 100);
    }
    
    /**
     * handleTimeUp() - Menangani ketika waktu habis
     * 
     * Konsep yang dipelajari:
     * - Time-based penalties
     * - Game state management
     */
    handleTimeUp() {
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playAction('wrong');
        }
        
        // Kurangi skor karena waktu habis
        this.score = Math.max(0, this.score - 30);
        
        // ===== TIME UP VISUAL FEEDBACK =====
        this.targetColorElement.style.border = '5px solid #ff8800';
        this.targetColorElement.style.boxShadow = '0 0 20px #ff8800';
        
        // Update display
        this.updateDisplay();
        
        // Lanjut ke round berikutnya setelah 1 detik
        setTimeout(() => {
            this.targetColorElement.style.border = 'none';
            this.targetColorElement.style.boxShadow = 'none';
            this.nextRound();
        }, 1000);
    }
    
    /**
     * generateColorOptions() - Membuat pilihan warna untuk player dengan difficulty scaling
     * 
     * Konsep yang dipelajari:
     * - Dynamic DOM creation
     * - Array manipulation
     * - Event handling untuk multiple elements
     * - CSS styling dengan JavaScript
     * - Hover effects dan animations
     * - Progressive difficulty system
     * - Similar color challenges
     */
    generateColorOptions(targetColor, targetName) {
        // Kosongkan container pilihan warna
        this.colorOptionsElement.innerHTML = '';
        
        // ===== CREATE OPTIONS ARRAY =====
        const options = [targetColor]; // Warna yang benar
        const usedIndices = [this.colors.indexOf(targetColor)]; // Index yang sudah digunakan
        
        // ===== DIFFICULTY-BASED COLOR SELECTION =====
        if (this.level >= 5) {
            // Level 5+: Tambahkan warna yang mirip untuk challenge
            this.addSimilarColors(targetColor, options, usedIndices);
        }
        
        // Tambah warna salah sampai mencapai jumlah yang diinginkan
        while (options.length < this.currentOptions) {
            const randomIndex = Math.floor(Math.random() * this.colors.length);
            // Pastikan tidak ada duplikasi
            if (!usedIndices.includes(randomIndex)) {
                options.push(this.colors[randomIndex]);
                usedIndices.push(randomIndex);
            }
        }
        
        // Acak urutan pilihan
        this.shuffleArray(options);
        
        // ===== CREATE COLOR OPTION BUTTONS =====
        options.forEach(color => {
            // Buat button element baru
            const button = document.createElement('button');
            button.className = 'color-option';
            
            // ===== STYLING BUTTON =====
            button.style.backgroundColor = color;
            button.style.border = '3px solid #00ff9d';
            button.style.borderRadius = '50%'; // Membuat button bulat
            button.style.width = '80px';
            button.style.height = '80px';
            button.style.margin = '10px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease'; // Smooth transitions
            
            // ===== HOVER EFFECTS =====
            // Mouse enter: scale up dan tambah glow
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 0 15px #00ff9d';
            });
            
            // Mouse leave: scale down dan hapus glow
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
                button.style.boxShadow = 'none';
            });
            
            // ===== CLICK HANDLER =====
            button.addEventListener('click', () => {
                if (color === targetColor) {
                    // ===== AUDIO =====
                    if (this.audioManager) {
                        this.audioManager.playAction('correct');
                    }
                    this.handleCorrectAnswer(); // Jawaban benar
                } else {
                    // ===== AUDIO =====
                    if (this.audioManager) {
                        this.audioManager.playAction('wrong');
                    }
                    this.handleWrongAnswer();   // Jawaban salah
                }
            });
            
            // Tambahkan button ke container
            this.colorOptionsElement.appendChild(button);
        });
    }
    
    /**
     * addSimilarColors() - Menambahkan warna yang mirip untuk challenge
     * 
     * Konsep yang dipelajari:
     * - Color similarity detection
     * - Advanced color manipulation
     * - Difficulty enhancement
     */
    addSimilarColors(targetColor, options, usedIndices) {
        // Cari warna yang mirip dengan target
        const similarColors = this.findSimilarColors(targetColor);
        
        // Tambahkan 1-2 warna yang mirip
        const numSimilar = Math.min(2, similarColors.length);
        for (let i = 0; i < numSimilar && options.length < this.currentOptions; i++) {
            if (!usedIndices.includes(similarColors[i])) {
                options.push(similarColors[i]);
                usedIndices.push(similarColors[i]);
            }
        }
    }
    
    /**
     * findSimilarColors() - Mencari warna yang mirip dengan target
     * 
     * Konsep yang dipelajari:
     * - Color distance calculation
     * - RGB color theory
     * - Similarity algorithms
     */
    findSimilarColors(targetColor) {
        const targetRGB = this.hexToRgb(targetColor);
        const similar = [];
        
        // Cari warna yang jarak RGB-nya dekat
        this.similarColors.forEach(color => {
            const colorRGB = this.hexToRgb(color);
            const distance = this.calculateColorDistance(targetRGB, colorRGB);
            
            // Jika jarak < 100, warna dianggap mirip
            if (distance < 100) {
                similar.push(color);
            }
        });
        
        return similar;
    }
    
    /**
     * hexToRgb() - Mengubah hex color ke RGB
     * 
     * Konsep yang dipelajari:
     * - Color format conversion
     * - String parsing
     */
    hexToRgb(hex) {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        return { r, g, b };
    }
    
    /**
     * calculateColorDistance() - Menghitung jarak antara dua warna
     * 
     * Konsep yang dipelajari:
     * - Euclidean distance
     * - Color space mathematics
     */
    calculateColorDistance(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }
    
    /**
     * handleCorrectAnswer() - Menangani jawaban yang benar
     * 
     * Konsep yang dipelajari:
     * - Reaction time calculation
     * - Score calculation dengan time bonus
     * - Level progression
     * - Visual feedback
     * - setTimeout untuk delayed actions
     * - Timer management
     */
    handleCorrectAnswer() {
        // ===== STOP TIMER =====
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // ===== CALCULATE REACTION TIME =====
        // Date.now() - this.startTime = waktu dalam milliseconds
        // / 1000 mengubah ke detik
        const reactionTime = (Date.now() - this.startTime) / 1000;
        
        // ===== SCORE CALCULATION =====
        // Time bonus: semakin cepat, semakin banyak bonus
        // Bonus tambahan untuk level tinggi
        const baseScore = 100;
        const timeBonus = Math.max(0, this.timeLimit - reactionTime) * 20;
        const levelBonus = this.level * 10;
        const roundScore = Math.floor(baseScore + timeBonus + levelBonus);
        
        this.score += roundScore;
        
        // ===== LEVEL PROGRESSION =====
        // Level naik setiap 500 poin
        this.level = Math.floor(this.score / 500) + 1;
        
        this.updateDisplay();
        
        // ===== SUCCESS VISUAL FEEDBACK =====
        // Tambah border hijau dan glow
        this.targetColorElement.style.border = '5px solid #00ff9d';
        this.targetColorElement.style.boxShadow = '0 0 20px #00ff9d';
        
        // Hapus feedback setelah 500ms dan lanjut ke round berikutnya
        setTimeout(() => {
            this.targetColorElement.style.border = 'none';
            this.targetColorElement.style.boxShadow = 'none';
            this.nextRound();
        }, 500);
    }
    
    /**
     * handleWrongAnswer() - Menangani jawaban yang salah
     * 
     * Konsep yang dipelajari:
     * - Score penalty
     * - Error visual feedback
     * - setTimeout untuk delayed actions
     * - Timer management
     */
    handleWrongAnswer() {
        // ===== STOP TIMER =====
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Kurangi skor (minimum 0) - penalty bertambah di level tinggi
        const penalty = Math.min(100, 50 + (this.level * 5));
        this.score = Math.max(0, this.score - penalty);
        this.updateDisplay();
        
        // ===== ERROR VISUAL FEEDBACK =====
        // Tambah border merah dan glow
        this.targetColorElement.style.border = '5px solid #ff0000';
        this.targetColorElement.style.borderRadius = '10px';
        this.targetColorElement.style.boxShadow = '0 0 20px #ff0000';
        
        // Hapus feedback setelah 500ms dan lanjut ke round berikutnya
        setTimeout(() => {
            this.targetColorElement.style.border = 'none';
            this.targetColorElement.style.boxShadow = 'none';
            this.nextRound();
        }, 500);
    }
    
    /**
     * endGame() - Mengakhiri game
     * 
     * Konsep yang dipelajari:
     * - Game state management
     * - Final score display
     * - UI cleanup
     * - Timer cleanup
     */
    endGame() {
        // ===== CLEANUP TIMER =====
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // ===== AUDIO =====
        if (this.audioManager) {
            this.audioManager.playGameEvent('win');
        }
        
        this.gameActive = false;
        this.restartButton.style.display = 'inline-block';
        
        // ===== SHOW FINAL SCORE =====
        this.targetColorElement.style.backgroundColor = '#333';
        this.targetTextElement.textContent = `Game Selesai! Skor: ${this.score}`;
        this.targetTextElement.style.color = '#00ff9d';
        
        // Kosongkan pilihan warna
        this.colorOptionsElement.innerHTML = '';
    }
    
    /**
     * restartGame() - Restart game dari awal
     * 
     * Konsep yang dipelajari:
     * - Complete game state reset
     * - UI restoration
     * - Default styling
     * - Timer cleanup
     */
    restartGame() {
        // ===== CLEANUP TIMER =====
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // ===== RESET GAME STATE =====
        this.score = 0;
        this.level = 1;
        this.currentRound = 0;
        this.gameActive = false;
        this.timeLimit = 0;
        this.timeRemaining = 0;
        
        // ===== RESTORE UI =====
        this.restartButton.style.display = 'none';
        this.startButton.style.display = 'inline-block';
        
        // ===== RESTORE DEFAULT STYLING =====
        this.targetColorElement.style.backgroundColor = '#333';
        this.targetTextElement.textContent = 'KLIK UNTUK MULAI';
        this.targetTextElement.style.color = '#e0e0e0';
        this.targetColorElement.style.border = 'none';
        this.targetColorElement.style.boxShadow = 'none';
        
        this.colorOptionsElement.innerHTML = '';
        this.updateDisplay();
    }
    
    /**
     * updateDisplay() - Update semua display elements
     * 
     * Konsep yang dipelajari:
     * - Real-time display updates
     * - Time formatting
     * - Conditional display logic
     * - Timer countdown display
     */
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        
        // ===== TIME DISPLAY =====
        if (this.gameActive && this.timeRemaining > 0) {
            // Tampilkan sisa waktu dengan format yang bagus
            this.timeElement.textContent = this.timeRemaining.toFixed(1);
            
            // ===== TIMER COLOR CODING =====
            if (this.timeRemaining <= 2) {
                this.timeElement.style.color = '#ff0000'; // Merah untuk waktu hampir habis
                this.timeElement.style.fontWeight = 'bold';
            } else if (this.timeRemaining <= 5) {
                this.timeElement.style.color = '#ff8800'; // Oranye untuk waktu menengah
                this.timeElement.style.fontWeight = 'bold';
            } else {
                this.timeElement.style.color = '#00ff9d'; // Hijau untuk waktu aman
                this.timeElement.style.fontWeight = 'normal';
            }
        } else if (this.gameActive && this.startTime > 0) {
            // Fallback untuk waktu reaksi
            const currentTime = (Date.now() - this.startTime) / 1000;
            this.timeElement.textContent = currentTime.toFixed(2);
            this.timeElement.style.color = '#e0e0e0';
            this.timeElement.style.fontWeight = 'normal';
        } else {
            this.timeElement.textContent = '0.0';
            this.timeElement.style.color = '#e0e0e0';
            this.timeElement.style.fontWeight = 'normal';
        }
    }
    
    /**
     * getContrastColor() - Menghitung warna kontras untuk text readability
     * 
     * Konsep yang dipelajari:
     * - Hex color parsing
     * - RGB color theory
     * - Luminance calculation
     * - Color contrast algorithms
     */
    getContrastColor(hexColor) {
        // ===== CONVERT HEX TO RGB =====
        // substr(1, 2) mengambil karakter ke-1 dan 2 (setelah #)
        // parseInt(hex, 16) mengubah hex string menjadi decimal
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // ===== CALCULATE LUMINANCE =====
        // Formula luminance standar untuk menentukan brightness
        // 0.299*R + 0.587*G + 0.114*B memberikan weight yang tepat untuk setiap channel
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // ===== RETURN CONTRAST COLOR =====
        // Jika background terang (luminance > 0.5), gunakan text hitam
        // Jika background gelap (luminance <= 0.5), gunakan text putih
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    
    /**
     * shuffleArray() - Mengacak array menggunakan Fisher-Yates algorithm
     * 
     * Konsep yang dipelajari:
     * - Array shuffling algorithm
     * - For loop dengan decrement
     * - ES6 destructuring untuk swap
     * - Math.random() untuk random selection
     */
    shuffleArray(array) {
        // Loop dari index terakhir ke index pertama
        for (let i = array.length - 1; i > 0; i--) {
            // Generate index random dari 0 sampai i
            const j = Math.floor(Math.random() * (i + 1));
            
            // ES6 destructuring untuk swap elements
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// ===== GAME INITIALIZATION =====
// DOMContentLoaded event terjadi setelah semua HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    new ColorMatch(); // Buat instance baru dari game
});
