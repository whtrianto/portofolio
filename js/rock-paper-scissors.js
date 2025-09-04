/**
 * 🪨✂️📄 ROCK PAPER SCISSORS GAME - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat menengah:
 * - DOM Selection dengan querySelectorAll() dan getElementById()
 * - Arrays dan Array Methods (forEach, Math.random dengan array)
 * - Objects untuk menyimpan data (score, player info)
 * - localStorage untuk menyimpan data di browser
 * - Event Handling dengan event delegation
 * - Data Attributes (dataset) untuk menyimpan data di HTML
 * - JSON.stringify() dan JSON.parse() untuk data serialization
 * - Arrow Functions dan Callback Functions
 * - Audio integration dengan AudioManager
 */

// ===== DOM ELEMENTS SELECTION =====
// querySelectorAll() memilih semua elemen yang cocok dengan selector CSS
// getElementById() memilih elemen berdasarkan ID (lebih spesifik)
const choiceButtons = document.querySelectorAll('.choices button');      // Semua tombol pilihan (batu, kertas, gunting)
const playerChoiceDisplay = document.getElementById('player-choice');    // Display pilihan player
const computerChoiceDisplay = document.getElementById('computer-choice'); // Display pilihan computer
const resultMessage = document.getElementById('result-message');         // Pesan hasil game
const playerScoreDisplay = document.getElementById('player-score');      // Display skor player
const computerScoreDisplay = document.getElementById('computer-score');  // Display skor computer
const nicknameInput = document.getElementById('nicknameInput');           // Input field untuk nickname
const saveNicknameButton = document.getElementById('saveNickname');      // Tombol untuk save nickname
const nicknameDisplay = document.getElementById('nicknameDisplay');      // Display nickname
const historyList = document.getElementById('rpsHistory');
const resetScoresBtn = document.getElementById('resetScores');
const playerEmoji = document.getElementById('player-emoji');
const computerEmoji = document.getElementById('computer-emoji');
const playerTag = document.getElementById('player-tag');

// ===== GAME STATE VARIABLES =====
// Array berisi semua pilihan yang tersedia dalam game
const choices = ['batu', 'kertas', 'gunting'];

// Object untuk menyimpan skor player dan computer
// Menggunakan object literal syntax: { property: value }
let score = { player: 0, computer: 0 };

// String untuk menyimpan nickname player
let nickname = 'Pemain';

// ===== AUDIO INTEGRATION =====
const audioManager = window.audioManager;

// ===== DISPLAY EMOJI/EMOTE UNTUK PILIHAN =====
const emojiByChoice = {
    batu: '✊',
    kertas: '✋',
    gunting: '✌️'
};

function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatChoice(choice, isComputer = false) {
    const emoji = emojiByChoice[choice] || '';
    const label = capitalize(choice);
    return isComputer ? `🤖 ${emoji} ${label}` : `${emoji} ${label}`;
}

// ===== DATA PERSISTENCE FUNCTIONS =====
/**
 * Fungsi loadData() - Memuat data dari localStorage saat game dimulai
 * 
 * Konsep yang dipelajari:
 * - localStorage untuk menyimpan data di browser (persistent storage)
 * - JSON.parse() untuk mengubah string JSON menjadi object JavaScript
 * - Null checking untuk memastikan data ada sebelum digunakan
 * - Function untuk mengorganisir kode yang berhubungan dengan data
 */
function loadData() {
    // localStorage.getItem() mengambil data berdasarkan key
    // JSON.parse() mengubah string JSON menjadi object JavaScript
    const savedScore = JSON.parse(localStorage.getItem('rpsScore'));
    
    // Null checking: jika ada data tersimpan, gunakan data tersebut
    if (savedScore) {
        score = savedScore; // Update variabel score dengan data yang tersimpan
    }
    
    // Load nickname yang tersimpan
    const savedNickname = localStorage.getItem('rpsNickname');
    if (savedNickname) {
        nickname = savedNickname;
        nicknameInput.value = nickname; // Set nilai input field
    }
    
    // Update tampilan dengan data yang baru dimuat
    updateScoreboard();
    nicknameDisplay.textContent = nickname;
}

/**
 * Fungsi saveData() - Menyimpan data ke localStorage
 * 
 * Konsep yang dipelajari:
 * - localStorage.setItem() untuk menyimpan data
 * - JSON.stringify() untuk mengubah object JavaScript menjadi string JSON
 * - Data persistence (data tersimpan meskipun browser ditutup)
 */
function saveData() {
    // JSON.stringify() mengubah object menjadi string JSON
    // localStorage hanya bisa menyimpan string, bukan object
    localStorage.setItem('rpsScore', JSON.stringify(score));
    localStorage.setItem('rpsNickname', nickname);
}

// ===== UI UPDATE FUNCTIONS =====
/**
 * Fungsi updateScoreboard() - Memperbarui tampilan skor
 * 
 * Konsep yang dipelajari:
 * - DOM manipulation untuk update tampilan
 * - Object property access (score.player, score.computer)
 */
function updateScoreboard() {
    playerScoreDisplay.textContent = score.player;     // Update skor player
    computerScoreDisplay.textContent = score.computer; // Update skor computer
    if (playerTag) playerTag.textContent = nickname || 'Pemain';
}

// ===== GAME LOGIC FUNCTION =====
/**
 * Fungsi determineWinner() - Menentukan pemenang berdasarkan pilihan player dan computer
 * 
 * Konsep yang dipelajari:
 * - Conditional Logic (if-else statements)
 * - Logical Operators (|| untuk OR, && untuk AND)
 * - Comparison Operators (=== untuk strict equality)
 * - Object property modification (score.player++, score.computer++)
 * - Return statement untuk mengembalikan nilai dari fungsi
 * 
 * Logika Game:
 * - Batu mengalahkan Gunting
 * - Kertas mengalahkan Batu  
 * - Gunting mengalahkan Kertas
 * - Jika sama = Seri
 */
function determineWinner(player, computer) {
    // Cek apakah pilihan sama (seri)
    if (player === computer) {
        // ===== AUDIO =====
        if (audioManager) {
            audioManager.playGameEvent('draw');
        }
        return 'Seri!'; // Return langsung keluar dari fungsi
    }
    
    // ===== LOGIKA MENANG PLAYER =====
    // Menggunakan logical OR (||) untuk menggabungkan kondisi menang
    // Setiap kondisi menggunakan logical AND (&&) untuk memastikan kedua syarat terpenuhi
    if (
        (player === 'batu' && computer === 'gunting') ||      // Batu vs Gunting
        (player === 'kertas' && computer === 'batu') ||       // Kertas vs Batu
        (player === 'gunting' && computer === 'kertas')       // Gunting vs Kertas
    ) {
        score.player++; // Increment skor player (sama dengan score.player = score.player + 1)
        
        // ===== AUDIO =====
        if (audioManager) {
            audioManager.playGameEvent('win');
        }
        
        return 'Kamu Menang!';
    }
    
    // Jika tidak seri dan tidak menang, berarti computer menang
    score.computer++; // Increment skor computer
    
    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playGameEvent('over');
    }
    
    return 'Kamu Kalah!';
}

// ===== MAIN GAME FUNCTION =====
/**
 * Fungsi playGame() - Fungsi utama yang dijalankan setiap kali player memilih
 * 
 * Konsep yang dipelajari:
 * - Event handling (event parameter)
 * - currentTarget vs target dalam event handling
 * - dataset untuk mengakses data attributes dari HTML
 * - Math.random() dengan array untuk pilihan random computer
 * - Function composition (memanggil fungsi lain)
 */
function playGame(event) {
    // ===== AUDIO =====
    if (audioManager) {
        this.classList.add('pressed');
        setTimeout(() => this.classList.remove('pressed'), 120);
        audioManager.playAction('click');
    }
    
    // event.currentTarget adalah elemen yang memiliki event listener
    // dataset.choice mengakses data-choice="batu" dari HTML
    const playerChoice = event.currentTarget.dataset.choice;
    
    // Math.random() * choices.length menghasilkan 0-2.999...
    // Math.floor() membulatkan ke bawah menjadi 0, 1, atau 2
    // choices[index] mengambil elemen array berdasarkan index
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    // ===== UPDATE UI =====
    // Menampilkan pilihan player dan computer dengan EMOTE/EMOJI
    playerChoiceDisplay.textContent = formatChoice(playerChoice, false);
    computerChoiceDisplay.textContent = formatChoice(computerChoice, true);
    if (playerEmoji) playerEmoji.textContent = emojiByChoice[playerChoice] || '❔';
    if (computerEmoji) computerEmoji.textContent = emojiByChoice[computerChoice] || '❔';

    // ===== DETERMINE WINNER =====
    // Panggil fungsi determineWinner() dan simpan hasilnya
    const result = determineWinner(playerChoice, computerChoice);
    resultMessage.textContent = result; // Tampilkan hasil

    // Tambahkan ke riwayat
    if (historyList) {
        const li = document.createElement('li');
        li.style.margin = '4px 0';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.gap = '8px';
        li.innerHTML = `<span>${emojiByChoice[playerChoice]} vs ${emojiByChoice[computerChoice]}</span><span style="margin-right: 15px;">${result}</span>`;
        historyList.prepend(li);
        // batasi 20 item
        while (historyList.children.length > 20) historyList.removeChild(historyList.lastChild);
    }
    
    // ===== UPDATE SCORE AND SAVE =====
    // Update tampilan skor dan simpan ke localStorage
    updateScoreboard();
    saveData();
}

// ===== EVENT LISTENERS SETUP =====
// forEach() adalah array method yang menjalankan fungsi untuk setiap elemen
// Arrow function (=>) adalah cara singkat menulis function
// button => button.addEventListener('click', playGame) artinya:
// "Untuk setiap button, tambahkan event listener 'click' yang menjalankan playGame"
choiceButtons.forEach(button => button.addEventListener('click', playGame));

// Event listener untuk tombol save nickname
// Menggunakan arrow function untuk event handler
saveNicknameButton.addEventListener('click', () => {
    // ===== AUDIO =====
    if (audioManager) {
        audioManager.playAction('click');
    }
    
    // trim() menghapus spasi di awal dan akhir string
    const newNickname = nicknameInput.value.trim();
    
    // Cek apakah nickname tidak kosong
    if (newNickname) {
        nickname = newNickname; // Update variabel nickname
        nicknameDisplay.textContent = nickname; // Update tampilan
        saveData(); // Simpan ke localStorage
        alert('Nickname berhasil disimpan!'); // Tampilkan pesan sukses
    }
});

resetScoresBtn && resetScoresBtn.addEventListener('click', () => {
    if (audioManager) audioManager.playAction('click');
    score = { player: 0, computer: 0 };
    updateScoreboard();
    saveData();
});

// ===== GAME INITIALIZATION =====
// Event listener untuk window 'load' event
// loadData() akan dijalankan setelah semua elemen HTML dimuat
window.addEventListener('load', () => {
    loadData();
    if (playerTag) playerTag.textContent = nickname || 'Pemain';
});