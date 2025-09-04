/**
 * ❌⭕ TIC TAC TOE - JavaScript Logic dengan Audio Integration
 * 
 * Game ini mengajarkan konsep JavaScript tingkat lanjut:
 * - ES6 Classes dan Object-Oriented Programming
 * - DOM manipulation dan event handling
 * - Game logic dan win condition checking
 * - Array methods dan algorithms
 * - Audio integration dengan AudioManager
 */

class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.movesByPlayer = { X: [], O: [] }; // Simpan urutan langkah per pemain (maks 3)
        this.winnerHistory = []; // Riwayat pemenang per ronde
        this.winCounters = { X: 0, O: 0, D: 0 };
        
        // DOM elements
        this.boardElement = document.getElementById('board');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.newGameButton = document.getElementById('newGameButton');
        this.resetButton = document.getElementById('resetButton');
        this.winnerHistoryList = document.getElementById('winnerHistory');
        this.resetHistoryButton = document.getElementById('resetHistoryButton');
        this.xWinsCountEl = document.getElementById('xWinsCount');
        this.oWinsCountEl = document.getElementById('oWinsCount');
        this.drawsCountEl = document.getElementById('drawsCount');
        
        // Audio integration
        this.audioManager = window.audioManager;
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.createBoard();
        this.bindEvents();
        this.updateDisplay();
        this.renderHistory();
    }
    
    createBoard() {
        this.boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('data-index', i);
            this.boardElement.appendChild(cell);
        }
    }
    
    bindEvents() {
        // Board click events
        this.boardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.handleCellClick(index);
            }
        });
        
        // Button events
        this.newGameButton.addEventListener('click', () => this.newGame());
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.resetGame());
        }
        if (this.resetHistoryButton) {
            this.resetHistoryButton.addEventListener('click', () => this.resetHistory());
        }
    }
    
    handleCellClick(index) {
        if (this.gameState[index] !== '' || !this.gameActive) {
            return;
        }
        
        // Play click sound
        if (this.audioManager) {
            this.audioManager.playAction('click');
        }
        
        this.gameState[index] = this.currentPlayer;
        this.updateCell(index);

        // Terapkan aturan: jika pemain sudah menempatkan 3 kali, pada langkah ke-4 hapus langkah tertua
        const moves = this.movesByPlayer[this.currentPlayer];
        moves.push(index);
        if (moves.length > 3) {
            const oldestIndex = moves.shift();
            // Hapus tanda lama dari board dan state
            this.gameState[oldestIndex] = '';
            const oldestCell = this.boardElement.children[oldestIndex];
            oldestCell.textContent = '';
            oldestCell.className = 'cell';
        }
        
        if (this.checkWin()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }
    
    updateCell(index) {
        const cell = this.boardElement.children[index];
        cell.textContent = this.currentPlayer;
        // Tambahkan class 'X' atau 'O' (huruf besar) agar cocok dengan CSS .cell.X dan .cell.O
        cell.classList.add(this.currentPlayer);
    }
    
    checkWin() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];
        
        return winConditions.some(condition => {
            return condition.every(index => {
                return this.gameState[index] === this.currentPlayer;
            });
        });
    }
    
    checkDraw() {
        return this.gameState.every(cell => cell !== '');
    }
    
    handleWin() {
        this.gameActive = false;
        
        // Play win sound
        if (this.audioManager) {
            this.audioManager.playGameEvent('win');
        }
        
        this.gameStatusElement.textContent = `Pemain ${this.currentPlayer} Menang!`;
        this.highlightWinningCells();
        this.addHistoryEntry(`Pemain ${this.currentPlayer}`);
        this.incrementCounter(this.currentPlayer);
    }
    
    handleDraw() {
        this.gameActive = false;
        
        // Play draw sound
        if (this.audioManager) {
            this.audioManager.playGameEvent('draw');
        }
        
        this.gameStatusElement.textContent = 'Game Seri!';
        this.addHistoryEntry('Seri');
        this.incrementCounter('D');
    }
    
    highlightWinningCells() {
        // Find winning combination and highlight
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        const winningCombination = winConditions.find(condition => {
            return condition.every(index => {
                return this.gameState[index] === this.currentPlayer;
            });
        });
        
        if (winningCombination) {
            winningCombination.forEach(index => {
                this.boardElement.children[index].classList.add('winner');
            });
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.currentPlayerElement.textContent = this.currentPlayer;
    }
    
    newGame() {
        // Play click sound
        if (this.audioManager) {
            this.audioManager.playAction('click');
        }
        
        this.resetGame();
        this.gameActive = true;
        this.gameStatusElement.textContent = 'Giliranmu!';
    }
    
    resetGame() {
        // Play click sound
        if (this.audioManager) {
            this.audioManager.playAction('click');
        }
        
        this.gameState = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.movesByPlayer = { X: [], O: [] };
        
        // Clear board
        Array.from(this.boardElement.children).forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateDisplay();
        this.gameStatusElement.textContent = 'Giliranmu!';
    }

    addHistoryEntry(resultLabel) {
        this.winnerHistory.push({ result: resultLabel, time: new Date().toLocaleTimeString() });
        this.renderHistory();
    }

    renderHistory() {
        if (!this.winnerHistoryList) return;
        this.winnerHistoryList.innerHTML = '';
        if (this.winnerHistory.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'winner-item';
            emptyItem.textContent = 'Belum ada riwayat.';
            this.winnerHistoryList.appendChild(emptyItem);
            return;
        }
        this.winnerHistory.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'winner-item';
            const isDraw = entry.result === 'Seri';
            const playerChar = isDraw ? 'D' : (entry.result.includes('X') ? 'X' : 'O');
            const badgeClass = isDraw ? 'badge-draw' : (playerChar === 'X' ? 'badge-x' : 'badge-o');

            const left = document.createElement('div');
            left.className = 'winner-left';
            const badge = document.createElement('span');
            badge.className = `badge ${badgeClass}`;
            badge.textContent = playerChar;
            const label = document.createElement('span');
            label.textContent = `${index + 1}. ${entry.result}`;
            left.appendChild(badge);
            left.appendChild(label);

            const meta = document.createElement('span');
            meta.className = 'winner-meta';
            meta.textContent = entry.time;

            li.appendChild(left);
            li.appendChild(meta);
            this.winnerHistoryList.appendChild(li);
        });
        this.updateCountersUI();
    }

    resetHistory() {
        // Play click sound
        if (this.audioManager) {
            this.audioManager.playAction('click');
        }
        this.winnerHistory = [];
        this.winCounters = { X: 0, O: 0, D: 0 };
        this.renderHistory();
    }

    incrementCounter(winnerChar) {
        if (winnerChar === 'X' || winnerChar === 'O' || winnerChar === 'D') {
            this.winCounters[winnerChar] += 1;
        }
        this.updateCountersUI();
    }

    updateCountersUI() {
        if (this.xWinsCountEl) this.xWinsCountEl.textContent = String(this.winCounters.X);
        if (this.oWinsCountEl) this.oWinsCountEl.textContent = String(this.winCounters.O);
        if (this.drawsCountEl) this.drawsCountEl.textContent = String(this.winCounters.D);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new TicTacToe();
        console.log('Tic Tac Toe with Audio initialized successfully');
    } catch (error) {
        console.error('Error initializing Tic Tac Toe with Audio:', error);
    }
});
