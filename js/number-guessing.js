/**
 * 🎯 NUMBER GUESSING GAME - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep dasar JavaScript:
 * - DOM Manipulation (mengambil dan mengubah elemen HTML)
 * - Variables dan Data Types (let, const, number, string)
 * - Functions (fungsi untuk menjalankan logika game)
 * - Conditional Statements (if-else untuk logika game)
 * - Event Listeners (mendengarkan klik tombol)
 * - Math.random() untuk menghasilkan angka acak
 * - String Template Literals (menggunakan backticks `)
 * - Audio integration dengan AudioManager
 */

// ===== DOM ELEMENTS SELECTION =====
// Menggunakan document.getElementById() untuk mengambil elemen HTML berdasarkan ID
// Ini adalah cara JavaScript berkomunikasi dengan HTML
const guessInput = document.getElementById('guessInput');        // Input field untuk tebakan user
const guessButton = document.getElementById('guessButton');      // Tombol untuk submit tebakan
const restartButton = document.getElementById('restartButton');  // Tombol untuk restart game
const message = document.getElementById('message');              // Area untuk menampilkan pesan
const attemptsDisplay = document.getElementById('attempts');     // Display sisa percobaan
const historyContainer = document.getElementById('historyContainer'); // Container untuk riwayat
const guessHistory = document.getElementById('guessHistory');    // Area untuk menampilkan riwayat

// ===== GAME STATE VARIABLES =====
// Variabel untuk menyimpan kondisi game saat ini
let secretNumber;                    // Angka yang harus ditebak (akan di-generate secara acak)
let attemptsLeft;                    // Sisa percobaan yang tersedia
const maxAttempts = 8;               // Konstanta: maksimal percobaan (tidak bisa diubah)
let guessHistoryArray = [];          // Array untuk menyimpan riwayat tebakan
let usedNumbers = new Set();         // Set untuk menyimpan angka yang sudah ditebak

// ===== AUDIO INTEGRATION =====
const audioManager = window.audioManager;

// ===== AUDIO HELPER FUNCTIONS =====
function playSound(soundName) {
    // Always use direct audio for now to ensure it works
    playDirectAudio(soundName);
}

function playGameSound(soundName) {
    // Always use direct audio for now to ensure it works
    playDirectAudio(soundName);
}

// Direct audio function using HTML5 Audio API
function playDirectAudio(soundName) {
    try {
        console.log(`Playing sound: ${soundName}`);
        const audio = new Audio(`../audio/${soundName}.mp3`);
        audio.volume = 0.5;
        
        // Add event listeners for debugging
        audio.onloadstart = () => console.log(`Loading: ${soundName}`);
        audio.oncanplay = () => console.log(`Ready: ${soundName}`);
        audio.onplay = () => console.log(`Playing: ${soundName}`);
        audio.onended = () => console.log(`Finished: ${soundName}`);
        audio.onerror = (e) => console.log(`Error playing ${soundName}:`, e);
        
        audio.play().catch(error => {
            console.log(`Failed to play ${soundName}:`, error);
        });
    } catch (error) {
        console.log(`Error creating audio for ${soundName}:`, error);
    }
}

// Test audio function for debugging
function testAudio(soundName) {
    console.log(`Testing audio: ${soundName}`);
    playSound(soundName);
}

// ===== HISTORY FUNCTIONS =====
/**
 * Fungsi addToHistory() - Menambahkan tebakan ke riwayat
 * 
 * Konsep yang dipelajari:
 * - Array.push() untuk menambah elemen ke array
 * - Template literals untuk formatting
 * - DOM manipulation untuk update tampilan
 */
function addToHistory(guess, result, hint = '') {
    const historyEntry = {
        guess: guess,
        result: result,
        hint: hint,
        timestamp: new Date().toLocaleTimeString()
    };
    
    guessHistoryArray.push(historyEntry);
    updateHistoryDisplay();
}

/**
 * Fungsi updateHistoryDisplay() - Update tampilan riwayat
 * 
 * Konsep yang dipelajari:
 * - Array.forEach() untuk loop melalui array
 * - Conditional styling berdasarkan hasil
 * - DOM manipulation untuk dynamic content
 */
function updateHistoryDisplay() {
    if (guessHistoryArray.length === 0) {
        historyContainer.style.display = 'none';
        return;
    }
    
    historyContainer.style.display = 'block';
    guessHistory.innerHTML = '';
    
    // Tambahkan informasi angka yang sudah ditebak
    if (usedNumbers.size > 0) {
        const usedNumbersInfo = document.createElement('div');
        usedNumbersInfo.style.padding = '8px 12px';
        usedNumbersInfo.style.margin = '0 0 10px 0';
        usedNumbersInfo.style.borderRadius = '8px';
        usedNumbersInfo.style.fontSize = '12px';
        usedNumbersInfo.style.backgroundColor = 'rgba(255, 234, 0, 0.1)';
        usedNumbersInfo.style.color = '#ffea00';
        usedNumbersInfo.style.border = '1px solid rgba(255, 234, 0, 0.3)';
        usedNumbersInfo.style.textAlign = 'center';
        usedNumbersInfo.innerHTML = `📊 Angka yang sudah ditebak: ${Array.from(usedNumbers).sort((a, b) => a - b).join(', ')}`;
        guessHistory.appendChild(usedNumbersInfo);
    }
    
    guessHistoryArray.forEach((entry, index) => {
        const historyItem = document.createElement('div');
        historyItem.style.padding = '8px 12px';
        historyItem.style.margin = '4px 0';
        historyItem.style.borderRadius = '8px';
        historyItem.style.fontSize = '13px';
        historyItem.style.fontWeight = 'bold';
        historyItem.style.transition = 'all 0.3s ease';
        historyItem.style.cursor = 'default';
        
        let resultColor = '#666';
        let resultIcon = '❓';
        
        if (entry.result === 'correct') {
            resultColor = '#ffea00'; // Primary yellow for correct
            resultIcon = '✅';
        } else if (entry.result === 'high') {
            resultColor = '#ff7700'; // Secondary orange for too high
            resultIcon = '⬇️';
        } else if (entry.result === 'low') {
            resultColor = '#c60cd7'; // Green for too low (complementary)
            resultIcon = '⬆️';
        }
        
        historyItem.style.backgroundColor = resultColor + '15';
        historyItem.style.color = resultColor;
        historyItem.style.border = `1px solid ${resultColor}40`;
        historyItem.style.textShadow = `0 0 5px ${resultColor}`;
        
        historyItem.innerHTML = `
            <strong>${resultIcon} Tebakan #${index + 1}:</strong> ${entry.guess} 
            <span style="color: #e0e0e0; opacity: 0.8;">(${entry.hint})</span>
            <small style="float: right; color: #e0e0e0; opacity: 0.6; font-size: 11px;">${entry.timestamp}</small>
        `;
        
        // Add hover effect
        historyItem.addEventListener('mouseenter', () => {
            historyItem.style.transform = 'scale(1.02)';
            historyItem.style.boxShadow = `0 0 10px ${resultColor}40`;
        });
        
        historyItem.addEventListener('mouseleave', () => {
            historyItem.style.transform = 'scale(1)';
            historyItem.style.boxShadow = 'none';
        });
        
        guessHistory.appendChild(historyItem);
    });
    
    // Scroll ke bawah untuk melihat entry terbaru
    guessHistory.scrollTop = guessHistory.scrollHeight;
}

/**
 * Fungsi clearHistory() - Membersihkan riwayat
 */
function clearHistory() {
    guessHistoryArray = [];
    updateHistoryDisplay();
}

/**
 * Fungsi isDuplicateGuess() - Mengecek apakah angka sudah pernah ditebak
 * 
 * Konsep yang dipelajari:
 * - Set.has() untuk mengecek keberadaan elemen
 * - Boolean return value
 * - Input validation
 */
function isDuplicateGuess(guess) {
    return usedNumbers.has(guess);
}

/**
 * Fungsi addToUsedNumbers() - Menambahkan angka ke daftar yang sudah ditebak
 */
function addToUsedNumbers(guess) {
    usedNumbers.add(guess);
}

/**
 * Fungsi clearUsedNumbers() - Membersihkan daftar angka yang sudah ditebak
 */
function clearUsedNumbers() {
    usedNumbers.clear();
}

// ===== GAME INITIALIZATION FUNCTION =====
/**
 * Fungsi startGame() - Memulai atau mereset game
 * 
 * Konsep yang dipelajari:
 * - Function Declaration (cara membuat fungsi)
 * - Math.random() dan Math.floor() untuk generate angka acak
 * - DOM Manipulation (mengubah text, value, style elemen)
 * - Variable Assignment (memberi nilai ke variabel)
 */
function startGame() {
    // ===== AUDIO =====
    playGameSound('start');
    
    // Math.random() menghasilkan angka 0-0.999999...
    // Math.floor() membulatkan ke bawah ke integer terdekat
    // * 100 mengubah range menjadi 0-99.999...
    // + 1 menggeser range menjadi 1-100
    secretNumber = Math.floor(Math.random() * 100) + 1;
    
    // Reset sisa percobaan ke nilai awal
    attemptsLeft = maxAttempts;
    
    // Reset riwayat
    clearHistory();
    
    // Reset daftar angka yang sudah ditebak
    clearUsedNumbers();

    // ===== UI RESET =====
    // Mengubah konten dan tampilan elemen HTML
    message.textContent = 'Ayo mulai tebak!';                    // Set pesan awal
    attemptsDisplay.textContent = `Sisa percobaan: ${attemptsLeft}`;  // Template literal untuk menampilkan sisa percobaan
    guessInput.value = '';                                        // Kosongkan input field
    guessInput.disabled = false;                                  // Aktifkan input field
    guessButton.style.display = 'inline-block';                   // Tampilkan tombol tebak
    restartButton.style.display = 'none';                         // Sembunyikan tombol restart
    message.style.color = 'var(--text-color)';                   // Reset warna pesan
}

// ===== GAME LOGIC FUNCTION =====
/**
 * Fungsi checkGuess() - Memeriksa tebakan user dan memberikan feedback
 * 
 * Konsep yang dipelajari:
 * - parseInt() untuk mengubah string menjadi integer
 * - Input Validation (memastikan input valid)
 * - Conditional Logic (if-else statements)
 * - Comparison Operators (===, >, <)
 * - Logical Operators (|| untuk OR)
 * - Decrement Operator (--) untuk mengurangi nilai
 */
function checkGuess() {
    // parseInt() mengubah string dari input menjadi integer
    // Jika input bukan angka, parseInt() akan menghasilkan NaN (Not a Number)
    const userGuess = parseInt(guessInput.value);

    // ===== INPUT VALIDATION =====
    // isNaN() mengecek apakah nilai adalah NaN
    // || adalah logical OR operator
    // Jika salah satu kondisi true, maka input tidak valid
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        // ===== AUDIO =====
        playSound('wrong'); // Play wrong sound for invalid input
        
        message.textContent = 'Masukkan angka yang valid antara 1 dan 100.';
        return; // Keluar dari fungsi jika input tidak valid
    }
    
    // ===== DUPLICATE VALIDATION =====
    if (isDuplicateGuess(userGuess)) {
        // ===== AUDIO =====
        playSound('wrong'); // Play wrong sound for duplicate input
        
        message.textContent = `Angka ${userGuess} sudah pernah ditebak! Coba angka lain.`;
        message.style.color = '#ff6b6b'; // Warna merah untuk peringatan
        return; // Keluar dari fungsi jika angka duplikat
    }

    // Tambahkan angka ke daftar yang sudah ditebak
    addToUsedNumbers(userGuess);
    
    // Kurangi sisa percobaan setiap kali user menebak
    attemptsLeft--;

    // ===== GAME LOGIC WITH CONDITIONAL STATEMENTS =====
    // === adalah strict equality operator (nilai dan tipe data harus sama)
    if (userGuess === secretNumber) {
        // User berhasil menebak dengan benar
        // ===== AUDIO =====
        playSound('correct'); // Play correct sound
        // Play victory sound after a short delay
        setTimeout(() => {
            playSound('victory');
        }, 500);
        
        message.textContent = `Selamat! Kamu benar. Angkanya adalah ${secretNumber}.`;
        message.style.color = 'var(--primary-color)';  // Warna hijau untuk sukses
        
        // ===== ADD TO HISTORY =====
        addToHistory(userGuess, 'correct', 'Tebakan Benar!');
        
        // ===== VICTORY CELEBRATION =====
        // Add a small delay before ending game to let sounds play
        setTimeout(() => {
            endGame(); // Panggil fungsi untuk mengakhiri game
        }, 1000);
    } else if (attemptsLeft > 0) {
        // User salah tapi masih ada kesempatan
        // ===== AUDIO =====
        playSound('wrong');
        
        // Ternary operator: condition ? valueIfTrue : valueIfFalse
        const hint = userGuess > secretNumber ? 'Terlalu tinggi!' : 'Terlalu rendah!';
        const result = userGuess > secretNumber ? 'high' : 'low';
        message.textContent = hint;
        message.style.color = 'var(--secondary-color)';  // Warna kuning untuk peringatan
        
        // ===== ADD TO HISTORY =====
        addToHistory(userGuess, result, hint);
        
        // ===== HINT SOUND =====
        // Play a different sound for hints to distinguish from wrong guesses
        playSound('move'); // Use move sound for hints
    } else {
        // User kehabisan kesempatan
        // ===== AUDIO =====
        playSound('defeat'); // Play defeat sound instead of game over
        
        message.textContent = `Game Over! Angka yang benar adalah ${secretNumber}.`;
        message.style.color = 'red';  // Warna merah untuk game over
        
        // ===== ADD TO HISTORY =====
        const hint = userGuess > secretNumber ? 'Terlalu tinggi!' : 'Terlalu rendah!';
        const result = userGuess > secretNumber ? 'high' : 'low';
        addToHistory(userGuess, result, hint);
        
        endGame(); // Panggil fungsi untuk mengakhiri game
    }

    // Update display sisa percobaan
    attemptsDisplay.textContent = `Sisa percobaan: ${attemptsLeft}`;
}

// ===== GAME END FUNCTION =====
/**
 * Fungsi endGame() - Mengakhiri game dan mengubah UI
 * 
 * Konsep yang dipelajari:
 * - Function untuk mengorganisir kode
 * - DOM Manipulation untuk mengubah state UI
 */
function endGame() {
    guessInput.disabled = true;                    // Nonaktifkan input field
    guessButton.style.display = 'none';            // Sembunyikan tombol tebak
    restartButton.style.display = 'inline-block';  // Tampilkan tombol restart
}

// ===== EVENT LISTENERS =====
// Event listener mendengarkan event tertentu (seperti klik) pada elemen
// Ketika event terjadi, fungsi yang ditentukan akan dijalankan
guessButton.addEventListener('click', () => {
    // ===== AUDIO =====
    playSound('click');
    checkGuess();
});      // Jalankan checkGuess() saat tombol diklik

restartButton.addEventListener('click', () => {
    // ===== AUDIO =====
    playSound('click');
    startGame();
});     // Jalankan startGame() saat tombol restart diklik

// ===== HOVER SOUND EFFECTS =====
// Add hover sound effects for better interactivity
guessButton.addEventListener('mouseenter', () => {
    playSound('hover');
});

restartButton.addEventListener('mouseenter', () => {
    playSound('hover');
});

// Add hover sound for input field focus
guessInput.addEventListener('focus', () => {
    playSound('hover');
});

// Add Enter key support for better UX
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // ===== AUDIO =====
        playSound('click');
        checkGuess();
    }
});

// ===== GAME STARTUP =====
// Panggil startGame() saat halaman pertama kali dimuat
// Ini memastikan game siap dimainkan segera

// Debug audio system
console.log('Audio System Status:', {
    audioManager: !!audioManager,
    directAudio: typeof Audio !== 'undefined'
});

// Test audio on startup
setTimeout(() => {
    console.log('Testing audio system...');
    playSound('click');
}, 1000);

startGame();