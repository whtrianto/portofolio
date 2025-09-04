/**
 * 🧠 MEMORY GAME - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat menengah:
 * - DOM Manipulation (createElement, appendChild, innerHTML)
 * - Arrays dan Array Methods (forEach, push, length)
 * - Spread Operator (...) untuk duplikasi array
 * - ES6 Destructuring untuk array dan object
 * - Event Handling dan Event Delegation
 * - setTimeout() untuk delayed execution
 * - CSS Classes untuk state management
 * - Dataset attributes untuk menyimpan data
 * - Fisher-Yates Shuffle Algorithm
 * - Game State Management
 * - Audio integration dengan AudioManager
 */

// ===== DOM ELEMENTS SELECTION =====
// Mengambil elemen HTML yang diperlukan untuk game
const memoryGrid = document.getElementById('memoryGrid');      // Container untuk grid kartu
const movesDisplay = document.getElementById('moves');         // Display jumlah langkah
const pairsDisplay = document.getElementById('pairs');         // Display jumlah pasangan
const restartButton = document.getElementById('restartButton'); // Tombol restart game
const hintButton = document.getElementById('hintButton');      // Tombol hint

// ===== AUDIO INTEGRATION =====
const audioManager = window.audioManager;

// ===== GAME DATA SETUP =====
// Array berisi simbol yang akan digunakan untuk kartu
const cardSymbols = ['🧠', '🎮', '🚀', '🤖', '👾', '👽', '🌟', '🍕'];

// Spread operator (...) mengcopy semua elemen dari cardSymbols
// Kemudian menggabungkan dengan copy yang sama untuk membuat pasangan
// Hasil: ['🧠', '🎮', '🚀', '🤖', '👾', '👽', '🌟', '🍕', '🧠', '🎮', '🚀', '🤖', '👾', '👽', '🌟', '🍕']
let gameCards = [...cardSymbols, ...cardSymbols];

// ===== GAME STATE VARIABLES =====
// Array untuk menyimpan kartu yang sedang dibalik dalam satu giliran
let flippedCards = [];

// Counter untuk pasangan yang sudah cocok
let matchedPairs = 0;

// Counter untuk jumlah langkah yang dilakukan
let moves = 0;

// Boolean flag untuk mencegah klik saat kartu sedang diperiksa
let isBoardLocked = false;

// Counter untuk penggunaan hint (maksimal 2x)
let hintCount = 0;
const MAX_HINTS = 2;

// ===== UTILITY FUNCTIONS =====
/**
 * Fungsi shuffle() - Mengacak array menggunakan Fisher-Yates Shuffle Algorithm
 * 
 * Konsep yang dipelajari:
 * - For loop dengan decrement (i--)
 * - Math.random() untuk generate index acak
 * - ES6 Array Destructuring untuk swap elements
 * - Algorithm implementation
 * 
 * Cara kerja Fisher-Yates:
 * 1. Mulai dari index terakhir
 * 2. Pilih index acak dari 0 sampai index saat ini
 * 3. Swap elemen pada kedua index
 * 4. Lanjut ke index sebelumnya
 */
function shuffle(array) {
    // Loop dari index terakhir ke index pertama
    for (let i = array.length - 1; i > 0; i--) {
        // Generate index acak dari 0 sampai i (inclusive)
        const j = Math.floor(Math.random() * (i + 1));
        
        // ES6 Destructuring untuk swap elements
        // [array[i], array[j]] = [array[j], array[i]] artinya:
        // array[i] = array[j] dan array[j] = array[i]
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===== BOARD CREATION FUNCTION =====
/**
 * Fungsi createBoard() - Membuat dan mengatur papan permainan
 * 
 * Konsep yang dipelajari:
 * - DOM manipulation (innerHTML, createElement, appendChild)
 * - Array methods (forEach)
 * - CSS classes untuk styling
 * - Dataset attributes untuk menyimpan data
 * - Event listeners
 * - State reset
 * - Audio feedback untuk game start
 */
function createBoard() {
    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playGameEvent('start');
    }
    
    // ===== RESET GAME STATE =====
    memoryGrid.innerHTML = '';        // Kosongkan grid
    flippedCards = [];                // Reset kartu yang dibalik
    matchedPairs = 0;                 // Reset pasangan yang cocok
    moves = 0;                        // Reset jumlah langkah
    hintCount = 0;                    // Reset counter hint
    movesDisplay.textContent = moves; // Update display
    updatePairsDisplay();              // Update display pasangan
    isBoardLocked = false;            // Unlock board
    updateHintButton(); // Update tombol hint saat game dimulai

    // Acak urutan kartu
    shuffle(gameCards);

    // ===== CREATE CARDS =====
    // forEach menjalankan fungsi untuk setiap elemen dalam array
    gameCards.forEach(symbol => {
        // Buat elemen div baru untuk kartu
        const card = document.createElement('div');
        
        // Tambahkan CSS class 'card' untuk styling
        card.classList.add('card');
        
        // Simpan simbol dalam data attribute untuk pengecekan
        card.dataset.symbol = symbol;

        // ===== CARD STRUCTURE =====
        // innerHTML mengisi konten HTML dalam elemen
        // card-back: sisi belakang kartu (tampilkan ?)
        // card-front: sisi depan kartu (tampilkan simbol)
        card.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${symbol}</div>
        `;

        // Tambahkan event listener untuk klik
        card.addEventListener('click', flipCard);
        
        // Tambahkan kartu ke grid
        memoryGrid.appendChild(card);
    });
}

// ===== CARD INTERACTION FUNCTION =====
/**
 * Fungsi flipCard() - Menangani klik pada kartu
 * 
 * Konsep yang dipelajari:
 * - Event handling dengan 'this' context
 * - CSS classes untuk state management
 * - Array methods (push, length)
 * - Conditional logic
 * - Board locking mechanism
 * - Audio feedback untuk klik kartu
 */
function flipCard() {
    // ===== VALIDATION CHECKS =====
    // this merujuk ke elemen yang diklik
    // classList.contains() mengecek apakah elemen memiliki class tertentu
    
    // Abaikan jika:
    // 1. Board sedang terkunci (sedang memeriksa kartu)
    // 2. Kartu sudah dibalik
    // 3. Kartu sudah cocok (tidak bisa diklik lagi)
    if (isBoardLocked || this.classList.contains('flipped')) return;

    // ===== FLIP CARD =====
    // Tambahkan class 'flipped' untuk animasi dan styling
    this.classList.add('flipped');
    
    // Tambahkan kartu ke array flippedCards
    flippedCards.push(this);

    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playAction('click');
    }

    // ===== CHECK FOR MATCH =====
    // Jika sudah ada 2 kartu yang dibalik
    if (flippedCards.length === 2) {
        isBoardLocked = true;  // Lock board untuk mencegah klik
        incrementMoves();       // Tambah counter langkah
        checkForMatch();        // Periksa kecocokan
    }
}

// ===== MATCH CHECKING FUNCTION =====
/**
 * Fungsi checkForMatch() - Memeriksa apakah dua kartu cocok
 * 
 * Konsep yang dipelajari:
 * - Array destructuring untuk mengambil elemen
 * - Dataset access untuk membandingkan data
 * - Conditional logic untuk menentukan aksi
 * - Audio feedback untuk kecocokan
 */
function checkForMatch() {
    // ES6 Destructuring: mengambil elemen pertama dan kedua dari array
    const [cardOne, cardTwo] = flippedCards;
    
    // Bandingkan simbol dari kedua kartu menggunakan dataset
    const isMatch = cardOne.dataset.symbol === cardTwo.dataset.symbol;

    // Jika cocok, disable kartu. Jika tidak, balik kembali
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

// ===== MATCHED CARDS HANDLING =====
/**
 * Fungsi disableCards() - Menangani kartu yang sudah cocok
 * 
 * Konsep yang dipelajari:
 * - removeEventListener untuk menghapus event handler
 * - Counter increment
 * - Win condition checking
 * - setTimeout untuk delayed execution
 * - Audio feedback untuk kecocokan
 */
function disableCards() {
    // Destructure untuk mendapatkan kedua kartu
    const [cardOne, cardTwo] = flippedCards;
    
    // ===== ADD MATCHED CLASS =====
    // Tambahkan class 'matched' untuk styling dan tracking
    cardOne.classList.add('matched');
    cardTwo.classList.add('matched');
    
    // ===== REMOVE EVENT LISTENERS =====
    // Kartu yang sudah cocok tidak bisa diklik lagi
    cardOne.removeEventListener('click', flipCard);
    cardTwo.removeEventListener('click', flipCard);
    
    // ===== UPDATE GAME STATE =====
    matchedPairs++;  // Increment counter pasangan yang cocok
    updatePairsDisplay(); // Update display pasangan
    resetBoard();    // Reset board untuk giliran berikutnya

    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playAction('match');
    }

    // ===== WIN CONDITION CHECK =====
    // Jika semua pasangan sudah cocok
    if (matchedPairs === cardSymbols.length) {
        // setTimeout menunda eksekusi selama 500ms
        // Ini memberi waktu untuk animasi kartu selesai
        setTimeout(() => {
            if (audioManager) {
                audioManager.playGameEvent('win');
            }
            // Popup kemenangan dihilangkan, hanya menggunakan sound
        }, 500);
    }
}

// ===== UNMATCHED CARDS HANDLING =====
/**
 * Fungsi unflipCards() - Membalik kembali kartu yang tidak cocok
 * 
 * Konsep yang dipelajari:
 * - setTimeout untuk delayed execution
 * - CSS class removal
 * - Timing dalam game mechanics
 * - Audio feedback untuk tidak cocok
 */
function unflipCards() {
    // setTimeout menunda eksekusi selama 1200ms (1.2 detik)
    // Ini memberi waktu player melihat kartu kedua
    setTimeout(() => {
        const [cardOne, cardTwo] = flippedCards;
        
        // Hapus class 'flipped' untuk membalik kartu kembali
        cardOne.classList.remove('flipped');
        cardTwo.classList.remove('flipped');
        
        // Reset board untuk giliran berikutnya
        resetBoard();

        // ===== AUDIO =====
        if (audioManager) {
            audioManager.playAction('wrong');
        }
    }, 1200);
}

// ===== BOARD RESET FUNCTION =====
/**
 * Fungsi resetBoard() - Mereset state board untuk giliran berikutnya
 * 
 * Konsep yang dipelajari:
 * - State management
 * - Boolean flag usage
 */
function resetBoard() {
    flippedCards = [];     // Kosongkan array kartu yang dibalik
    isBoardLocked = false; // Unlock board untuk klik berikutnya
}

// ===== MOVES COUNTER FUNCTION =====
/**
 * Fungsi incrementMoves() - Menambah dan menampilkan counter langkah
 * 
 * Konsep yang dipelajari:
 * - Counter increment
 * - DOM update
 * - Audio feedback untuk langkah
 */
function incrementMoves() {
    moves++;                           // Tambah counter
    movesDisplay.textContent = moves;  // Update display

    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playAction('move');
    }
}

// ===== PAIRS DISPLAY FUNCTION =====
/**
 * Fungsi updatePairsDisplay() - Update display jumlah pasangan yang sudah cocok
 */
function updatePairsDisplay() {
    pairsDisplay.textContent = `${matchedPairs}/${cardSymbols.length}`;
}

// ===== HINT FUNCTION =====
/**
 * Fungsi showHint() - Menampilkan petunjuk dengan membalik semua kartu sebentar
 * Hanya bisa digunakan maksimal 2x
 */
function showHint() {
    if (isBoardLocked) return; // Jangan berikan hint jika board sedang terkunci
    
    // Cek apakah hint masih tersedia
    if (hintCount >= MAX_HINTS) {
        return; // Hint sudah habis
    }
    
    // Increment counter hint
    hintCount++;
    
    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playAction('hover');
    }
    
    // Balik semua kartu yang belum cocok
    const unmatchedCards = document.querySelectorAll('.card:not(.flipped)');
    
    unmatchedCards.forEach(card => {
        card.classList.add('flipped');
    });
    
    // Setelah 2 detik, balik kembali kartu yang tidak cocok
    setTimeout(() => {
        unmatchedCards.forEach(card => {
            if (!card.classList.contains('matched')) {
                card.classList.remove('flipped');
            }
        });
    }, 2000);
    
    // Update tombol hint
    updateHintButton();
}

// ===== HINT BUTTON UPDATE FUNCTION =====
/**
 * Fungsi updateHintButton() - Update tampilan tombol hint berdasarkan sisa penggunaan
 */
function updateHintButton() {
    const remainingHints = MAX_HINTS - hintCount;
    if (remainingHints <= 0) {
        hintButton.textContent = '💡 Petunjuk Habis';
        hintButton.disabled = true;
        hintButton.classList.add('disabled');
    } else {
        hintButton.textContent = `💡 Petunjuk (${remainingHints})`;
        hintButton.disabled = false;
        hintButton.classList.remove('disabled');
    }
}

// ===== EVENT LISTENERS SETUP =====
// Event listener untuk tombol restart
restartButton.addEventListener('click', () => {
    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playAction('click');
    }
    createBoard();
});

// Event listener untuk tombol hint
hintButton.addEventListener('click', () => {
    showHint();
});

// ===== GAME INITIALIZATION =====
// Mulai game saat halaman pertama kali dimuat
createBoard();