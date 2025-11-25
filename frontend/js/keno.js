// Keno Game JavaScript
class KenoGame {
    constructor() {
        this.totalNumbers = 40;
        this.maxSelections = 10;
        this.selectedNumbers = [];
        this.drawnNumbers = [];
        this.gameActive = false;
        this.currentBet = 10;
        this.balance = 1000;
        this.currentMultiplier = 0.00;
        this.hits = 0;
        this.gameHistory = [];
        this.riskLevel = 'low';
        
        // Payout table based on hits
        this.payoutTable = {
            low: [0, 0, 1.0, 3.68, 7.0, 16.5, 40.0],
            classic: [0, 0, 1.0, 3.68, 7.0, 16.5, 40.0],
            medium: [0, 0, 1.0, 3.68, 7.0, 16.5, 40.0],
            high: [0, 0, 1.0, 3.68, 7.0, 16.5, 40.0]
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.createKenoGrid();
        this.updateDisplay();
    }

    initializeElements() {
        // Game elements
        this.kenoGrid = document.getElementById('kenoGrid');
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.currentMultiplierElement = document.getElementById('currentMultiplier');
        this.numbersSelectedElement = document.getElementById('numbersSelected');
        this.numbersDrawnElement = document.getElementById('numbersDrawn');
        this.gameResultDisplay = document.getElementById('gameResultDisplay');
        this.historyList = document.getElementById('historyList');
        
        // Buttons
        this.placeBetBtn = document.getElementById('placeBet');
        this.autoPickBtn = document.getElementById('autoPick');
        this.clearTableBtn = document.getElementById('clearTable');
        
        // Risk buttons
        this.riskBtns = document.querySelectorAll('.risk-btn');
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.numbersResult = document.getElementById('numbersResult');
        this.multiplierResult = document.getElementById('multiplierResult');
        this.closeModal = document.getElementById('closeModal');
        this.continueBtn = document.getElementById('continueBtn');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        
        // Payout table elements
        this.payoutItems = document.querySelectorAll('.payout-item');
        this.hitsItems = document.querySelectorAll('.hits-item');
    }

    setupEventListeners() {
        // Game controls
        this.placeBetBtn.addEventListener('click', () => this.placeBet());
        this.autoPickBtn.addEventListener('click', () => this.autoPick());
        this.clearTableBtn.addEventListener('click', () => this.clearTable());
        
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
        
        // Risk level buttons
        this.riskBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.riskBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.riskLevel = e.target.dataset.risk;
                this.updateDisplay();
            });
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
            this.clearTable();
        });
        
        // Auto bet controls
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

    createKenoGrid() {
        this.kenoGrid.innerHTML = '';
        
        for (let i = 1; i <= this.totalNumbers; i++) {
            const numberElement = document.createElement('div');
            numberElement.className = 'keno-number';
            numberElement.textContent = i;
            numberElement.dataset.number = i;
            numberElement.addEventListener('click', () => this.toggleNumber(i));
            
            this.kenoGrid.appendChild(numberElement);
        }
    }

    toggleNumber(number) {
        if (this.gameActive) {
            this.showMessage('เกมกำลังดำเนินอยู่ ไม่สามารถเปลี่ยนตัวเลขได้', 'error');
            return;
        }
        
        const numberElement = document.querySelector(`[data-number="${number}"]`);
        
        if (this.selectedNumbers.includes(number)) {
            // Remove from selection
            this.selectedNumbers = this.selectedNumbers.filter(n => n !== number);
            numberElement.classList.remove('selected');
        } else {
            // Add to selection (if under limit)
            if (this.selectedNumbers.length < this.maxSelections) {
                this.selectedNumbers.push(number);
                numberElement.classList.add('selected');
            } else {
                this.showMessage(`คุณสามารถเลือกได้สูงสุด ${this.maxSelections} ตัวเลข`, 'error');
            }
        }
        
        this.updateDisplay();
    }

    autoPick() {
        if (this.gameActive) {
            this.showMessage('เกมกำลังดำเนินอยู่ ไม่สามารถเปลี่ยนตัวเลขได้', 'error');
            return;
        }
        
        this.clearTable();
        
        // Randomly select 1-10 numbers
        const numToSelect = Math.floor(Math.random() * 10) + 1;
        const availableNumbers = Array.from({length: this.totalNumbers}, (_, i) => i + 1);
        
        for (let i = 0; i < numToSelect; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const selectedNumber = availableNumbers.splice(randomIndex, 1)[0];
            this.selectedNumbers.push(selectedNumber);
            
            const numberElement = document.querySelector(`[data-number="${selectedNumber}"]`);
            numberElement.classList.add('selected');
        }
        
        this.updateDisplay();
        this.showMessage(`เลือก ${numToSelect} ตัวเลขอัตโนมัติ`, 'success');
    }

    clearTable() {
        if (this.gameActive) {
            this.showMessage('เกมกำลังดำเนินอยู่ ไม่สามารถล้างตารางได้', 'error');
            return;
        }
        
        this.selectedNumbers = [];
        this.drawnNumbers = [];
        this.hits = 0;
        this.currentMultiplier = 0.00;
        
        // Clear all number states
        document.querySelectorAll('.keno-number').forEach(element => {
            element.classList.remove('selected', 'drawn', 'hit', 'miss');
        });
        
        // Clear payout table highlights
        this.payoutItems.forEach(item => item.classList.remove('active'));
        this.hitsItems.forEach(item => item.classList.remove('active'));
        
        this.updateDisplay();
        this.showMessage('ล้างตารางแล้ว', 'info');
    }

    autoResetGame() {
        // Auto reset without showing message
        this.selectedNumbers = [];
        this.drawnNumbers = [];
        this.hits = 0;
        this.currentMultiplier = 0.00;
        
        // Clear all number states
        document.querySelectorAll('.keno-number').forEach(element => {
            element.classList.remove('selected', 'drawn', 'hit', 'miss');
        });
        
        // Clear payout table highlights
        this.payoutItems.forEach(item => item.classList.remove('active'));
        this.hitsItems.forEach(item => item.classList.remove('active'));
        
        // Reset game result display
        this.gameResultDisplay.textContent = 'Game result will be displayed';
        this.gameResultDisplay.style.color = '#ccc';
        
        this.updateDisplay();
    }

    placeBet() {
        if (this.selectedNumbers.length === 0) {
            this.showMessage('กรุณาเลือกตัวเลขก่อนวางเดิมพัน', 'error');
            return;
        }
        
        if (this.currentBet > this.balance) {
            this.showMessage('ยอดเงินไม่เพียงพอ', 'error');
            return;
        }
        
        this.gameActive = true;
        this.drawnNumbers = [];
        this.hits = 0;
        
        // Deduct bet from balance
        this.balance -= this.currentBet;
        
        // Update display
        this.updateDisplay();
        
        // Start drawing numbers
        this.startDrawing();
    }

    startDrawing() {
        this.gameResultDisplay.textContent = 'กำลังจับสลาก...';
        this.placeBetBtn.disabled = true;
        
        // Draw 20 numbers randomly
        const availableNumbers = Array.from({length: this.totalNumbers}, (_, i) => i + 1);
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                const drawnNumber = availableNumbers.splice(randomIndex, 1)[0];
                this.drawnNumbers.push(drawnNumber);
                
                const numberElement = document.querySelector(`[data-number="${drawnNumber}"]`);
                numberElement.classList.add('drawn');
                
                // Check if it's a hit
                if (this.selectedNumbers.includes(drawnNumber)) {
                    this.hits++;
                    numberElement.classList.add('hit');
                    this.createParticles(numberElement);
                } else {
                    numberElement.classList.add('miss');
                }
                
                this.updateDisplay();
                
                // After all numbers are drawn
                if (i === 19) {
                    setTimeout(() => this.endGame(), 1000);
                }
            }, i * 200); // 200ms delay between each draw
        }
    }

    endGame() {
        this.gameActive = false;
        
        // Calculate multiplier based on hits
        const payoutTable = this.payoutTable[this.riskLevel];
        this.currentMultiplier = this.hits < payoutTable.length ? payoutTable[this.hits] : 0;
        
        const winnings = Math.floor(this.currentBet * this.currentMultiplier);
        this.balance += winnings;
        
        // Update payout table
        this.updatePayoutTable();
        
        // Add to history
        this.addToHistory(winnings > 0, winnings, this.hits, this.currentMultiplier);
        
        // Show result
        this.showResult(winnings > 0, winnings);
        
        this.updateDisplay();
        this.placeBetBtn.disabled = false;
        
        // Auto reset game after 3 seconds
        setTimeout(() => {
            this.autoResetGame();
        }, 3000);
    }

    updatePayoutTable() {
        // Clear all highlights
        this.payoutItems.forEach(item => item.classList.remove('active'));
        this.hitsItems.forEach(item => item.classList.remove('active'));
        
        // Highlight current result
        if (this.hits < this.payoutItems.length) {
            this.payoutItems[this.hits].classList.add('active');
            this.hitsItems[this.hits].classList.add('active');
        }
    }

    showResult(won, winnings) {
        this.gameResultDisplay.textContent = won ? 
            `ชนะ! ได้รับ ${winnings} บาท (${this.currentMultiplier}x) - เกมจะรีเซ็ตใน 3 วินาที` : 
            `แพ้! เสีย ${this.currentBet} บาท - เกมจะรีเซ็ตใน 3 วินาที`;
        
        this.gameResultDisplay.style.color = won ? '#4caf50' : '#f44336';
        
        // Show modal
        this.showResultModal(won, winnings);
    }

    showResultModal(won, winnings) {
        this.modalTitle.textContent = won ? 'ชนะ!' : 'แพ้!';
        this.resultIcon.textContent = won ? '🎯' : '😞';
        this.resultMessage.textContent = won ? 'ยินดีด้วย! คุณชนะ!' : 'เสียใจด้วย! คุณแพ้!';
        this.resultAmount.textContent = won ? `+${winnings} บาท` : `-${this.currentBet} บาท`;
        this.resultAmount.style.color = won ? '#4caf50' : '#f44336';
        this.numbersResult.textContent = this.hits;
        this.multiplierResult.textContent = `${this.currentMultiplier}x`;
        
        this.gameResultModal.classList.add('show');
    }

    hideModal() {
        this.gameResultModal.classList.remove('show');
    }

    addToHistory(won, winnings, hits, multiplier) {
        const historyItem = {
            won,
            winnings,
            hits,
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
                <span>${item.hits} hits</span>
                <span class="${resultClass}">${resultText}</span>
            `;
            
            this.historyList.appendChild(historyElement);
        });
    }

    updateDisplay() {
        this.balanceElement.textContent = this.balance;
        this.currentMultiplierElement.textContent = `${this.currentMultiplier.toFixed(2)}x`;
        this.numbersSelectedElement.textContent = this.selectedNumbers.length;
        this.numbersDrawnElement.textContent = this.drawnNumbers.length;
        
        // Update button states
        this.placeBetBtn.disabled = this.gameActive || this.selectedNumbers.length === 0;
        this.autoPickBtn.disabled = this.gameActive;
        this.clearTableBtn.disabled = this.gameActive;
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

    // Add particle effects
    createParticles(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        const particleCount = 8;
        const colors = ['#ffd700', '#ffed4e', '#ffc107'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particleFloat 1s ease-out forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 60 + Math.random() * 40;
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
    const kenoGame = new KenoGame();
});
