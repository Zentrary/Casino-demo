// Dice Sum Game JavaScript
class DiceSumGame {
    constructor() {
        this.balance = 1000;
        this.betAmount = 10;
        this.selectedSum = null;
        this.isRolling = false;
        this.gameHistory = [];
        this.stats = {
            totalBets: 0,
            totalWins: 0,
            totalProfit: 0
        };
        this.autoBetSettings = {
            isActive: false,
            amount: 10,
            sum: 7,
            rounds: 10,
            currentRound: 0,
            wins: 0,
            losses: 0
        };
        
        // Payout multipliers for each sum (based on probability)
        this.payoutMultipliers = {
            2: 30,   // 1/36 chance
            3: 15,   // 2/36 chance
            4: 10,   // 3/36 chance
            5: 7,    // 4/36 chance
            6: 6,    // 5/36 chance
            7: 6,    // 6/36 chance (most common)
            8: 6,    // 5/36 chance
            9: 7,    // 4/36 chance
            10: 10,  // 3/36 chance
            11: 15,  // 2/36 chance
            12: 30   // 1/36 chance
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.startPlayerCountAnimation();
    }

    initializeElements() {
        // Balance and betting elements
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.autoAmountInput = document.getElementById('autoAmount');
        this.autoSumSelect = document.getElementById('autoSum');
        this.autoRoundsInput = document.getElementById('autoRounds');
        
        // Sum selection elements
        this.sumButtons = document.querySelectorAll('.sum-btn');
        
        // Action buttons
        this.betButton = document.getElementById('betButton');
        this.autoButton = document.getElementById('autoButton');
        
        // Game display elements
        this.dice1Element = document.getElementById('dice1');
        this.dice2Element = document.getElementById('dice2');
        this.diceSumElement = document.getElementById('diceSum');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // History elements
        this.recentResultsElement = document.getElementById('recentResults');
        
        // Statistics elements
        this.totalBetsElement = document.getElementById('totalBets');
        this.totalWinsElement = document.getElementById('totalWins');
        this.winRateElement = document.getElementById('winRate');
        this.totalProfitElement = document.getElementById('totalProfit');
        
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        
        // Amount control buttons
        this.betHalfBtn = document.getElementById('betHalf');
        this.betDoubleBtn = document.getElementById('betDouble');
        this.betUpBtn = document.getElementById('betUp');
        this.betDownBtn = document.getElementById('betDown');
        
        // Preset amount buttons
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        // Player count element
        this.playerCountElement = document.getElementById('playerCount');
    }

    attachEventListeners() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Sum selection
        this.sumButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectSum(parseInt(btn.dataset.sum)));
        });

        // Bet button
        this.betButton.addEventListener('click', () => this.rollDice());

        // Auto bet button
        this.autoButton.addEventListener('click', () => this.toggleAutoBet());

        // Amount control buttons
        this.betHalfBtn.addEventListener('click', () => this.adjustBet(0.5));
        this.betDoubleBtn.addEventListener('click', () => this.adjustBet(2));
        this.betUpBtn.addEventListener('click', () => this.adjustBet(1.1));
        this.betDownBtn.addEventListener('click', () => this.adjustBet(0.9));

        // Preset amount buttons
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setBetAmount(parseInt(btn.dataset.amount)));
        });

        // Input change listeners
        this.betAmountInput.addEventListener('input', () => this.updateDisplay());
        this.autoAmountInput.addEventListener('input', () => this.updateDisplay());
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panels
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabPanels.forEach(panel => panel.classList.remove('active'));
        
        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    selectSum(sum) {
        if (this.isRolling) return;
        
        this.selectedSum = sum;
        
        // Update button states
        this.sumButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.sum) === sum) {
                btn.classList.add('selected');
            }
        });
        
        this.updateDisplay();
    }

    setBetAmount(amount) {
        this.betAmount = amount;
        this.betAmountInput.value = amount;
        this.updateDisplay();
    }

    adjustBet(factor) {
        const currentAmount = parseFloat(this.betAmountInput.value) || 0;
        const newAmount = Math.max(1, Math.round(currentAmount * factor));
        this.betAmountInput.value = newAmount;
        this.betAmount = newAmount;
        this.updateDisplay();
    }

    rollDice() {
        if (this.isRolling || !this.selectedSum) return;
        
        this.isRolling = true;
        this.betButton.disabled = true;
        this.betButton.textContent = 'Rolling...';
        
        // Deduct bet amount
        this.balance -= this.betAmount;
        this.stats.totalBets++;
        
        // Start dice rolling animation
        this.startDiceAnimation();
        
        // Roll dice after animation
        setTimeout(() => {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const sum = dice1 + dice2;
            
            this.showDiceResult(dice1, dice2, sum);
            this.checkResult(sum);
        }, 2000);
    }

    startDiceAnimation() {
        // Reset dice to show rolling state
        this.diceSumElement.textContent = '?';
        this.gameStatusElement.innerHTML = '<h3>Rolling dice...</h3>';
        
        // Add rolling animation to dice
        this.dice1Element.classList.add('rolling');
        this.dice2Element.classList.add('rolling');
        
        // Remove rolling animation after 2 seconds
        setTimeout(() => {
            this.dice1Element.classList.remove('rolling');
            this.dice2Element.classList.remove('rolling');
        }, 2000);
    }

    showDiceResult(dice1, dice2, sum) {
        // Update dice images
        this.dice1Element.querySelector('img').src = `../../images/game images/dicesum game image/${dice1}.png`;
        this.dice2Element.querySelector('img').src = `../../images/game images/dicesum game image/${dice2}.png`;
        
        // Update sum display
        this.diceSumElement.textContent = sum;
    }

    checkResult(sum) {
        const isWin = sum === this.selectedSum;
        const multiplier = this.payoutMultipliers[this.selectedSum];
        const payout = isWin ? this.betAmount * multiplier : 0;
        const profit = payout - this.betAmount;
        
        if (isWin) {
            this.balance += payout;
            this.stats.totalWins++;
            this.stats.totalProfit += profit;
            this.gameStatusElement.innerHTML = `<h3 class="win">🎉 You Win! Sum: ${sum}</h3>`;
            this.gameStatusElement.classList.add('win');
        } else {
            this.stats.totalProfit -= this.betAmount;
            this.gameStatusElement.innerHTML = `<h3 class="lose">💔 You Lose! Sum: ${sum}</h3>`;
            this.gameStatusElement.classList.add('lose');
        }
        
        // Add to history
        this.addToHistory({
            dice1: this.getDiceValue(this.dice1Element.querySelector('img').src),
            dice2: this.getDiceValue(this.dice2Element.querySelector('img').src),
            sum: sum,
            selectedSum: this.selectedSum,
            isWin: isWin,
            payout: payout,
            profit: profit
        });
        
        // Update display
        this.updateDisplay();
        
        // Reset for next round
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }

    getDiceValue(imageSrc) {
        const match = imageSrc.match(/(\d+)\.png$/);
        return match ? parseInt(match[1]) : 1;
    }

    addToHistory(result) {
        this.gameHistory.unshift(result);
        if (this.gameHistory.length > 10) {
            this.gameHistory.pop();
        }
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.recentResultsElement.innerHTML = this.gameHistory.slice(0, 5).map(result => {
            const resultClass = result.isWin ? 'win' : 'lose';
            return `<div class="result-item ${resultClass}">${result.sum}</div>`;
        }).join('');
    }

    resetGame() {
        this.isRolling = false;
        this.betButton.disabled = false;
        this.betButton.textContent = 'Roll Dice';
        this.gameStatusElement.innerHTML = '<h3>Choose your sum and roll the dice!</h3>';
        this.gameStatusElement.classList.remove('win', 'lose');
        this.selectedSum = null;
        
        // Clear sum selection
        this.sumButtons.forEach(btn => btn.classList.remove('selected'));
        
        this.updateDisplay();
    }

    toggleAutoBet() {
        if (this.autoBetSettings.isActive) {
            this.stopAutoBet();
        } else {
            this.startAutoBet();
        }
    }

    startAutoBet() {
        this.autoBetSettings.isActive = true;
        this.autoBetSettings.amount = parseFloat(this.autoAmountInput.value) || 10;
        this.autoBetSettings.sum = parseInt(this.autoSumSelect.value) || 7;
        this.autoBetSettings.rounds = parseInt(this.autoRoundsInput.value) || 10;
        this.autoBetSettings.currentRound = 0;
        this.autoBetSettings.wins = 0;
        this.autoBetSettings.losses = 0;
        
        this.autoButton.textContent = 'Stop Auto';
        this.autoButton.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
        
        this.executeAutoBet();
    }

    stopAutoBet() {
        this.autoBetSettings.isActive = false;
        this.autoButton.textContent = 'Start Auto';
        this.autoButton.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
    }

    executeAutoBet() {
        if (!this.autoBetSettings.isActive) return;
        
        if (this.autoBetSettings.currentRound >= this.autoBetSettings.rounds) {
            this.stopAutoBet();
            return;
        }
        
        // Set auto bet amount and sum
        this.betAmount = this.autoBetSettings.amount;
        this.betAmountInput.value = this.autoBetSettings.amount;
        this.selectedSum = this.autoBetSettings.sum;
        
        // Update sum selection display
        this.sumButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.sum) === this.autoBetSettings.sum) {
                btn.classList.add('selected');
            }
        });
        
        this.autoBetSettings.currentRound++;
        
        // Roll dice
        this.rollDice();
        
        // Schedule next auto bet
        if (this.autoBetSettings.isActive) {
            setTimeout(() => {
                this.executeAutoBet();
            }, 4000); // Wait 4 seconds between bets
        }
    }

    updateDisplay() {
        // Update balance
        this.balanceElement.textContent = this.balance.toLocaleString();
        
        // Update statistics
        this.totalBetsElement.textContent = this.stats.totalBets;
        this.totalWinsElement.textContent = this.stats.totalWins;
        this.winRateElement.textContent = this.stats.totalBets > 0 ? 
            Math.round((this.stats.totalWins / this.stats.totalBets) * 100) + '%' : '0%';
        this.totalProfitElement.textContent = this.stats.totalProfit.toLocaleString();
        
        // Update bet button state
        this.betButton.disabled = this.isRolling || !this.selectedSum || this.balance < this.betAmount;
        
        // Update auto bet button
        if (this.autoBetSettings.isActive) {
            this.autoButton.textContent = `Auto: ${this.autoBetSettings.currentRound}/${this.autoBetSettings.rounds}`;
        }
    }

    startPlayerCountAnimation() {
        setInterval(() => {
            const currentCount = parseInt(this.playerCountElement.textContent.replace(/,/g, ''));
            const newCount = currentCount + Math.floor(Math.random() * 3);
            this.playerCountElement.textContent = newCount.toLocaleString();
        }, 5000);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DiceSumGame();
    console.log('Dice Sum Game loaded successfully! 🎲✨');
});
