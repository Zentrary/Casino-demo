// Game JavaScript for individual game pages
class SlotGame {
    constructor() {
        this.balance = 1000;
        this.betAmount = 10;
        this.isSpinning = false;
        this.autoSpin = false;
        this.history = [];
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.betUpBtn = document.getElementById('betUp');
        this.betDownBtn = document.getElementById('betDown');
        this.spinBtn = document.getElementById('spinBtn');
        this.autoSpinCheckbox = document.getElementById('autoSpin');
        this.winDisplay = document.getElementById('winDisplay');
        this.historyList = document.getElementById('historyList');
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.closeModal = document.getElementById('closeModal');
        this.continueBtn = document.getElementById('continueBtn');
        
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        
        // Preset buttons
        this.presetButtons = document.querySelectorAll('.preset-btn');
    }
    
    bindEvents() {
        // Spin button
        this.spinBtn.addEventListener('click', () => this.spin());
        
        // Bet controls
        this.betUpBtn.addEventListener('click', () => this.increaseBet());
        this.betDownBtn.addEventListener('click', () => this.decreaseBet());
        this.betAmountInput.addEventListener('change', () => this.updateBet());
        
        // Preset buttons
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setBetAmount(parseInt(e.target.dataset.bet));
                this.updatePresetButtons(e.target);
            });
        });
        
        // Auto spin
        this.autoSpinCheckbox.addEventListener('change', (e) => {
            this.autoSpin = e.target.checked;
            if (this.autoSpin && !this.isSpinning) {
                this.startAutoSpin();
            }
        });
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.continueBtn.addEventListener('click', () => this.hideModal());
        this.gameResultModal.addEventListener('click', (e) => {
            if (e.target === this.gameResultModal) {
                this.hideModal();
            }
        });
        
        // Tab events
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpinning) {
                e.preventDefault();
                this.spin();
            }
        });
    }
    
    updateBet() {
        this.betAmount = Math.max(1, Math.min(100, parseInt(this.betAmountInput.value) || 1));
        this.betAmountInput.value = this.betAmount;
        this.updatePresetButtons();
    }
    
    increaseBet() {
        if (this.betAmount < 100) {
            this.betAmount = Math.min(100, this.betAmount + 5);
            this.betAmountInput.value = this.betAmount;
            this.updatePresetButtons();
        }
    }
    
    decreaseBet() {
        if (this.betAmount > 1) {
            this.betAmount = Math.max(1, this.betAmount - 5);
            this.betAmountInput.value = this.betAmount;
            this.updatePresetButtons();
        }
    }
    
    setBetAmount(amount) {
        this.betAmount = Math.max(1, Math.min(100, amount));
        this.betAmountInput.value = this.betAmount;
    }
    
    updatePresetButtons(activeBtn = null) {
        this.presetButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.bet) === this.betAmount) {
                btn.classList.add('active');
            }
        });
    }
    
    spin() {
        if (this.isSpinning || this.balance < this.betAmount) {
            if (this.balance < this.betAmount) {
                this.showNotification('ยอดเงินไม่เพียงพอ!', 'error');
            }
            return;
        }
        
        this.isSpinning = true;
        this.balance -= this.betAmount;
        this.updateDisplay();
        
        this.spinBtn.disabled = true;
        this.spinBtn.classList.add('spinning');
        this.spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>กำลังหมุน...</span>';
        
        // Spin each reel
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                this.spinReel(reel, index);
            }, index * 200);
        });
        
        // Check results after spinning
        setTimeout(() => {
            this.checkResults();
            this.isSpinning = false;
            this.spinBtn.disabled = false;
            this.spinBtn.classList.remove('spinning');
            this.spinBtn.innerHTML = '<i class="fas fa-play"></i><span>หมุน</span>';
            
            if (this.autoSpin && this.balance >= this.betAmount) {
                setTimeout(() => this.spin(), 1000);
            } else if (this.autoSpin) {
                this.autoSpin = false;
                this.autoSpinCheckbox.checked = false;
                this.showNotification('ยอดเงินไม่เพียงพอสำหรับการหมุนอัตโนมัติ', 'error');
            }
        }, 3000);
    }
    
    spinReel(reel, index) {
        reel.classList.add('spinning');
        
        // Generate random symbols
        const symbols = ['🍇', '🍒', '💎', '🔔', '⭐'];
        const randomSymbols = [];
        for (let i = 0; i < 5; i++) {
            randomSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        
        // Update reel content
        const symbolElements = reel.querySelectorAll('.symbol');
        symbolElements.forEach((element, i) => {
            element.textContent = randomSymbols[i];
        });
        
        setTimeout(() => {
            reel.classList.remove('spinning');
        }, 2000);
    }
    
    checkResults() {
        const results = this.reels.map(reel => {
            const symbolElement = reel.querySelector('.symbol');
            return symbolElement.textContent;
        });
        
        let winAmount = 0;
        let winType = '';
        let multiplier = 0;
        
        // Check for three of a kind
        if (results[0] === results[1] && results[1] === results[2]) {
            multiplier = this.getSymbolMultiplier(results[0]);
            winAmount = this.betAmount * multiplier;
            winType = 'three_of_a_kind';
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            multiplier = 2;
            winAmount = this.betAmount * multiplier;
            winType = 'pair';
        }
        
        this.balance += winAmount;
        this.updateDisplay();
        
        // Add to history
        this.addToHistory(winAmount, results, winType);
        
        // Show result
        if (winAmount > 0) {
            this.showWinResult(winAmount, results, multiplier);
        } else {
            this.showLoseResult(results);
        }
        
        // Update win display
        this.updateWinDisplay(winAmount);
    }
    
    getSymbolMultiplier(symbol) {
        const multipliers = {
            '💎': 10,
            '🔔': 8,
            '⭐': 6,
            '🍒': 4,
            '🍇': 3
        };
        return multipliers[symbol] || 3;
    }
    
    showWinResult(winAmount, results, multiplier) {
        this.modalTitle.textContent = '🎉 ชนะ!';
        this.resultIcon.textContent = '🎉';
        this.resultMessage.textContent = `คุณชนะ! ได้รับ ${winAmount} บาท`;
        this.resultAmount.textContent = `+${winAmount} บาท`;
        this.resultAmount.style.color = '#00d4aa';
        
        this.showModal();
        
        // Highlight winning reels
        this.reels.forEach(reel => {
            reel.classList.add('winning');
        });
        
        setTimeout(() => {
            this.reels.forEach(reel => {
                reel.classList.remove('winning');
            });
        }, 2000);
    }
    
    showLoseResult(results) {
        this.modalTitle.textContent = '😔 เสียใจ';
        this.resultIcon.textContent = '😔';
        this.resultMessage.textContent = 'คุณไม่ชนะในรอบนี้';
        this.resultAmount.textContent = 'เสีย ' + this.betAmount + ' บาท';
        this.resultAmount.style.color = '#f44336';
        
        this.showModal();
    }
    
    showModal() {
        this.gameResultModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    hideModal() {
        this.gameResultModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    addToHistory(winAmount, results, winType) {
        const historyItem = {
            timestamp: new Date(),
            results: results,
            winAmount: winAmount,
            betAmount: this.betAmount,
            winType: winType
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 20 items
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p>ยังไม่มีประวัติการเล่น</p>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map(item => {
            const timeStr = item.timestamp.toLocaleTimeString('th-TH');
            const isWin = item.winAmount > 0;
            const resultStr = item.results.join(' ');
            
            return `
                <div class="history-item ${isWin ? 'win' : 'lose'}">
                    <div>
                        <div class="history-time">${timeStr}</div>
                        <div class="history-results">${resultStr}</div>
                    </div>
                    <div class="history-amount ${isWin ? 'win' : 'lose'}">
                        ${isWin ? '+' : '-'}${isWin ? item.winAmount : item.betAmount} บาท
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateDisplay() {
        this.balanceElement.textContent = this.balance;
        this.betAmountInput.value = this.betAmount;
    }
    
    updateWinDisplay(winAmount) {
        if (winAmount > 0) {
            this.winDisplay.innerHTML = `<span>ชนะ: ${winAmount} บาท</span>`;
            this.winDisplay.style.display = 'block';
        } else {
            this.winDisplay.style.display = 'none';
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update tab panels
        this.tabPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === tabName) {
                panel.classList.add('active');
            }
        });
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a game page
    if (document.getElementById('spinBtn')) {
        new SlotGame();
        console.log('Slot game loaded successfully! 🎰✨');
    }
});
