// Mine Game JavaScript
class MineGame {
    constructor() {
        this.gridSize = 5;
        this.totalTiles = this.gridSize * this.gridSize;
        this.mines = [];
        this.revealedTiles = [];
        this.gameActive = false;
        this.currentBet = 10;
        this.balance = 1000;
        this.currentMultiplier = 1.00;
        this.tilesRevealed = 0;
        this.minesCount = 8;
        this.gameHistory = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.createGrid(); // สร้างตารางทันทีเมื่อโหลดหน้า
        this.updateDisplay();
    }

    initializeElements() {
        // Game elements
        this.gameGrid = document.getElementById('gameGrid');
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.minesSlider = document.getElementById('minesSlider');
        this.minesValue = document.getElementById('minesValue');
        this.currentMultiplierElement = document.getElementById('currentMultiplier');
        this.tilesRevealedElement = document.getElementById('tilesRevealed');
        this.minesRemainingElement = document.getElementById('minesRemaining');
        this.historyList = document.getElementById('historyList');
        
        // Buttons
        this.newGameBtn = document.getElementById('newGame');
        this.clearGameBtn = document.getElementById('clearGame');
        this.pickRandomBtn = document.getElementById('pickRandomTile');
        this.cashOutBtn = document.getElementById('cashOut');
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.tilesResult = document.getElementById('tilesResult');
        this.multiplierResult = document.getElementById('multiplierResult');
        this.closeModal = document.getElementById('closeModal');
        this.continueBtn = document.getElementById('continueBtn');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
    }

    setupEventListeners() {
        // Game controls
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.clearGameBtn.addEventListener('click', () => this.clearGame());
        this.pickRandomBtn.addEventListener('click', () => this.pickRandomTile());
        this.cashOutBtn.addEventListener('click', () => this.cashOut());
        
        // Bet amount controls
        this.betAmountInput.addEventListener('input', (e) => {
            this.currentBet = parseInt(e.target.value) || 0;
            this.updateDisplay();
        });
        
        // Amount control buttons
        document.getElementById('betHalf').addEventListener('click', () => this.adjustBet(0.5));
        document.getElementById('betDouble').addEventListener('click', () => this.adjustBet(2));
        document.getElementById('betUp').addEventListener('click', () => this.adjustBet(1.1));
        document.getElementById('betDown').addEventListener('click', () => this.adjustBet(0.9));
        
        // Preset amount buttons
        document.querySelectorAll('.preset-btn[data-amount]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentBet = parseInt(e.target.dataset.amount);
                this.betAmountInput.value = this.currentBet;
                this.updateDisplay();
            });
        });
        
        // Mines slider
        this.minesSlider.addEventListener('input', (e) => {
            this.minesCount = parseInt(e.target.value);
            this.minesValue.textContent = this.minesCount;
            this.minesRemainingElement.textContent = this.minesCount;
            this.updateDisplay();
        });
        
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Modal controls
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.continueBtn.addEventListener('click', () => {
            this.hideModal();
            this.startNewGame();
        });
        
        // Auto bet controls (if needed)
        this.setupAutoBetControls();
    }

    setupAutoBetControls() {
        // Auto bet amount controls
        const autoBetAmountInput = document.getElementById('autoBetAmount');
        if (autoBetAmountInput) {
            autoBetAmountInput.addEventListener('input', (e) => {
                this.currentBet = parseInt(e.target.value) || 0;
                this.updateDisplay();
            });
        }
        
        // Auto bet amount control buttons
        document.getElementById('autoBetHalf')?.addEventListener('click', () => this.adjustBet(0.5));
        document.getElementById('autoBetDouble')?.addEventListener('click', () => this.adjustBet(2));
        document.getElementById('autoBetUp')?.addEventListener('click', () => this.adjustBet(1.1));
        document.getElementById('autoBetDown')?.addEventListener('click', () => this.adjustBet(0.9));
        
        // Auto mines slider
        const autoMinesSlider = document.getElementById('autoMinesSlider');
        const autoMinesValue = document.getElementById('autoMinesValue');
        if (autoMinesSlider && autoMinesValue) {
            autoMinesSlider.addEventListener('input', (e) => {
                this.minesCount = parseInt(e.target.value);
                autoMinesValue.textContent = this.minesCount;
                this.minesRemainingElement.textContent = this.minesCount;
                this.updateDisplay();
            });
        }
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panels
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabPanels.forEach(panel => panel.classList.remove('active'));
        
        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    adjustBet(factor) {
        this.currentBet = Math.max(1, Math.floor(this.currentBet * factor));
        this.betAmountInput.value = this.currentBet;
        this.updateDisplay();
    }

    startNewGame() {
        if (this.currentBet > this.balance) {
            this.showMessage('ยอดเงินไม่เพียงพอ', 'error');
            return;
        }
        
        this.gameActive = true;
        this.mines = [];
        this.revealedTiles = [];
        this.tilesRevealed = 0;
        this.currentMultiplier = 1.00;
        
        // Deduct bet from balance
        this.balance -= this.currentBet;
        
        // Generate mines
        this.generateMines();
        
        // Create grid
        this.createGrid();
        
        // Update display
        this.updateDisplay();
        
        this.showMessage('เกมใหม่เริ่มแล้ว! เลือกช่องที่ปลอดภัย', 'success');
    }

    generateMines() {
        this.mines = [];
        const availablePositions = Array.from({length: this.totalTiles}, (_, i) => i);
        
        for (let i = 0; i < this.minesCount; i++) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            const position = availablePositions.splice(randomIndex, 1)[0];
            this.mines.push(position);
        }
    }

    createGrid() {
        this.gameGrid.innerHTML = '';
        
        for (let i = 0; i < this.totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'game-tile';
            tile.dataset.index = i;
            tile.addEventListener('click', () => this.revealTile(i));
            
            this.gameGrid.appendChild(tile);
        }
    }

    revealTile(index) {
        if (!this.gameActive || this.revealedTiles.includes(index)) {
            return;
        }
        
        const tile = document.querySelector(`[data-index="${index}"]`);
        const rect = tile.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.revealedTiles.push(index);
        this.tilesRevealed++;
        
        if (this.mines.includes(index)) {
            // Hit a mine - game over
            this.gameActive = false;
            tile.classList.add('revealed', 'mine');
            tile.innerHTML = '<img src="../../images/game images/mine game images/bomb.png" alt="Bomb" class="tile-icon mine-icon">';
            
            // Play sound and create particles
            this.playSound('mine');
            this.createParticles(x, y, 'mine');
            
            this.endGame(false);
        } else {
            // Safe tile
            tile.classList.add('revealed', 'diamond');
            tile.innerHTML = '<img src="../../images/game images/mine game images/red_diamond.png" alt="Diamond" class="tile-icon diamond-icon">';
            
            // Play sound and create particles
            this.playSound('diamond');
            this.createParticles(x, y, 'diamond');
            
            // Update multiplier
            this.updateMultiplier();
            this.updateDisplay();
            
            // Check if all safe tiles are revealed
            if (this.tilesRevealed === this.totalTiles - this.minesCount) {
                this.endGame(true);
            }
        }
    }

    updateMultiplier() {
        // Calculate multiplier based on revealed tiles and mines
        const safeTiles = this.totalTiles - this.minesCount;
        const remainingSafeTiles = safeTiles - this.tilesRevealed;
        const riskFactor = this.minesCount / (this.minesCount + remainingSafeTiles);
        
        // Base multiplier increases with each tile revealed
        this.currentMultiplier = 1 + (this.tilesRevealed * 0.1) + (riskFactor * 0.5);
        this.currentMultiplier = Math.round(this.currentMultiplier * 100) / 100;
    }

    pickRandomTile() {
        if (!this.gameActive) {
            this.showMessage('กรุณาเริ่มเกมใหม่ก่อน', 'error');
            return;
        }
        
        const availableTiles = [];
        for (let i = 0; i < this.totalTiles; i++) {
            if (!this.revealedTiles.includes(i)) {
                availableTiles.push(i);
            }
        }
        
        if (availableTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableTiles.length);
            this.revealTile(availableTiles[randomIndex]);
        }
    }

    cashOut() {
        if (!this.gameActive || this.tilesRevealed === 0) {
            this.showMessage('ไม่สามารถถอนเงินได้ในขณะนี้', 'error');
            return;
        }
        
        const winnings = Math.floor(this.currentBet * this.currentMultiplier);
        this.balance += winnings;
        
        this.addToHistory(true, winnings, this.tilesRevealed, this.currentMultiplier);
        this.endGame(true, true);
        
        // แสดง popup หลัง Cash out
        this.showCashOutModal(winnings);
    }

    endGame(won, cashedOut = false) {
        this.gameActive = false;
        
        // เฉลยทุกช่องหลังจากจบเกม
        this.revealAllTiles();
        
        if (!cashedOut) {
            if (won) {
                // All safe tiles revealed
                const winnings = Math.floor(this.currentBet * this.currentMultiplier);
                this.balance += winnings;
                this.addToHistory(true, winnings, this.tilesRevealed, this.currentMultiplier);
                this.showResultModal(true, winnings);
            } else {
                // Hit a mine
                this.addToHistory(false, 0, this.tilesRevealed, this.currentMultiplier);
                this.showResultModal(false, 0);
            }
        }
        
        this.updateDisplay();
    }

    clearGame() {
        this.gameActive = false;
        this.mines = [];
        this.revealedTiles = [];
        this.tilesRevealed = 0;
        this.currentMultiplier = 1.00;
        
        this.createGrid();
        this.updateDisplay();
        
        this.showMessage('เกมถูกล้างแล้ว', 'info');
    }

    revealAllTiles() {
        // เฉลยทุกช่องที่ยังไม่ได้เปิดด้วยเอฟเฟกต์
        const unrevealedTiles = [];
        for (let i = 0; i < this.totalTiles; i++) {
            if (!this.revealedTiles.includes(i)) {
                unrevealedTiles.push(i);
            }
        }
        
        // แสดงทีละช่องด้วย delay
        unrevealedTiles.forEach((index, delay) => {
            setTimeout(() => {
                const tile = document.querySelector(`[data-index="${index}"]`);
                const rect = tile.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                // เพิ่มเอฟเฟกต์ revealing
                tile.classList.add('revealing');
                
                if (this.mines.includes(index)) {
                    // แสดงระเบิด
                    tile.classList.add('revealed', 'mine');
                    tile.innerHTML = '<img src="../../images/game images/mine game images/bomb.png" alt="Bomb" class="tile-icon mine-icon">';
                    this.createParticles(x, y, 'mine');
                } else {
                    // แสดงเพชร
                    tile.classList.add('revealed', 'diamond');
                    tile.innerHTML = '<img src="../../images/game images/mine game images/red_diamond.png" alt="Diamond" class="tile-icon diamond-icon">';
                    this.createParticles(x, y, 'diamond');
                }
                
                // ลบเอฟเฟกต์ revealing หลัง 300ms
                setTimeout(() => {
                    tile.classList.remove('revealing');
                }, 300);
            }, delay * 100); // delay 100ms ระหว่างแต่ละช่อง
        });
    }

    showCashOutModal(winnings) {
        this.modalTitle.textContent = 'ถอนเงินสำเร็จ!';
        this.resultIcon.textContent = '💰';
        this.resultMessage.textContent = 'ยินดีด้วย! คุณถอนเงินสำเร็จ!';
        this.resultAmount.textContent = `+${winnings} บาท`;
        this.resultAmount.style.color = '#4caf50';
        this.tilesResult.textContent = this.tilesRevealed;
        this.multiplierResult.textContent = `${this.currentMultiplier}x`;
        
        this.gameResultModal.classList.add('show');
    }

    showResultModal(won, winnings) {
        this.modalTitle.textContent = won ? 'ชนะ!' : 'แพ้!';
        this.resultIcon.textContent = won ? '💎' : '💣';
        this.resultMessage.textContent = won ? 'ยินดีด้วย! คุณชนะ!' : 'เสียใจด้วย! คุณแพ้!';
        this.resultAmount.textContent = won ? `+${winnings} บาท` : `-${this.currentBet} บาท`;
        this.resultAmount.style.color = won ? '#4caf50' : '#f44336';
        this.tilesResult.textContent = this.tilesRevealed;
        this.multiplierResult.textContent = `${this.currentMultiplier}x`;
        
        this.gameResultModal.classList.add('show');
    }

    hideModal() {
        this.gameResultModal.classList.remove('show');
    }

    addToHistory(won, winnings, tiles, multiplier) {
        const historyItem = {
            won,
            winnings,
            tiles,
            multiplier,
            timestamp: new Date()
        };
        
        this.gameHistory.unshift(historyItem);
        
        // Keep only last 10 games
        if (this.gameHistory.length > 10) {
            this.gameHistory = this.gameHistory.slice(0, 10);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        this.gameHistory.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            
            const resultClass = item.won ? 'history-result' : 'history-result loss';
            const resultText = item.won ? `+${item.winnings}` : `-${this.currentBet}`;
            
            historyElement.innerHTML = `
                <span>${item.tiles} tiles</span>
                <span class="${resultClass}">${resultText}</span>
            `;
            
            this.historyList.appendChild(historyElement);
        });
    }

    updateDisplay() {
        this.balanceElement.textContent = this.balance;
        this.currentMultiplierElement.textContent = `${this.currentMultiplier.toFixed(2)}x`;
        this.tilesRevealedElement.textContent = this.tilesRevealed;
        this.minesRemainingElement.textContent = this.minesCount - this.mines.filter(mine => this.revealedTiles.includes(mine)).length;
        
        // Update button states
        this.cashOutBtn.disabled = !this.gameActive || this.tilesRevealed === 0;
        this.pickRandomBtn.disabled = !this.gameActive;
    }

    showMessage(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            border: 1px solid ${type === 'success' ? '#45a049' : type === 'error' ? '#d32f2f' : '#1976d2'};
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Add sound effects (optional)
    playSound(type) {
        // Create audio context for sound effects
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'diamond') {
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            } else if (type === 'mine') {
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }

    // Add particle effects
    createParticles(x, y, type) {
        const particleCount = 10;
        const colors = type === 'diamond' ? ['#9c27b0', '#e91e63', '#ff9800'] : ['#f44336', '#ff5722', '#ff9800'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particleFloat 1s ease-out forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 1000);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mineGame = new MineGame();
});
