// Slot Machine Game JavaScript
class SlotMachineGame {
    constructor() {
        this.balance = 1000;
        this.betAmount = 10;
        this.isSpinning = false;
        this.gameHistory = [];
        this.totalWin = 0;
        this.autoBetSettings = {
            isActive: false,
            amount: 10,
            numberOfBets: Infinity,
            stopOnWin: 0,
            stopOnLoss: 0,
            currentBets: 0,
            wins: 0,
            losses: 0
        };
        
        // Slot symbols configuration
        this.symbols = [
            { name: 'Gem1', image: 'Gem1.png', value: 1, weight: 30 },
            { name: 'Gem2', image: 'Gem2.png', value: 2, weight: 25 },
            { name: 'Gem3', image: 'Gem3.png', value: 3, weight: 20 },
            { name: 'Gem4', image: 'Gem4.png', value: 4, weight: 15 },
            { name: 'Gem5', image: 'Gem5.png', value: 5, weight: 10 },
            { name: 'Gem6', image: 'Gem6.png', value: 6, weight: 8 },
            { name: 'Gem7', image: 'Gem7.png', value: 7, weight: 6 },
            { name: 'Gem8', image: 'Gem8.png', value: 8, weight: 4 },
            { name: 'Gem9', image: 'Gem9.png', value: 9, weight: 2 },
            { name: 'Gem10', image: 'Gem10.png', value: 10, weight: 1 }
        ];
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeReels();
        this.updateDisplay();
    }

    initializeElements() {
        // Balance and betting elements
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.autoBetAmountInput = document.getElementById('autoBetAmount');
        
        // Action buttons
        this.spinBtn = document.getElementById('spinReels');
        this.startAutoBetBtn = document.getElementById('startAutoBet');
        this.newGameBtn = document.getElementById('newGame');
        this.clearGameBtn = document.getElementById('clearGame');
        
        // Game display elements
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3'),
            document.getElementById('reel4'),
            document.getElementById('reel5')
        ];
        this.lastWinElement = document.getElementById('lastWin');
        this.totalWinElement = document.getElementById('totalWin');
        this.currentMultiplierElement = document.getElementById('currentMultiplier');
        
        // History elements
        this.historyList = document.getElementById('historyList');
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.symbolResult = document.getElementById('symbolResult');
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

        // Spin reels
        this.spinBtn.addEventListener('click', () => this.spinReels());

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

    initializeReels() {
        this.reels.forEach((reel, index) => {
            const strip = reel.querySelector('.reel-strip');
            strip.innerHTML = '';
            
            // Create 5 visible symbols + 3 extra for smooth scrolling
            for (let i = 0; i < 8; i++) {
                const symbol = this.getRandomSymbol();
                const symbolElement = this.createSymbolElement(symbol);
                strip.appendChild(symbolElement);
            }
        });
    }

    createSymbolElement(symbol) {
        const symbolDiv = document.createElement('div');
        symbolDiv.className = 'reel-symbol';
        symbolDiv.dataset.symbol = symbol.name;
        symbolDiv.dataset.value = symbol.value;
        
        const img = document.createElement('img');
        img.src = `../../images/game images/slot game images/${symbol.image}`;
        img.alt = symbol.name;
        
        symbolDiv.appendChild(img);
        return symbolDiv;
    }

    getRandomSymbol() {
        const totalWeight = this.symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const symbol of this.symbols) {
            random -= symbol.weight;
            if (random <= 0) {
                return symbol;
            }
        }
        
        return this.symbols[0]; // Fallback
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

    spinReels() {
        if (this.isSpinning || this.balance < this.betAmount) {
            return;
        }

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Spinning...';

        // Deduct bet amount
        this.balance -= this.betAmount;

        // Start spinning animation with staggered start
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.add('spinning');
            }, index * 100); // Staggered start for smoother effect
        });

        // Generate results
        const results = this.generateResults();
        
        // Stop reels with more realistic timing
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                this.stopReel(reel, results[index], index);
            }, 1500 + (index * 300)); // More realistic stopping timing
        });

        // Check results after all reels stop
        setTimeout(() => {
            this.checkResults(results);
        }, 4000);
    }

    generateResults() {
        return this.reels.map(() => this.getRandomSymbol());
    }

    stopReel(reel, result, index) {
        reel.classList.remove('spinning');
        reel.classList.add('stopping');
        
        const strip = reel.querySelector('.reel-strip');
        const symbols = strip.querySelectorAll('.reel-symbol');
        
        // Update the middle symbol (index 3) with the result
        const middleSymbol = symbols[3];
        middleSymbol.innerHTML = '';
        const img = document.createElement('img');
        img.src = `../../images/game images/slot game images/${result.image}`;
        img.alt = result.name;
        middleSymbol.appendChild(img);
        middleSymbol.dataset.symbol = result.name;
        middleSymbol.dataset.value = result.value;
        
        // Set stop position for smooth stopping
        strip.style.setProperty('--stop-position', '-300px');
        
        // Add smooth deceleration effect
        strip.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            reel.classList.remove('stopping');
            strip.style.transition = 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 800);
    }

    checkResults(results) {
        const winResult = this.checkWin(results);
        const isWin = winResult !== null;
        const winAmount = isWin ? this.calculateWinAmount(results) : 0;
        const multiplier = winAmount / this.betAmount;
        
        if (isWin) {
            this.balance += winAmount;
            this.totalWin += winAmount;
            this.autoBetSettings.wins++;
            this.showWinningSymbols(winResult.type);
        } else {
            this.autoBetSettings.losses++;
        }

        // Update display
        this.updateDisplay();
        this.updateGameProgress(results, isWin, winAmount);
        
        // Add to history
        this.addToHistory(results, isWin, winAmount);
        
        // Show result modal
        this.showResultModal(isWin, winAmount, results, multiplier, winResult);
        
        this.isSpinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.innerHTML = '<i class="fas fa-play"></i> Spin';
        
        // Auto bet logic
        if (this.autoBetSettings.isActive) {
            this.handleAutoBet(isWin);
        }
    }

    checkWin(results) {
        const symbols = results.map(r => r.name);
        
        // Check for 5 of a kind (highest win)
        if (symbols.every(symbol => symbol === symbols[0])) {
            return { type: 'five_of_a_kind', multiplier: 5 };
        }
        
        // Check for 4 of a kind
        const symbolCounts = {};
        symbols.forEach(symbol => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(symbolCounts));
        if (maxCount >= 4) {
            return { type: 'four_of_a_kind', multiplier: 3 };
        }
        
        // Check for 3 of a kind
        if (maxCount >= 3) {
            return { type: 'three_of_a_kind', multiplier: 2 };
        }
        
        // Check for 2 of a kind (minimum win)
        if (maxCount >= 2) {
            return { type: 'two_of_a_kind', multiplier: 1.5 };
        }
        
        return null;
    }

    calculateWinAmount(results) {
        const winResult = this.checkWin(results);
        if (!winResult) return 0;
        
        const symbol = results[0];
        const baseMultiplier = symbol.value;
        const winMultiplier = winResult.multiplier;
        
        return this.betAmount * baseMultiplier * winMultiplier;
    }

    showWinningSymbols(winType) {
        this.reels.forEach(reel => {
            const middleSymbol = reel.querySelector('.reel-symbol:nth-child(4)');
            middleSymbol.classList.add('winning');
            
            // Add pulsing effect for winning symbols
            middleSymbol.style.animation = 'symbolWin 0.6s ease-in-out infinite';
            
            setTimeout(() => {
                middleSymbol.classList.remove('winning');
                middleSymbol.style.animation = '';
            }, 3000);
        });
        
        // Show appropriate payline based on win type
        const paylines = document.querySelectorAll('.payline');
        paylines.forEach(payline => payline.classList.remove('active'));
        
        // Show middle payline for most wins
        const middlePayline = document.querySelector('.payline-2');
        middlePayline.classList.add('active');
        
        // Show additional paylines for higher wins
        if (winType === 'five_of_a_kind') {
            document.querySelector('.payline-1').classList.add('active');
            document.querySelector('.payline-3').classList.add('active');
        }
        
        setTimeout(() => {
            paylines.forEach(payline => payline.classList.remove('active'));
        }, 3000);
    }

    updateGameProgress(results, isWin, winAmount) {
        if (isWin) {
            this.lastWinElement.textContent = `+${winAmount} บาท`;
            this.lastWinElement.style.color = '#4caf50';
        } else {
            this.lastWinElement.textContent = '0 บาท';
            this.lastWinElement.style.color = '#f44336';
        }
        
        this.totalWinElement.textContent = this.totalWin;
    }

    addToHistory(results, isWin, amount) {
        const historyItem = {
            results: results.map(r => r.name),
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
            const symbolsText = item.results.join(', ');
            
            historyItem.innerHTML = `
                <span>${symbolsText}</span>
                <span class="history-result ${item.isWin ? '' : 'loss'}">${resultText} ${amountText}</span>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }

    showResultModal(isWin, amount, results, multiplier, winResult) {
        this.modalTitle.textContent = isWin ? 'คุณชนะ!' : 'คุณแพ้!';
        this.resultIcon.textContent = isWin ? '🎉' : '😢';
        
        if (isWin) {
            const winTypeNames = {
                'five_of_a_kind': '5 ตัวเหมือนกัน!',
                'four_of_a_kind': '4 ตัวเหมือนกัน!',
                'three_of_a_kind': '3 ตัวเหมือนกัน!',
                'two_of_a_kind': '2 ตัวเหมือนกัน!'
            };
            this.resultMessage.textContent = winTypeNames[winResult.type] || 'ยินดีด้วย!';
        } else {
            this.resultMessage.textContent = 'เสียใจด้วย!';
        }
        
        this.resultAmount.textContent = isWin ? `+${amount} บาท` : `-${this.betAmount} บาท`;
        this.resultAmount.className = `result-amount ${isWin ? '' : 'loss'}`;
        
        this.symbolResult.textContent = results.map(r => r.name).join(', ');
        this.multiplierResult.textContent = `${multiplier.toFixed(2)}x`;
        
        this.gameResultModal.classList.add('show');
    }

    hideModal() {
        this.gameResultModal.classList.remove('show');
    }

    toggleAutoBet() {
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
        this.updateDisplay();

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
        this.spinReels();
    }

    handleAutoBet(isWin) {
        // Continue auto bet after a short delay
        setTimeout(() => {
            if (this.autoBetSettings.isActive) {
                this.startAutoBet();
            }
        }, 2000);
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
        this.initializeReels();
        this.updateDisplay();
    }

    clearGame() {
        this.newGame();
        this.gameHistory = [];
        this.totalWin = 0;
        this.updateHistoryDisplay();
        this.updateDisplay();
    }

    updateDisplay() {
        this.balanceElement.textContent = this.balance;
        this.totalWinElement.textContent = this.totalWin;
        
        // Update bet amount inputs
        this.betAmountInput.value = this.betAmount;
        this.autoBetAmountInput.value = this.autoBetSettings.amount;
        
        // Update button states
        this.spinBtn.disabled = this.balance < this.betAmount || this.isSpinning;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SlotMachineGame();
});
