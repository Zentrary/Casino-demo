// Crash Game JavaScript
class CrashGame {
    constructor() {
        // Game state
        this.gameActive = false;
        this.currentBet = 10;
        this.balance = 1000;
        this.currentMultiplier = 1.00;
        this.targetMultiplier = 2.00;
        this.crashPoint = 0;
        this.gameHistory = [];
        this.recentMultipliers = [];
        this.autoBetActive = false;
        this.autoBetSettings = {
            amount: 10,
            targetMultiplier: 2.00,
            numberOfBets: Infinity,
            onWinAction: 'reset',
            onWinPercent: 10,
            onLossAction: 'reset',
            onLossPercent: 10,
            stopOnWin: 0,
            stopOnLoss: 0
        };
        this.autoBetStats = {
            betsPlaced: 0,
            betsRemaining: Infinity,
            totalProfit: 0,
            wins: 0,
            losses: 0
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.startNewRound();
    }

    initializeElements() {
        // Game elements
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.targetMultiplierInput = document.getElementById('targetMultiplier');
        this.winChanceElement = document.getElementById('winChance');
        this.profitAmountElement = document.getElementById('profitAmount');
        this.currentMultiplierElement = document.getElementById('currentMultiplier');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.historyList = document.getElementById('historyList');
        // Recent history element removed
        
        // Buttons
        this.placeBetBtn = document.getElementById('placeBet');
        this.newRoundBtn = document.getElementById('newRound');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        // Auto bet elements
        this.autoBetAmountInput = document.getElementById('autoBetAmount');
        this.autoTargetMultiplierInput = document.getElementById('autoTargetMultiplier');
        this.autoWinChanceElement = document.getElementById('autoWinChance');
        this.numberOfBetsInput = document.getElementById('numberOfBets');
        this.advancedToggle = document.getElementById('advancedToggle');
        this.advancedPanel = document.getElementById('advancedPanel');
        this.onWinActionSelect = document.getElementById('onWinAction');
        this.onWinPercentInput = document.getElementById('onWinPercent');
        this.onLossActionSelect = document.getElementById('onLossAction');
        this.onLossPercentInput = document.getElementById('onLossPercent');
        this.stopOnWinInput = document.getElementById('stopOnWin');
        this.stopOnLossInput = document.getElementById('stopOnLoss');
        this.startAutoBetBtn = document.getElementById('startAutoBet');
        this.stopAutoBetBtn = document.getElementById('stopAutoBet');
        
        // Auto bet status elements
        this.betsPlacedElement = document.getElementById('betsPlaced');
        this.betsRemainingElement = document.getElementById('betsRemaining');
        this.totalProfitElement = document.getElementById('totalProfit');
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.crashMultiplierElement = document.getElementById('crashMultiplier');
        this.profitResultElement = document.getElementById('profitResult');
        this.closeModal = document.getElementById('closeModal');
        this.continueBtn = document.getElementById('continueBtn');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
    }

    setupEventListeners() {
        // Manual bet controls
        this.placeBetBtn.addEventListener('click', () => this.placeBet());
        
        // Bet amount controls
        this.betAmountInput.addEventListener('input', (e) => {
            this.currentBet = parseFloat(e.target.value) || 0;
            this.updateProfitDisplay();
        });
        
        // Amount control buttons
        document.getElementById('betHalf').addEventListener('click', () => this.adjustBet(0.5));
        document.getElementById('betDouble').addEventListener('click', () => this.adjustBet(2));
        document.getElementById('betUp').addEventListener('click', () => this.adjustBet(1.1));
        document.getElementById('betDown').addEventListener('click', () => this.adjustBet(0.9));
        
        // Preset amount buttons
        document.querySelectorAll('.preset-btn[data-amount]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentBet = parseFloat(e.target.dataset.amount);
                this.betAmountInput.value = this.currentBet;
                this.updateProfitDisplay();
            });
        });
        
        // Target multiplier controls
        this.targetMultiplierInput.addEventListener('input', (e) => {
            this.targetMultiplier = parseFloat(e.target.value) || 1.01;
            this.updateWinChance();
            this.updateProfitDisplay();
        });
        
        // Auto bet controls
        this.autoBetAmountInput.addEventListener('input', (e) => {
            this.autoBetSettings.amount = parseFloat(e.target.value) || 0;
            this.updateAutoBetProfitDisplay();
        });
        
        this.autoTargetMultiplierInput.addEventListener('input', (e) => {
            this.autoBetSettings.targetMultiplier = parseFloat(e.target.value) || 1.01;
            this.updateAutoBetWinChance();
            this.updateAutoBetProfitDisplay();
        });
        
        // Auto bet amount control buttons
        document.getElementById('autoBetHalf')?.addEventListener('click', () => this.adjustAutoBet(0.5));
        document.getElementById('autoBetDouble')?.addEventListener('click', () => this.adjustAutoBet(2));
        document.getElementById('autoBetUp')?.addEventListener('click', () => this.adjustAutoBet(1.1));
        document.getElementById('autoBetDown')?.addEventListener('click', () => this.adjustAutoBet(0.9));
        
        // Number of bets
        this.numberOfBetsInput.addEventListener('input', (e) => {
            const value = e.target.value;
            this.autoBetSettings.numberOfBets = value === '∞' ? Infinity : parseInt(value) || 0;
            this.autoBetStats.betsRemaining = this.autoBetSettings.numberOfBets;
            this.updateAutoBetStatus();
        });
        
        // Preset bets
        document.querySelectorAll('.preset-btn[data-bets]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.target.dataset.bets;
                this.numberOfBetsInput.value = value;
                this.autoBetSettings.numberOfBets = value === '∞' ? Infinity : parseInt(value);
                this.autoBetStats.betsRemaining = this.autoBetSettings.numberOfBets;
                this.updateAutoBetStatus();
            });
        });
        
        // Advanced settings
        this.advancedToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.advancedPanel.classList.add('show');
            } else {
                this.advancedPanel.classList.remove('show');
            }
        });
        
        // Auto bet action buttons
        this.startAutoBetBtn.addEventListener('click', () => this.startAutoBet());
        this.stopAutoBetBtn.addEventListener('click', () => this.stopAutoBet());
        
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
            this.startNewRound();
        });
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
        this.updateProfitDisplay();
    }

    adjustAutoBet(factor) {
        this.autoBetSettings.amount = Math.max(1, Math.floor(this.autoBetSettings.amount * factor));
        this.autoBetAmountInput.value = this.autoBetSettings.amount;
        this.updateAutoBetProfitDisplay();
    }

    // RNG System - Provably Fair
    generateCrashPoint() {
        // Use crypto.getRandomValues for better randomness
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const randomValue = array[0] / (0xffffffff + 1);
        
        // Generate crash point using exponential distribution
        // Higher values are less likely (more realistic crash behavior)
        const crashPoint = Math.max(1.00, 1 / (1 - randomValue));
        
        // Cap at reasonable maximum (e.g., 1000x)
        return Math.min(crashPoint, 1000);
    }

    updateWinChance() {
        // Calculate win chance based on target multiplier
        // Win chance = 99 / target multiplier
        const winChance = Math.min(99, 99 / this.targetMultiplier);
        this.winChanceElement.textContent = `${winChance.toFixed(2)}%`;
    }

    updateAutoBetWinChance() {
        const winChance = Math.min(99, 99 / this.autoBetSettings.targetMultiplier);
        this.autoWinChanceElement.textContent = `${winChance.toFixed(2)}%`;
    }

    updateProfitDisplay() {
        const profit = this.currentBet * (this.targetMultiplier - 1);
        this.profitAmountElement.textContent = profit.toFixed(2);
    }

    updateAutoBetProfitDisplay() {
        const profit = this.autoBetSettings.amount * (this.autoBetSettings.targetMultiplier - 1);
        // Update auto bet profit display if element exists
        const autoProfitElement = document.getElementById('autoProfitAmount');
        if (autoProfitElement) {
            autoProfitElement.textContent = profit.toFixed(2);
        }
    }

    placeBet() {
        if (this.gameActive) {
            this.showMessage('เกมกำลังดำเนินอยู่ กรุณารอให้จบก่อน', 'error');
            return;
        }
        
        if (this.currentBet > this.balance) {
            this.showMessage('ยอดเงินไม่เพียงพอ', 'error');
            return;
        }
        
        if (this.currentBet < 1) {
            this.showMessage('จำนวนเงินเดิมพันต้องมากกว่า 0', 'error');
            return;
        }
        
        // Deduct bet from balance
        this.balance -= this.currentBet;
        
        // Generate crash point
        this.crashPoint = this.generateCrashPoint();
        
        // Start the game
        this.gameActive = true;
        this.currentMultiplier = 1.00;
        
        this.updateDisplay();
        this.startMultiplierAnimation();
        
        this.showMessage('การเดิมพันได้รับการยอมรับ!', 'success');
    }

    startMultiplierAnimation() {
        const startTime = Date.now();
        const duration = Math.random() * 3000 + 2000; // 2-5 seconds
        
        const animate = () => {
            if (!this.gameActive) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current multiplier
            this.currentMultiplier = 1 + (this.crashPoint - 1) * easeOut;
            
            // Check if we should crash
            if (this.currentMultiplier >= this.crashPoint) {
                this.crash();
                return;
            }
            
            this.updateDisplay();
            requestAnimationFrame(animate);
        };
        
        animate();
    }


    crash() {
        this.gameActive = false;
        
        // ตรวจสอบว่า crash point ถึง Target Multiplier หรือไม่
        const won = this.crashPoint >= this.targetMultiplier;
        
        // Add to recent multipliers
        this.recentMultipliers.unshift({
            multiplier: this.crashPoint,
            won: won,
            timestamp: new Date()
        });
        
        // Keep only last 20 results
        if (this.recentMultipliers.length > 20) {
            this.recentMultipliers = this.recentMultipliers.slice(0, 20);
        }
        
        if (won) {
            // ชนะ - ได้เงินตาม Target Multiplier
            const winnings = Math.floor(this.currentBet * this.targetMultiplier);
            this.balance += winnings;
            this.addToHistory(true, winnings, this.crashPoint);
            this.showMessage(`ชนะ! Crash ที่ ${this.crashPoint.toFixed(2)}x ได้รับ ${winnings} บาท`, 'success');
        } else {
            // แพ้ - ไม่ได้เงิน
            this.addToHistory(false, 0, this.crashPoint);
            this.showMessage(`แพ้! Crash ที่ ${this.crashPoint.toFixed(2)}x ไม่ถึงเป้าหมาย ${this.targetMultiplier.toFixed(2)}x`, 'error');
        }
        
        this.endGame(won);
    }

    endGame(won, cashedOut = false) {
        this.gameActive = false;
        
        if (!cashedOut) {
            if (won) {
                // ชนะ - ได้เงินตาม Target Multiplier
                const winnings = Math.floor(this.currentBet * this.targetMultiplier);
                this.showResultModal(true, winnings);
            } else {
                // แพ้ - ไม่ได้เงิน
                this.showResultModal(false, 0);
            }
        } else {
            // Game ended
            if (won) {
                const winnings = Math.floor(this.currentBet * this.targetMultiplier);
                this.showResultModal(true, winnings);
            } else {
                this.showResultModal(false, 0);
            }
        }
        
        this.updateDisplay();
        
        // Start new round after delay
        setTimeout(() => {
            this.startNewRound();
        }, 3000);
    }

    startNewRound() {
        this.gameActive = false;
        this.currentMultiplier = 1.00;
        this.crashPoint = 0;
        
        this.updateDisplay();
        this.gameStatusElement.textContent = 'Waiting for next round...';
    }

    // Auto Bet System
    startAutoBet() {
        if (this.autoBetActive) {
            this.showMessage('Auto bet กำลังทำงานอยู่แล้ว', 'error');
            return;
        }
        
        if (this.autoBetSettings.amount > this.balance) {
            this.showMessage('ยอดเงินไม่เพียงพอสำหรับ auto bet', 'error');
            return;
        }
        
        if (this.autoBetSettings.amount < 1) {
            this.showMessage('จำนวนเงินเดิมพันต้องมากกว่า 0', 'error');
            return;
        }
        
        this.autoBetActive = true;
        this.autoBetStats = {
            betsPlaced: 0,
            betsRemaining: this.autoBetSettings.numberOfBets,
            totalProfit: 0,
            wins: 0,
            losses: 0
        };
        
        this.updateAutoBetStatus();
        this.startAutoBetRound();
        
        this.showMessage('Auto bet เริ่มทำงานแล้ว', 'success');
    }

    stopAutoBet() {
        this.autoBetActive = false;
        this.updateAutoBetStatus();
        this.showMessage('Auto bet หยุดทำงานแล้ว', 'info');
    }

    startAutoBetRound() {
        if (!this.autoBetActive) return;
        
        if (this.autoBetStats.betsRemaining <= 0) {
            this.stopAutoBet();
            this.showMessage('Auto bet เสร็จสิ้น - ครบจำนวนรอบที่กำหนดแล้ว', 'info');
            return;
        }
        
        // Check stop conditions
        if (this.autoBetSettings.stopOnWin > 0 && this.autoBetStats.totalProfit >= this.autoBetSettings.stopOnWin) {
            this.stopAutoBet();
            this.showMessage(`Auto bet หยุด - ชนะครบ ${this.autoBetSettings.stopOnWin} บาทแล้ว`, 'success');
            return;
        }
        
        if (this.autoBetSettings.stopOnLoss > 0 && this.autoBetStats.totalProfit <= -this.autoBetSettings.stopOnLoss) {
            this.stopAutoBet();
            this.showMessage(`Auto bet หยุด - แพ้ครบ ${this.autoBetSettings.stopOnLoss} บาทแล้ว`, 'error');
            return;
        }
        
        // Place auto bet
        this.currentBet = this.autoBetSettings.amount;
        this.targetMultiplier = this.autoBetSettings.targetMultiplier;
        
        if (this.currentBet > this.balance) {
            this.stopAutoBet();
            this.showMessage('Auto bet หยุด - ยอดเงินไม่เพียงพอ', 'error');
            return;
        }
        
        this.placeBet();
    }

    handleAutoBetResult(won, winnings) {
        if (!this.autoBetActive) return;
        
        this.autoBetStats.betsPlaced++;
        this.autoBetStats.betsRemaining--;
        this.autoBetStats.totalProfit += winnings;
        
        if (won) {
            this.autoBetStats.wins++;
            // Handle on win action
            if (this.autoBetSettings.onWinAction === 'increase') {
                this.autoBetSettings.amount = Math.floor(this.autoBetSettings.amount * (1 + this.autoBetSettings.onWinPercent / 100));
            }
        } else {
            this.autoBetStats.losses++;
            // Handle on loss action
            if (this.autoBetSettings.onLossAction === 'increase') {
                this.autoBetSettings.amount = Math.floor(this.autoBetSettings.amount * (1 + this.autoBetSettings.onLossPercent / 100));
            }
        }
        
        this.updateAutoBetStatus();
        
        // Start next round after delay
        setTimeout(() => {
            this.startAutoBetRound();
        }, 2000);
    }

    updateAutoBetStatus() {
        this.betsPlacedElement.textContent = this.autoBetStats.betsPlaced;
        this.betsRemainingElement.textContent = this.autoBetStats.betsRemaining === Infinity ? '∞' : this.autoBetStats.betsRemaining;
        this.totalProfitElement.textContent = this.autoBetStats.totalProfit.toFixed(2);
        
        // Update button states
        this.startAutoBetBtn.disabled = this.autoBetActive;
        this.stopAutoBetBtn.disabled = !this.autoBetActive;
    }


    showResultModal(won, winnings) {
        this.modalTitle.textContent = won ? 'ชนะ!' : 'แพ้!';
        this.resultIcon.textContent = won ? '🚀' : '💥';
        this.resultMessage.textContent = won ? 'ยินดีด้วย! คุณชนะ!' : 'เสียใจด้วย! คุณแพ้!';
        this.resultAmount.textContent = won ? `+${winnings} บาท` : `-${this.currentBet} บาท`;
        this.resultAmount.className = won ? 'result-amount' : 'result-amount loss';
        this.crashMultiplierElement.textContent = `${this.crashPoint.toFixed(2)}x`;
        this.profitResultElement.textContent = won ? `+${winnings} บาท` : `-${this.currentBet} บาท`;
        
        this.gameResultModal.classList.add('show');
    }

    hideModal() {
        this.gameResultModal.classList.remove('show');
    }

    addToHistory(won, winnings, multiplier) {
        const historyItem = {
            won,
            winnings,
            multiplier,
            timestamp: new Date()
        };
        
        this.gameHistory.unshift(historyItem);
        
        // Keep only last 50 games
        if (this.gameHistory.length > 50) {
            this.gameHistory = this.gameHistory.slice(0, 50);
        }
        
        this.updateHistoryDisplay();
        
        // Handle auto bet result
        if (this.autoBetActive) {
            this.handleAutoBetResult(won, winnings);
        }
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        this.gameHistory.slice(0, 10).forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            
            const resultClass = item.won ? 'history-result' : 'history-result loss';
            const resultText = item.won ? `+${item.winnings}` : `-${this.currentBet}`;
            
            historyElement.innerHTML = `
                <span>${item.multiplier.toFixed(2)}x</span>
                <span class="${resultClass}">${resultText}</span>
            `;
            
            this.historyList.appendChild(historyElement);
        });
    }



    updateDisplay() {
        this.balanceElement.textContent = this.balance.toFixed(2);
        this.currentMultiplierElement.textContent = `${this.currentMultiplier.toFixed(2)}x`;
        
        // Update multiplier display color
        const multiplierElement = this.currentMultiplierElement;
        multiplierElement.className = 'multiplier-value';
        
        if (this.gameActive) {
            multiplierElement.classList.add('winning');
        } else if (this.crashPoint > 0) {
            multiplierElement.classList.add('crashed');
        }
        
        // Update button states
        this.placeBetBtn.disabled = this.gameActive;
        
        // Update game status
        if (this.gameActive) {
            this.gameStatusElement.textContent = 'Game in progress...';
        } else if (this.crashPoint > 0) {
            this.gameStatusElement.textContent = `Crashed at ${this.crashPoint.toFixed(2)}x`;
        } else {
            this.gameStatusElement.textContent = 'Waiting for next round...';
        }
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
            background: ${type === 'success' ? '#00ff00' : type === 'error' ? '#ff0066' : '#00ffff'};
            color: ${type === 'success' ? '#000' : '#fff'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            border: 1px solid ${type === 'success' ? '#00cc00' : type === 'error' ? '#cc0044' : '#00cccc'};
            font-weight: bold;
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

    // Sound effects (optional)
    playSound(type) {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'cashout') {
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            } else if (type === 'crash') {
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }

    // Particle effects
    createParticles(x, y, type) {
        const particleCount = 15;
        const colors = type === 'cashout' ? ['#00ff00', '#00cc00', '#00ff88'] : ['#ff0066', '#ff4400', '#ff8800'];
        
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
                animation: particleFloat 1.5s ease-out forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 80 + Math.random() * 80;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 1500);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const crashGame = new CrashGame();
});
