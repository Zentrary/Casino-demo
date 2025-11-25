// Classic Dice Game - Stake.com Style
// =====================================================

// Game State
const gameState = {
    mode: 'manual',
    balance: 10000,
    betAmount: 0,
    rollUnder: 50,
    isRollOver: false,
    isRolling: false,
    history: [],
    
    // Statistics
    stats: {
        totalBets: 0,
        totalWagered: 0,
        totalWins: 0,
        totalLosses: 0,
        totalProfit: 0,
        winRate: 0
    },
    
    // Auto Mode
    auto: {
        isRunning: false,
        numberOfBets: 100,
        currentBet: 0,
        baseAmount: 0,
        onWinAction: 'reset',
        onLossAction: 'reset',
        winIncreasePercent: 0,
        lossIncreasePercent: 0,
        stopOnWin: 0,
        stopOnLoss: 0,
        sessionProfit: 0
    },
    
    // Advanced Mode
    advanced: {
        strategy: 'martingale',
        consecutiveLosses: 0,
        consecutiveWins: 0
    }
};

// DOM Elements
const elements = {
    // Mode tabs
    modeTabs: document.querySelectorAll('.mode-tab'),
    manualControls: document.getElementById('manual-controls'),
    autoControls: document.getElementById('auto-controls'),
    advancedControls: document.getElementById('advanced-controls'),
    
    // Inputs
    betAmount: document.getElementById('betAmount'),
    autoAmount: document.getElementById('autoAmount'),
    advancedAmount: document.getElementById('advancedAmount'),
    winAmount: document.getElementById('winAmount'),
    
    // Slider
    rollSlider: document.getElementById('rollSlider'),
    sliderHandle: document.getElementById('sliderHandle'),
    sliderProgress: document.getElementById('sliderProgress'),
    
    // Dice Display
    diceHexagon: document.getElementById('diceHexagon'),
    diceNumber: document.getElementById('diceNumber'),
    
    // Stats
    payoutValue: document.getElementById('payoutValue'),
    rollUnderValue: document.getElementById('rollUnderValue'),
    winChanceValue: document.getElementById('winChanceValue'),
    
    // Statistics
    totalBets: document.getElementById('totalBets'),
    totalWagered: document.getElementById('totalWagered'),
    totalWins: document.getElementById('totalWins'),
    totalLosses: document.getElementById('totalLosses'),
    totalProfit: document.getElementById('totalProfit'),
    winRate: document.getElementById('winRate'),
    
    // Buttons
    rollButton: document.getElementById('rollButton'),
    autoRollButton: document.getElementById('autoRollButton'),
    advancedRollButton: document.getElementById('advancedRollButton'),
    
    // History
    historyChips: document.getElementById('historyChips'),
    
    // Result Overlay
    resultOverlay: document.getElementById('resultOverlay')
};

// Initialize Game
function initGame() {
    setupEventListeners();
    updateSlider();
    updateStats();
    updateWinAmount();
    
    // Initialize demo history
    const demoHistory = [56.86, 3.43, 47.6, 81.07, 63.25, 39.24, 26.87, 34.45, 98.28];
    gameState.history = demoHistory;
}

// Event Listeners Setup
function setupEventListeners() {
    // Mode Tabs
    elements.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });
    
    // Slider
    elements.rollSlider.addEventListener('input', handleSliderChange);
    
    // Amount inputs
    elements.betAmount.addEventListener('input', updateWinAmount);
    elements.autoAmount.addEventListener('input', updateWinAmount);
    elements.advancedAmount.addEventListener('input', updateWinAmount);
    
    // Quick amount buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseFloat(btn.dataset.amount);
            setAmount(amount);
        });
    });
    
    // Multiplier buttons
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const multiplier = parseFloat(btn.dataset.multiplier);
            if (multiplier) {
                multiplyAmount(multiplier);
            }
        });
    });
    
    // Roll buttons
    elements.rollButton.addEventListener('click', rollDice);
    elements.autoRollButton.addEventListener('click', toggleAutoBet);
    elements.advancedRollButton.addEventListener('click', toggleAdvancedBet);
    
    // Auto mode controls
    setupAutoModeControls();
    
    // Advanced mode controls
    setupAdvancedModeControls();
}

// Switch Mode
function switchMode(mode) {
    gameState.mode = mode;
    
    // Update tab active state
    elements.modeTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    
    // Show/hide controls
    elements.manualControls.style.display = mode === 'manual' ? 'block' : 'none';
    elements.autoControls.classList.toggle('active', mode === 'auto');
    elements.advancedControls.classList.toggle('active', mode === 'advanced');
    
    // Stop any running auto bet
    if (mode === 'manual') {
        stopAutoBet();
    }
}

// Slider Handling
function handleSliderChange(e) {
    gameState.rollUnder = parseFloat(e.target.value);
    updateSlider();
    updateWinAmount();
}

function updateSlider() {
    const value = gameState.rollUnder;
    const percentage = (value / 100) * 100;
    
    // Update slider progress
    elements.sliderProgress.style.width = percentage + '%';
    
    // Update handle position
    elements.sliderHandle.style.left = percentage + '%';
    
    // Update stats
    elements.rollUnderValue.textContent = value.toFixed(0);
    elements.winChanceValue.textContent = value.toFixed(0);
    
    // Calculate payout: 99 / rollUnder
    const payout = (99 / value).toFixed(2);
    elements.payoutValue.textContent = payout;
}

// Amount Handling
function setAmount(amount) {
    if (gameState.mode === 'manual') {
        elements.betAmount.value = amount;
    } else if (gameState.mode === 'auto') {
        elements.autoAmount.value = amount;
    } else {
        elements.advancedAmount.value = amount;
    }
    updateWinAmount();
}

function multiplyAmount(multiplier) {
    let currentAmount = getCurrentAmount();
    currentAmount *= multiplier;
    setAmount(currentAmount.toFixed(2));
}

function getCurrentAmount() {
    if (gameState.mode === 'manual') {
        return parseFloat(elements.betAmount.value) || 0;
    } else if (gameState.mode === 'auto') {
        return parseFloat(elements.autoAmount.value) || 0;
    } else {
        return parseFloat(elements.advancedAmount.value) || 0;
    }
}

function updateWinAmount() {
    const amount = getCurrentAmount();
    const payout = parseFloat(elements.payoutValue.textContent);
    const winAmount = (amount * payout).toFixed(4);
    elements.winAmount.value = winAmount;
}

// Roll Dice - Main Game Logic
async function rollDice() {
    if (gameState.isRolling) return;
    
    const betAmount = getCurrentAmount();
    
    // Demo mode check
    const isDemoMode = betAmount === 0;
    
    if (!isDemoMode && betAmount > gameState.balance) {
        alert('Insufficient balance!');
        return;
    }
    
    gameState.isRolling = true;
    elements.rollButton.disabled = true;
    
    // Add rolling animation
    elements.diceHexagon.classList.add('rolling');
    
    // Simulate rolling animation
    await animateRoll();
    
    // Generate random result (0-100)
    const result = (Math.random() * 100).toFixed(2);
    const resultNum = parseFloat(result);
    
    // Determine win/loss
    const isWin = resultNum < gameState.rollUnder;
    
    // Calculate profit
    const payout = parseFloat(elements.payoutValue.textContent);
    let profit = 0;
    
    if (isWin) {
        profit = betAmount * (payout - 1);
    } else {
        profit = -betAmount;
    }
    
    // Update balance (skip in demo mode)
    if (!isDemoMode) {
        gameState.balance += profit;
    }
    
    // Update statistics
    updateGameStats(betAmount, isWin, profit);
    
    // Display result
    displayResult(result, isWin);
    
    // Add to history
    addToHistory(result, isWin);
    
    // Show win/loss overlay
    showResultOverlay(isWin, profit);
    
    // Reset state
    elements.diceHexagon.classList.remove('rolling');
    gameState.isRolling = false;
    elements.rollButton.disabled = false;
}

// Animate Roll
function animateRoll() {
    return new Promise(resolve => {
        let count = 0;
        const interval = setInterval(() => {
            const randomNum = (Math.random() * 100).toFixed(2);
            elements.diceNumber.textContent = randomNum;
            count++;
            
            if (count >= 10) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

// Display Result
function displayResult(result, isWin) {
    elements.diceNumber.textContent = result;
    
    // Remove previous classes
    elements.diceNumber.classList.remove('win-result', 'loss-result');
    
    // Add result class
    if (isWin) {
        elements.diceNumber.classList.add('win-result');
    } else {
        elements.diceNumber.classList.add('loss-result');
    }
}

// Show Result Overlay
function showResultOverlay(isWin, profit) {
    elements.resultOverlay.textContent = isWin ? 'WIN!' : 'LOSS';
    elements.resultOverlay.className = 'result-overlay show ' + (isWin ? 'win' : 'loss');
    
    setTimeout(() => {
        elements.resultOverlay.classList.remove('show');
    }, 1000);
}

// Add to History
function addToHistory(result, isWin) {
    gameState.history.unshift(parseFloat(result));
    
    // Keep only last 20
    if (gameState.history.length > 20) {
        gameState.history.pop();
    }
    
    // Update history display
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    elements.historyChips.innerHTML = '';
    
    gameState.history.forEach((value, index) => {
        if (index < 10) { // Show only 10
            const chip = document.createElement('div');
            chip.className = 'history-chip ' + (value < gameState.rollUnder ? 'win' : 'loss');
            chip.textContent = value.toFixed(2);
            elements.historyChips.appendChild(chip);
        }
    });
}

// Update Game Statistics
function updateGameStats(betAmount, isWin, profit) {
    gameState.stats.totalBets++;
    gameState.stats.totalWagered += betAmount;
    
    if (isWin) {
        gameState.stats.totalWins++;
    } else {
        gameState.stats.totalLosses++;
    }
    
    gameState.stats.totalProfit += profit;
    gameState.stats.winRate = ((gameState.stats.totalWins / gameState.stats.totalBets) * 100).toFixed(2);
    
    updateStats();
}

function updateStats() {
    elements.totalBets.textContent = gameState.stats.totalBets;
    elements.totalWagered.textContent = gameState.stats.totalWagered.toFixed(2);
    elements.totalWins.textContent = gameState.stats.totalWins;
    elements.totalLosses.textContent = gameState.stats.totalLosses;
    
    const profitElement = elements.totalProfit;
    profitElement.textContent = gameState.stats.totalProfit.toFixed(2);
    profitElement.className = 'stat-item-value';
    
    if (gameState.stats.totalProfit > 0) {
        profitElement.classList.add('positive');
    } else if (gameState.stats.totalProfit < 0) {
        profitElement.classList.add('negative');
    }
    
    elements.winRate.textContent = gameState.stats.winRate + '%';
}

// =====================================================
// AUTO MODE
// =====================================================

function setupAutoModeControls() {
    // Number of bets buttons
    document.querySelectorAll('#auto-controls .bet-count-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#auto-controls .bet-count-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const count = this.dataset.count;
            gameState.auto.numberOfBets = count === 'infinite' ? Infinity : parseInt(count);
        });
    });
    
    // On Win controls
    const onWinBtns = document.querySelectorAll('#auto-controls .control-group:nth-of-type(5) .control-btn');
    const winIncreaseInput = document.getElementById('winIncreasePercent');
    
    onWinBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            onWinBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const action = this.dataset.action;
            gameState.auto.onWinAction = action;
            winIncreaseInput.disabled = action === 'reset';
        });
    });
    
    winIncreaseInput.addEventListener('input', function() {
        gameState.auto.winIncreasePercent = parseFloat(this.value) || 0;
    });
    
    // On Loss controls
    const onLossBtns = document.querySelectorAll('#auto-controls .control-group:nth-of-type(6) .control-btn');
    const lossIncreaseInput = document.getElementById('lossIncreasePercent');
    
    onLossBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            onLossBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const action = this.dataset.action;
            gameState.auto.onLossAction = action;
            lossIncreaseInput.disabled = action === 'reset';
        });
    });
    
    lossIncreaseInput.addEventListener('input', function() {
        gameState.auto.lossIncreasePercent = parseFloat(this.value) || 0;
    });
    
    // Stop conditions
    document.getElementById('stopOnWin').addEventListener('input', function() {
        gameState.auto.stopOnWin = parseFloat(this.value) || 0;
    });
    
    document.getElementById('stopOnLoss').addEventListener('input', function() {
        gameState.auto.stopOnLoss = parseFloat(this.value) || 0;
    });
}

async function toggleAutoBet() {
    if (gameState.auto.isRunning) {
        stopAutoBet();
    } else {
        startAutoBet();
    }
}

async function startAutoBet() {
    gameState.auto.isRunning = true;
    gameState.auto.currentBet = 0;
    gameState.auto.baseAmount = getCurrentAmount();
    gameState.auto.sessionProfit = 0;
    
    elements.autoRollButton.textContent = 'Stop Auto Bet';
    elements.autoRollButton.style.background = 'linear-gradient(135deg, #ff4757 0%, #ee5a6f 100%)';
    
    while (gameState.auto.isRunning && gameState.auto.currentBet < gameState.auto.numberOfBets) {
        await runAutoBet();
        
        // Check stop conditions
        if (gameState.auto.stopOnWin > 0 && gameState.auto.sessionProfit >= gameState.auto.stopOnWin) {
            console.log('Stop on win reached');
            break;
        }
        
        if (gameState.auto.stopOnLoss > 0 && Math.abs(gameState.auto.sessionProfit) >= gameState.auto.stopOnLoss) {
            console.log('Stop on loss reached');
            break;
        }
        
        // Delay between bets
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    stopAutoBet();
}

async function runAutoBet() {
    const betAmount = getCurrentAmount();
    
    // Demo mode check
    const isDemoMode = betAmount === 0;
    
    if (!isDemoMode && betAmount > gameState.balance) {
        console.log('Insufficient balance, stopping auto bet');
        stopAutoBet();
        return;
    }
    
    // Simulate roll
    const result = (Math.random() * 100).toFixed(2);
    const resultNum = parseFloat(result);
    const isWin = resultNum < gameState.rollUnder;
    
    // Calculate profit
    const payout = parseFloat(elements.payoutValue.textContent);
    let profit = 0;
    
    if (isWin) {
        profit = betAmount * (payout - 1);
    } else {
        profit = -betAmount;
    }
    
    // Update balance
    if (!isDemoMode) {
        gameState.balance += profit;
    }
    
    gameState.auto.sessionProfit += profit;
    
    // Update statistics
    updateGameStats(betAmount, isWin, profit);
    
    // Display result
    displayResult(result, isWin);
    addToHistory(result, isWin);
    
    // Adjust bet amount based on win/loss
    adjustBetAmount(isWin);
    
    gameState.auto.currentBet++;
}

function adjustBetAmount(isWin) {
    let newAmount = getCurrentAmount();
    
    if (isWin && gameState.auto.onWinAction === 'increase') {
        newAmount *= (1 + gameState.auto.winIncreasePercent / 100);
    } else if (isWin && gameState.auto.onWinAction === 'reset') {
        newAmount = gameState.auto.baseAmount;
    }
    
    if (!isWin && gameState.auto.onLossAction === 'increase') {
        newAmount *= (1 + gameState.auto.lossIncreasePercent / 100);
    } else if (!isWin && gameState.auto.onLossAction === 'reset') {
        newAmount = gameState.auto.baseAmount;
    }
    
    setAmount(newAmount.toFixed(2));
}

function stopAutoBet() {
    gameState.auto.isRunning = false;
    elements.autoRollButton.textContent = 'Start Auto Bet';
    elements.autoRollButton.style.background = 'linear-gradient(135deg, #00e701 0%, #00b300 100%)';
}

// =====================================================
// ADVANCED MODE
// =====================================================

function setupAdvancedModeControls() {
    // Number of bets buttons
    document.querySelectorAll('#advanced-controls .bet-count-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#advanced-controls .bet-count-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const count = this.dataset.count;
            gameState.auto.numberOfBets = count === 'infinite' ? Infinity : parseInt(count);
        });
    });
    
    // Strategy selector
    const strategySelector = document.getElementById('strategySelector');
    strategySelector.addEventListener('change', function() {
        gameState.advanced.strategy = this.value;
        updateStrategyDisplay();
    });
    
    // How it works
    document.querySelector('#advanced-controls .how-it-works').addEventListener('click', () => {
        showStrategyInfo();
    });
}

function updateStrategyDisplay() {
    const conditionsBox = document.querySelector('.conditions-box');
    const strategy = gameState.advanced.strategy;
    
    let conditionsHTML = '<label class="control-label" style="margin-bottom: 12px;">Conditions</label>';
    
    if (strategy === 'martingale') {
        conditionsHTML += `
            <div class="condition-item">
                <div class="condition-badge">1</div>
                <span>On loss: Double bet amount</span>
            </div>
            <div class="condition-item">
                <div class="condition-badge" style="background: rgba(0, 231, 1, 0.2); color: #00e701;">2</div>
                <span>On win: Reset to base amount</span>
            </div>
        `;
    } else if (strategy === 'reverse-martingale') {
        conditionsHTML += `
            <div class="condition-item">
                <div class="condition-badge" style="background: rgba(0, 231, 1, 0.2); color: #00e701;">1</div>
                <span>On win: Double bet amount</span>
            </div>
            <div class="condition-item">
                <div class="condition-badge">2</div>
                <span>On loss: Reset to base amount</span>
            </div>
        `;
    } else {
        conditionsHTML += `
            <div class="condition-item">
                <div class="condition-badge">?</div>
                <span>Create your own strategy...</span>
            </div>
        `;
    }
    
    conditionsBox.innerHTML = conditionsHTML;
}

async function toggleAdvancedBet() {
    if (gameState.auto.isRunning) {
        stopAdvancedBet();
    } else {
        startAdvancedBet();
    }
}

async function startAdvancedBet() {
    gameState.auto.isRunning = true;
    gameState.auto.currentBet = 0;
    gameState.auto.baseAmount = getCurrentAmount();
    gameState.auto.sessionProfit = 0;
    gameState.advanced.consecutiveLosses = 0;
    gameState.advanced.consecutiveWins = 0;
    
    elements.advancedRollButton.textContent = 'Stop Auto Bet';
    elements.advancedRollButton.style.background = 'linear-gradient(135deg, #ff4757 0%, #ee5a6f 100%)';
    
    while (gameState.auto.isRunning && gameState.auto.currentBet < gameState.auto.numberOfBets) {
        await runAdvancedBet();
        
        // Delay between bets
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    stopAdvancedBet();
}

async function runAdvancedBet() {
    const betAmount = getCurrentAmount();
    
    // Demo mode check
    const isDemoMode = betAmount === 0;
    
    if (!isDemoMode && betAmount > gameState.balance) {
        console.log('Insufficient balance, stopping advanced bet');
        stopAdvancedBet();
        return;
    }
    
    // Simulate roll
    const result = (Math.random() * 100).toFixed(2);
    const resultNum = parseFloat(result);
    const isWin = resultNum < gameState.rollUnder;
    
    // Calculate profit
    const payout = parseFloat(elements.payoutValue.textContent);
    let profit = 0;
    
    if (isWin) {
        profit = betAmount * (payout - 1);
    } else {
        profit = -betAmount;
    }
    
    // Update balance
    if (!isDemoMode) {
        gameState.balance += profit;
    }
    
    gameState.auto.sessionProfit += profit;
    
    // Update statistics
    updateGameStats(betAmount, isWin, profit);
    
    // Display result
    displayResult(result, isWin);
    addToHistory(result, isWin);
    
    // Apply strategy
    applyStrategy(isWin);
    
    gameState.auto.currentBet++;
}

function applyStrategy(isWin) {
    const strategy = gameState.advanced.strategy;
    let newAmount = getCurrentAmount();
    
    if (strategy === 'martingale') {
        if (isWin) {
            newAmount = gameState.auto.baseAmount;
            gameState.advanced.consecutiveLosses = 0;
        } else {
            newAmount *= 2;
            gameState.advanced.consecutiveLosses++;
        }
    } else if (strategy === 'reverse-martingale') {
        if (isWin) {
            newAmount *= 2;
            gameState.advanced.consecutiveWins++;
        } else {
            newAmount = gameState.auto.baseAmount;
            gameState.advanced.consecutiveWins = 0;
        }
    }
    
    setAmount(newAmount.toFixed(2));
}

function stopAdvancedBet() {
    gameState.auto.isRunning = false;
    elements.advancedRollButton.textContent = 'Start Auto Bet';
    elements.advancedRollButton.style.background = 'linear-gradient(135deg, #00e701 0%, #00b300 100%)';
}

function showStrategyInfo() {
    const strategy = gameState.advanced.strategy;
    let message = '';
    
    if (strategy === 'martingale') {
        message = 'Martingale Strategy:\n\n' +
                  'When you lose, double your bet to recover losses plus gain profit.\n' +
                  'When you win, reset to base amount.\n\n' +
                  'Risk: Requires large bankroll for losing streaks.';
    } else if (strategy === 'reverse-martingale') {
        message = 'Reverse Martingale Strategy:\n\n' +
                  'When you win, double your bet to maximize winning streaks.\n' +
                  'When you lose, reset to base amount.\n\n' +
                  'Risk: One loss after wins resets all progress.';
    } else {
        message = 'Custom Strategy:\n\n' +
                  'Create your own betting strategy with custom conditions.\n' +
                  'Use the Create button to define your rules.';
    }
    
    alert(message);
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);

