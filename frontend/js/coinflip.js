// CoinFlip Game JavaScript
class CoinFlipGame {
    constructor() {
        this.balance = 1000;
        this.betAmount = 10;
        this.selectedSide = null;
        this.isFlipping = false;
        this.gameHistory = [];
        this.autoBetSettings = {
            isActive: false,
            amount: 10,
            side: null,
            numberOfBets: Infinity,
            stopOnWin: 0,
            stopOnLoss: 0,
            currentBets: 0,
            wins: 0,
            losses: 0
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        // Balance and betting elements
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.autoBetAmountInput = document.getElementById('autoBetAmount');
        
        // Side selection elements
        this.headBtn = document.getElementById('headBtn');
        this.tailBtn = document.getElementById('tailBtn');
        this.autoHeadBtn = document.getElementById('autoHeadBtn');
        this.autoTailBtn = document.getElementById('autoTailBtn');
        
        // Action buttons
        this.flipBtn = document.getElementById('flipCoin');
        this.startAutoBetBtn = document.getElementById('startAutoBet');
        this.newGameBtn = document.getElementById('newGame');
        this.clearGameBtn = document.getElementById('clearGame');
        
        // Game display elements
        this.coinElement = document.getElementById('coin');
        this.selectedSideElement = document.getElementById('selectedSide');
        this.resultSideElement = document.getElementById('resultSide');
        this.currentMultiplierElement = document.getElementById('currentMultiplier');
        
        // History elements
        this.historyList = document.getElementById('historyList');
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.selectedResult = document.getElementById('selectedResult');
        this.resultResult = document.getElementById('resultResult');
        this.multiplierResult = document.getElementById('multiplierResult');
        this.closeModal = document.getElementById('closeModal');
        this.continueBtn = document.getElementById('continueBtn');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        
        // Amount control buttons
        this.betHalfBtn = document.getElementById('betHalf');
        this.betDoubleBtn = document.getElementById('betDouble');
        this.betUpBtn = document.getElementById('betUp');
        this.betDownBtn = document.getElementById('betDown');
        this.autoBetHalfBtn = document.getElementById('autoBetHalf');
        this.autoBetDoubleBtn = document.getElementById('autoBetDouble');
        this.autoBetUpBtn = document.getElementById('autoBetUp');
        this.autoBetDownBtn = document.getElementById('autoBetDown');
        
        // Preset amount buttons
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        // Auto bet settings
        this.numberOfBetsInput = document.getElementById('numberOfBets');
        this.stopOnWinInput = document.getElementById('stopOnWin');
        this.stopOnLossInput = document.getElementById('stopOnLoss');
    }

    attachEventListeners() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Side selection
        this.headBtn.addEventListener('click', () => this.selectSide('head'));
        this.tailBtn.addEventListener('click', () => this.selectSide('tail'));
        this.autoHeadBtn.addEventListener('click', () => this.selectAutoSide('head'));
        this.autoTailBtn.addEventListener('click', () => this.selectAutoSide('tail'));

        // Flip coin
        this.flipBtn.addEventListener('click', () => this.flipCoin());

        // Auto bet
        this.startAutoBetBtn.addEventListener('click', () => this.toggleAutoBet());

        // Game controls
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.clearGameBtn.addEventListener('click', () => this.clearGame());

        // Amount controls
        this.betHalfBtn.addEventListener('click', () => this.adjustBetAmount('half'));
        this.betDoubleBtn.addEventListener('click', () => this.adjustBetAmount('double'));
        this.betUpBtn.addEventListener('click', () => this.adjustBetAmount('up'));
        this.betDownBtn.addEventListener('click', () => this.adjustBetAmount('down'));
        
        this.autoBetHalfBtn.addEventListener('click', () => this.adjustAutoBetAmount('half'));
        this.autoBetDoubleBtn.addEventListener('click', () => this.adjustAutoBetAmount('double'));
        this.autoBetUpBtn.addEventListener('click', () => this.adjustAutoBetAmount('up'));
        this.autoBetDownBtn.addEventListener('click', () => this.adjustAutoBetAmount('down'));

        // Preset amounts
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseFloat(e.target.dataset.amount);
                if (amount) {
                    this.setBetAmount(amount);
                } else if (e.target.dataset.bets) {
                    this.setNumberOfBets(e.target.dataset.bets);
                }
            });
        });

        // Input changes
        this.betAmountInput.addEventListener('input', (e) => this.setBetAmount(parseFloat(e.target.value) || 0));
        this.autoBetAmountInput.addEventListener('input', (e) => this.setAutoBetAmount(parseFloat(e.target.value) || 0));
        this.numberOfBetsInput.addEventListener('input', (e) => this.setNumberOfBets(e.target.value));
        this.stopOnWinInput.addEventListener('input', (e) => this.setStopOnWin(parseInt(e.target.value) || 0));
        this.stopOnLossInput.addEventListener('input', (e) => this.setStopOnLoss(parseInt(e.target.value) || 0));

        // Modal controls
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.continueBtn.addEventListener('click', () => this.hideModal());

        // Click outside modal to close
        this.gameResultModal.addEventListener('click', (e) => {
            if (e.target === this.gameResultModal) {
                this.hideModal();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panels
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === tabName);
        });
    }

    selectSide(side) {
        this.selectedSide = side;
        this.updateSideButtons();
        this.updateDisplay();
    }

    selectAutoSide(side) {
        this.autoBetSettings.side = side;
        this.updateAutoSideButtons();
    }

    updateSideButtons() {
        this.headBtn.classList.toggle('selected', this.selectedSide === 'head');
        this.tailBtn.classList.toggle('selected', this.selectedSide === 'tail');
    }

    updateAutoSideButtons() {
        this.autoHeadBtn.classList.toggle('selected', this.autoBetSettings.side === 'head');
        this.autoTailBtn.classList.toggle('selected', this.autoBetSettings.side === 'tail');
    }

    flipCoin() {
        if (this.isFlipping || !this.selectedSide || this.balance < this.betAmount) {
            return;
        }

        this.isFlipping = true;
        this.flipBtn.disabled = true;
        this.flipBtn.textContent = 'Flipping...';

        // Deduct bet amount
        this.balance -= this.betAmount;

        // Start coin flip animation
        this.coinElement.classList.add('flipping');
        
        // Generate random result
        const result = Math.random() < 0.5 ? 'head' : 'tail';
        
        // Show result after animation
        setTimeout(() => {
            this.coinElement.classList.remove('flipping');
            this.coinElement.classList.add(`show-${result}`);
            
            // Check if player won
            const isWin = this.selectedSide === result;
            const multiplier = 2.0;
            const winAmount = isWin ? this.betAmount * multiplier : 0;
            
            if (isWin) {
                this.balance += winAmount;
            }

            // Update display
            this.updateDisplay();
            this.updateGameProgress(result);
            
            // Add to history
            this.addToHistory(this.selectedSide, result, isWin, winAmount);
            
            // Show result modal
            this.showResultModal(isWin, winAmount, result);
            
            this.isFlipping = false;
            this.flipBtn.disabled = false;
            this.flipBtn.innerHTML = '<i class="fas fa-coins"></i> Flip Coin';
            
            // Auto bet logic
            if (this.autoBetSettings.isActive) {
                this.handleAutoBet(isWin);
            }
        }, 3000);
    }

    updateGameProgress(result) {
        this.resultSideElement.textContent = result.charAt(0).toUpperCase() + result.slice(1);
    }

    addToHistory(selected, result, isWin, amount) {
        const historyItem = {
            selected,
            result,
            isWin,
            amount,
            timestamp: new Date()
        };
        
        this.gameHistory.unshift(historyItem);
        
        // Keep only last 20 items
        if (this.gameHistory.length > 20) {
            this.gameHistory = this.gameHistory.slice(0, 20);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        this.gameHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const resultText = item.isWin ? 'WIN' : 'LOSS';
            const amountText = item.isWin ? `+${item.amount}` : `-${this.betAmount}`;
            
            historyItem.innerHTML = `
                <span>${item.selected.toUpperCase()} vs ${item.result.toUpperCase()}</span>
                <span class="history-result ${item.isWin ? '' : 'loss'}">${resultText} ${amountText}</span>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }

    showResultModal(isWin, amount, result) {
        this.modalTitle.textContent = isWin ? 'คุณชนะ!' : 'คุณแพ้!';
        this.resultIcon.textContent = isWin ? '🎉' : '😢';
        this.resultMessage.textContent = isWin ? 'ยินดีด้วย!' : 'เสียใจด้วย!';
        this.resultAmount.textContent = isWin ? `+${amount} บาท` : `-${this.betAmount} บาท`;
        this.resultAmount.className = `result-amount ${isWin ? '' : 'loss'}`;
        
        this.selectedResult.textContent = this.selectedSide.charAt(0).toUpperCase() + this.selectedSide.slice(1);
        this.resultResult.textContent = result.charAt(0).toUpperCase() + result.slice(1);
        this.multiplierResult.textContent = '2.00x';
        
        this.gameResultModal.classList.add('show');
    }

    hideModal() {
        this.gameResultModal.classList.remove('show');
    }

    toggleAutoBet() {
        if (!this.autoBetSettings.side) {
            alert('กรุณาเลือกด้านก่อนเริ่ม Auto Bet');
            return;
        }

        this.autoBetSettings.isActive = !this.autoBetSettings.isActive;
        
        if (this.autoBetSettings.isActive) {
            this.startAutoBetBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Auto Bet';
            this.startAutoBetBtn.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
            this.startAutoBet();
        } else {
            this.startAutoBetBtn.innerHTML = '<i class="fas fa-play"></i> Start Auto Bet';
            this.startAutoBetBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
        }
    }

    startAutoBet() {
        if (!this.autoBetSettings.isActive) return;

        // Set auto bet values
        this.betAmount = this.autoBetSettings.amount;
        this.selectedSide = this.autoBetSettings.side;
        this.updateDisplay();
        this.updateSideButtons();

        // Check stop conditions
        if (this.autoBetSettings.stopOnWin > 0 && this.autoBetSettings.wins >= this.autoBetSettings.stopOnWin) {
            this.stopAutoBet('Stop on win condition reached');
            return;
        }

        if (this.autoBetSettings.stopOnLoss > 0 && this.autoBetSettings.losses >= this.autoBetSettings.stopOnLoss) {
            this.stopAutoBet('Stop on loss condition reached');
            return;
        }

        if (this.autoBetSettings.numberOfBets !== Infinity && this.autoBetSettings.currentBets >= this.autoBetSettings.numberOfBets) {
            this.stopAutoBet('Number of bets completed');
            return;
        }

        // Start the bet
        this.autoBetSettings.currentBets++;
        this.flipCoin();
    }

    handleAutoBet(isWin) {
        if (isWin) {
            this.autoBetSettings.wins++;
        } else {
            this.autoBetSettings.losses++;
        }

        // Continue auto bet after a short delay
        setTimeout(() => {
            if (this.autoBetSettings.isActive) {
                this.startAutoBet();
            }
        }, 1000);
    }

    stopAutoBet(reason) {
        this.autoBetSettings.isActive = false;
        this.startAutoBetBtn.innerHTML = '<i class="fas fa-play"></i> Start Auto Bet';
        this.startAutoBetBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
        
        if (reason) {
            alert(reason);
        }
    }

    adjustBetAmount(action) {
        let newAmount = this.betAmount;
        
        switch (action) {
            case 'half':
                newAmount = Math.floor(this.betAmount / 2);
                break;
            case 'double':
                newAmount = this.betAmount * 2;
                break;
            case 'up':
                newAmount = this.betAmount + 1;
                break;
            case 'down':
                newAmount = Math.max(1, this.betAmount - 1);
                break;
        }
        
        this.setBetAmount(newAmount);
    }

    adjustAutoBetAmount(action) {
        let newAmount = this.autoBetSettings.amount;
        
        switch (action) {
            case 'half':
                newAmount = Math.floor(this.autoBetSettings.amount / 2);
                break;
            case 'double':
                newAmount = this.autoBetSettings.amount * 2;
                break;
            case 'up':
                newAmount = this.autoBetSettings.amount + 1;
                break;
            case 'down':
                newAmount = Math.max(1, this.autoBetSettings.amount - 1);
                break;
        }
        
        this.setAutoBetAmount(newAmount);
    }

    setBetAmount(amount) {
        this.betAmount = Math.max(1, Math.min(amount, this.balance));
        this.betAmountInput.value = this.betAmount;
        this.updateDisplay();
    }

    setAutoBetAmount(amount) {
        this.autoBetSettings.amount = Math.max(1, Math.min(amount, this.balance));
        this.autoBetAmountInput.value = this.autoBetSettings.amount;
    }

    setNumberOfBets(value) {
        this.autoBetSettings.numberOfBets = value === '∞' ? Infinity : parseInt(value) || Infinity;
        this.numberOfBetsInput.value = value;
    }

    setStopOnWin(value) {
        this.autoBetSettings.stopOnWin = value;
    }

    setStopOnLoss(value) {
        this.autoBetSettings.stopOnLoss = value;
    }

    newGame() {
        this.selectedSide = null;
        this.coinElement.classList.remove('show-head', 'show-tail');
        this.updateDisplay();
        this.updateSideButtons();
    }

    clearGame() {
        this.newGame();
        this.gameHistory = [];
        this.updateHistoryDisplay();
    }

    updateDisplay() {
        this.balanceElement.textContent = this.balance;
        this.selectedSideElement.textContent = this.selectedSide ? this.selectedSide.charAt(0).toUpperCase() + this.selectedSide.slice(1) : '-';
        this.currentMultiplierElement.textContent = '2.00x';
        
        // Update bet amount inputs
        this.betAmountInput.value = this.betAmount;
        this.autoBetAmountInput.value = this.autoBetSettings.amount;
        
        // Update button states
        this.flipBtn.disabled = !this.selectedSide || this.balance < this.betAmount || this.isFlipping;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CoinFlipGame();
});
