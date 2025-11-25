// Wheel of Fortune Game Logic
(function() {
    'use strict';

    // Game Configuration
    const WHEEL_SEGMENTS = [
        { color: 'gray', multiplier: 2, probability: 0.40, startAngle: 0, endAngle: 144 },
        { color: 'green', multiplier: 3, probability: 0.35, startAngle: 144, endAngle: 270 },
        { color: 'blue', multiplier: 5, probability: 0.20, startAngle: 270, endAngle: 342 },
        { color: 'purple', multiplier: 50, probability: 0.05, startAngle: 342, endAngle: 360 }
    ];

    const COLOR_MAP = {
        gray: '#8e8e8e',
        green: '#00c74d',
        blue: '#3b82f6',
        purple: '#a855f7'
    };

    // Game State
    let gameState = {
        balance: 10000,
        isDemo: false,
        isSpinning: false,
        selectedColor: null,
        selectedMultiplier: 0,
        betAmount: 10,
        soundEnabled: true,
        
        // Statistics
        totalSpins: 0,
        totalWon: 0,
        totalLost: 0,
        history: [],
        colorHistory: [],
        
        // Auto Betting
        autoMode: false,
        autoBetSettings: {
            numberOfBets: Infinity,
            currentBet: 0,
            onWin: 'reset',
            onWinPercent: 0,
            onLoss: 'reset',
            onLossPercent: 0,
            stopOnWin: 0,
            stopOnLoss: 0,
            selectedColor: null
        },
        
        // Advanced Strategy
        selectedStrategy: 'none',
        customConditions: [],
        
        // Streak tracking
        currentStreak: { type: null, count: 0 },
        sessionProfit: 0
    };

    // DOM Elements
    const elements = {
        // Balance
        balanceDisplay: document.getElementById('balance'),
        demoModeBtn: document.getElementById('demoModeBtn'),
        
        // Tabs
        bettingTabs: document.querySelectorAll('.betting-tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        // Manual Tab
        manualBetAmount: document.getElementById('manualBetAmount'),
        manualWinAmount: document.getElementById('manualWinAmount'),
        spinNowBtn: document.getElementById('spinNowBtn'),
        manualHalfBtn: document.getElementById('manualHalfBtn'),
        manualDoubleBtn: document.getElementById('manualDoubleBtn'),
        quickAmountBtns: document.querySelectorAll('.quick-amount-btn'),
        manualColorBtns: document.querySelectorAll('#manualTab .color-bet-btn'),
        
        // Auto Tab
        autoBetAmount: document.getElementById('autoBetAmount'),
        autoHalfBtn: document.getElementById('autoHalfBtn'),
        autoDoubleBtn: document.getElementById('autoDoubleBtn'),
        numberOfBets: document.getElementById('numberOfBets'),
        presetBetBtns: document.querySelectorAll('.preset-bet-btn'),
        autoColorBtns: document.querySelectorAll('#autoTab .color-bet-btn'),
        startAutoBetBtn: document.getElementById('startAutoBetBtn'),
        betCounter: document.getElementById('betCounter'),
        currentBetCount: document.getElementById('currentBetCount'),
        totalBetCount: document.getElementById('totalBetCount'),
        autoProfitAmount: document.getElementById('autoProfitAmount'),
        
        // Win/Loss Strategy
        onWinBtns: document.querySelectorAll('#autoTab .win-loss-controls:nth-of-type(1) .strategy-btn'),
        onWinPercent: document.getElementById('onWinPercent'),
        onLossBtns: document.querySelectorAll('#autoTab .win-loss-controls:nth-of-type(2) .strategy-btn'),
        onLossPercent: document.getElementById('onLossPercent'),
        
        // Stop Conditions
        stopOnWin: document.getElementById('stopOnWin'),
        stopOnLoss: document.getElementById('stopOnLoss'),
        
        // Advanced Tab
        strategyOptionBtns: document.querySelectorAll('.strategy-option-btn'),
        customStrategySection: document.getElementById('customStrategySection'),
        customConditionsList: document.getElementById('customConditionsList'),
        createConditionBtn: document.getElementById('createConditionBtn'),
        strategyInfoText: document.getElementById('strategyInfoText'),
        applyStrategyBtn: document.getElementById('applyStrategyBtn'),
        
        // Wheel
        wheelCanvas: document.getElementById('wheelCanvas'),
        
        // Result Display
        resultDisplay: document.getElementById('resultDisplay'),
        resultIcon: document.getElementById('resultIcon'),
        resultText: document.getElementById('resultText'),
        resultAmount: document.getElementById('resultAmount'),
        resultColor: document.getElementById('resultColor'),
        resultMultiplier: document.getElementById('resultMultiplier'),
        
        // Statistics
        totalSpinsDisplay: document.getElementById('totalSpins'),
        totalWonDisplay: document.getElementById('totalWon'),
        totalLostDisplay: document.getElementById('totalLost'),
        netProfitDisplay: document.getElementById('netProfit'),
        
        // Color Distribution
        grayBar: document.getElementById('grayBar'),
        grayPercent: document.getElementById('grayPercent'),
        greenBar: document.getElementById('greenBar'),
        greenPercent: document.getElementById('greenPercent'),
        blueBar: document.getElementById('blueBar'),
        bluePercent: document.getElementById('bluePercent'),
        purpleBar: document.getElementById('purpleBar'),
        purplePercent: document.getElementById('purplePercent'),
        
        // History
        historyList: document.getElementById('historyList'),
        
        // Modal
        conditionModal: document.getElementById('conditionModal'),
        closeConditionModal: document.getElementById('closeConditionModal'),
        conditionType: document.getElementById('conditionType'),
        conditionValue: document.getElementById('conditionValue'),
        conditionAction: document.getElementById('conditionAction'),
        cancelConditionBtn: document.getElementById('cancelConditionBtn'),
        saveConditionBtn: document.getElementById('saveConditionBtn'),
        
        // Sound
        soundToggle: document.getElementById('soundToggle')
    };

    // Canvas Setup
    const ctx = elements.wheelCanvas.getContext('2d');
    const centerX = elements.wheelCanvas.width / 2;
    const centerY = elements.wheelCanvas.height / 2;
    const radius = 280;

    // Sound Effects (using Web Audio API)
    let audioContext = null;
    
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(frequency, duration, type = 'sine') {
        if (!gameState.soundEnabled || !audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    function playWinSound() {
        playSound(523.25, 0.1); // C5
        setTimeout(() => playSound(659.25, 0.1), 100); // E5
        setTimeout(() => playSound(783.99, 0.2), 200); // G5
    }

    function playLoseSound() {
        playSound(220, 0.3, 'sawtooth');
    }

    function playSpinSound() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                playSound(200 + i * 20, 0.05, 'square');
            }, i * 100);
        }
    }

    // Draw Wheel
    function drawWheel(rotation = 0) {
        ctx.clearRect(0, 0, elements.wheelCanvas.width, elements.wheelCanvas.height);
        
        // Draw segments
        WHEEL_SEGMENTS.forEach(segment => {
            const startAngle = (segment.startAngle + rotation) * Math.PI / 180;
            const endAngle = (segment.endAngle + rotation) * Math.PI / 180;
            
            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            // Gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, COLOR_MAP[segment.color]);
            gradient.addColorStop(1, adjustBrightness(COLOR_MAP[segment.color], -30));
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Border
            ctx.strokeStyle = '#1a2332';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw multiplier text
            const angle = (startAngle + endAngle) / 2;
            const textX = centerX + Math.cos(angle) * (radius * 0.7);
            const textY = centerY + Math.sin(angle) * (radius * 0.7);
            
            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(angle + Math.PI / 2);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Poppins';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fillText(`×${segment.multiplier}`, 0, 0);
            
            ctx.restore();
        });
        
        // Draw center circle border
        ctx.beginPath();
        ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    function adjustBrightness(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    // Spin Wheel
    function spinWheel() {
        if (gameState.isSpinning) return;
        
        const currentTab = document.querySelector('.betting-tab.active').dataset.tab;
        const betAmount = currentTab === 'manual' 
            ? parseFloat(elements.manualBetAmount.value) 
            : parseFloat(elements.autoBetAmount.value);
        
        if (!gameState.selectedColor) {
            showNotification('Please select a color!', 'error');
            return;
        }
        
        if (betAmount > gameState.balance && !gameState.isDemo) {
            showNotification('Insufficient balance!', 'error');
            return;
        }
        
        gameState.isSpinning = true;
        elements.spinNowBtn.disabled = true;
        
        // Deduct bet amount
        if (!gameState.isDemo) {
            gameState.balance -= betAmount;
            updateBalanceDisplay();
        }
        
        // Play spin sound
        initAudio();
        playSpinSound();
        
        // Generate random result
        const randomValue = Math.random();
        let cumulativeProbability = 0;
        let resultSegment = null;
        
        for (const segment of WHEEL_SEGMENTS) {
            cumulativeProbability += segment.probability;
            if (randomValue <= cumulativeProbability) {
                resultSegment = segment;
                break;
            }
        }
        
        if (!resultSegment) {
            resultSegment = WHEEL_SEGMENTS[WHEEL_SEGMENTS.length - 1];
        }
        
        // Calculate spin
        const targetAngle = (resultSegment.startAngle + resultSegment.endAngle) / 2;
        const spinRotations = 5; // Number of full rotations
        
        // Pointer is at top (270 degrees in canvas coordinates)
        // We need to rotate the wheel so the target segment center aligns with pointer
        const pointerPosition = 270;
        let finalRotation = pointerPosition - targetAngle;
        
        // Ensure positive rotation
        while (finalRotation < 0) {
            finalRotation += 360;
        }
        
        const totalRotation = (spinRotations * 360) + finalRotation;
        const duration = 4000; // 4 seconds
        
        // Animate wheel
        animateWheelSpin(totalRotation, duration, () => {
            handleSpinResult(resultSegment, betAmount);
        });
    }

    function animateWheelSpin(totalRotation, duration, callback) {
        const startTime = Date.now();
        let currentRotation = 0;
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (cubic ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            currentRotation = totalRotation * easeProgress;
            
            drawWheel(currentRotation);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                callback();
            }
        }
        
        animate();
    }

    function handleSpinResult(resultSegment, betAmount) {
        const isWin = resultSegment.color === gameState.selectedColor;
        const winAmount = isWin ? betAmount * resultSegment.multiplier : 0;
        const netAmount = isWin ? winAmount - betAmount : -betAmount;
        
        // Update balance
        if (!gameState.isDemo && isWin) {
            gameState.balance += winAmount;
        }
        
        // Update statistics
        gameState.totalSpins++;
        if (isWin) {
            gameState.totalWon++;
        } else {
            gameState.totalLost++;
        }
        
        // Update session profit
        gameState.sessionProfit += netAmount;
        
        // Track streak
        if (isWin) {
            if (gameState.currentStreak.type === 'win') {
                gameState.currentStreak.count++;
            } else {
                gameState.currentStreak = { type: 'win', count: 1 };
            }
        } else {
            if (gameState.currentStreak.type === 'lose') {
                gameState.currentStreak.count++;
            } else {
                gameState.currentStreak = { type: 'lose', count: 1 };
            }
        }
        
        // Add to history
        addToHistory({
            color: resultSegment.color,
            multiplier: resultSegment.multiplier,
            betAmount: betAmount,
            winAmount: winAmount,
            netAmount: netAmount,
            isWin: isWin,
            timestamp: new Date()
        });
        
        // Play sound
        if (isWin) {
            playWinSound();
        } else {
            playLoseSound();
        }
        
        // Show result
        setTimeout(() => {
            showResult(resultSegment, winAmount, isWin);
            gameState.isSpinning = false;
            elements.spinNowBtn.disabled = false;
            
            // Handle auto betting
            if (gameState.autoMode) {
                handleAutoBetContinue(isWin, betAmount);
            }
        }, 1000);
        
        updateBalanceDisplay();
        updateStatistics();
        updateColorDistribution();
    }

    function showResult(segment, winAmount, isWin) {
        elements.resultIcon.textContent = isWin ? '🎉' : '😢';
        elements.resultText.textContent = isWin ? 'YOU WIN!' : 'YOU LOSE!';
        elements.resultText.className = isWin ? 'result-text' : 'result-text lose';
        
        const displayAmount = isWin ? `+${winAmount.toFixed(2)}` : `-${parseFloat(elements.manualBetAmount.value).toFixed(2)}`;
        elements.resultAmount.textContent = `${displayAmount} ฿`;
        elements.resultAmount.className = isWin ? 'result-amount' : 'result-amount negative';
        
        elements.resultColor.textContent = segment.color.charAt(0).toUpperCase() + segment.color.slice(1);
        elements.resultMultiplier.textContent = `×${segment.multiplier}`;
        
        elements.resultDisplay.style.display = 'block';
        
        setTimeout(() => {
            elements.resultDisplay.style.display = 'none';
        }, 3000);
    }
    
    function showNotification(message, type = 'info') {
        // Simple notification - you can enhance this
        alert(message);
    }

    // History Management
    function addToHistory(historyItem) {
        gameState.history.unshift(historyItem);
        gameState.colorHistory.unshift(historyItem.color);
        
        if (gameState.history.length > 50) {
            gameState.history.pop();
        }
        
        if (gameState.colorHistory.length > 100) {
            gameState.colorHistory.pop();
        }
        
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        if (gameState.history.length === 0) {
            elements.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clock"></i>
                    <p>No spins yet. Start playing!</p>
                </div>
            `;
            return;
        }
        
        elements.historyList.innerHTML = gameState.history.map(item => `
            <div class="history-item">
                <div class="history-color">
                    <div class="color-indicator ${item.color}-color"></div>
                    <span>${item.color}</span>
                </div>
                <div class="history-info">
                    <div class="history-multiplier">×${item.multiplier}</div>
                    <div class="history-time">${formatTime(item.timestamp)}</div>
                </div>
                <div class="history-result">
                    <div class="history-amount ${item.isWin ? 'win' : 'lose'}">
                        ${item.isWin ? '+' : ''}${item.netAmount.toFixed(2)} ฿
                    </div>
                </div>
            </div>
        `).join('');
    }

    function formatTime(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }

    // Statistics
    function updateStatistics() {
        elements.totalSpinsDisplay.textContent = gameState.totalSpins;
        elements.totalWonDisplay.textContent = gameState.totalWon;
        elements.totalLostDisplay.textContent = gameState.totalLost;
        
        const netProfit = gameState.sessionProfit;
        elements.netProfitDisplay.textContent = `${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)} ฿`;
        elements.netProfitDisplay.className = `stat-value ${netProfit >= 0 ? 'green' : 'red'}`;
    }

    function updateColorDistribution() {
        if (gameState.colorHistory.length === 0) return;
        
        const last100 = gameState.colorHistory.slice(0, 100);
        const distribution = {
            gray: 0,
            green: 0,
            blue: 0,
            purple: 0
        };
        
        last100.forEach(color => {
            distribution[color]++;
        });
        
        const total = last100.length;
        
        Object.keys(distribution).forEach(color => {
            const percent = (distribution[color] / total * 100).toFixed(1);
            const barElement = elements[`${color}Bar`];
            const percentElement = elements[`${color}Percent`];
            
            if (barElement) barElement.style.width = `${percent}%`;
            if (percentElement) percentElement.textContent = `${percent}%`;
        });
    }

    // Balance Management
    function updateBalanceDisplay() {
        elements.balanceDisplay.textContent = gameState.balance.toFixed(2);
    }

    // Tab Management
    function initTabs() {
        elements.bettingTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                elements.bettingTabs.forEach(t => t.classList.remove('active'));
                elements.tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                document.getElementById(`${tabName}Tab`).classList.add('active');
            });
        });
    }

    // Manual Betting
    function initManualBetting() {
        // Amount controls
        elements.manualHalfBtn.addEventListener('click', () => {
            elements.manualBetAmount.value = Math.max(1, parseFloat(elements.manualBetAmount.value) / 2);
            updateManualWinAmount();
        });
        
        elements.manualDoubleBtn.addEventListener('click', () => {
            const newAmount = parseFloat(elements.manualBetAmount.value) * 2;
            elements.manualBetAmount.value = Math.min(gameState.balance, newAmount);
            updateManualWinAmount();
        });
        
        elements.manualBetAmount.addEventListener('input', updateManualWinAmount);
        
        // Quick amounts
        elements.quickAmountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.dataset.amount;
                if (amount === 'max') {
                    elements.manualBetAmount.value = gameState.balance;
                } else {
                    elements.manualBetAmount.value = Math.min(parseFloat(amount), gameState.balance);
                }
                updateManualWinAmount();
            });
        });
        
        // Color selection
        elements.manualColorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.manualColorBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                gameState.selectedColor = btn.dataset.color;
                gameState.selectedMultiplier = parseFloat(btn.dataset.multiplier);
                updateManualWinAmount();
                elements.spinNowBtn.disabled = false;
            });
        });
        
        // Spin button
        elements.spinNowBtn.addEventListener('click', spinWheel);
    }

    function updateManualWinAmount() {
        if (gameState.selectedColor && gameState.selectedMultiplier > 0) {
            const betAmount = parseFloat(elements.manualBetAmount.value) || 0;
            const winAmount = betAmount * gameState.selectedMultiplier;
            elements.manualWinAmount.textContent = winAmount.toFixed(2);
        }
    }

    // Auto Betting
    function initAutoBetting() {
        // Amount controls
        elements.autoHalfBtn.addEventListener('click', () => {
            elements.autoBetAmount.value = Math.max(1, parseFloat(elements.autoBetAmount.value) / 2);
        });
        
        elements.autoDoubleBtn.addEventListener('click', () => {
            const newAmount = parseFloat(elements.autoBetAmount.value) * 2;
            elements.autoBetAmount.value = Math.min(gameState.balance, newAmount);
        });
        
        // Preset bets
        elements.presetBetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const bets = btn.dataset.bets;
                elements.numberOfBets.value = bets;
            });
        });
        
        // Color selection
        elements.autoColorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.autoColorBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                gameState.autoBetSettings.selectedColor = btn.dataset.color;
                gameState.selectedColor = btn.dataset.color;
                gameState.selectedMultiplier = parseFloat(btn.dataset.multiplier);
            });
        });
        
        // On Win strategy
        elements.onWinBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.onWinBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.autoBetSettings.onWin = btn.dataset.strategy;
                elements.onWinPercent.disabled = btn.dataset.strategy !== 'increase';
            });
        });
        
        // On Loss strategy
        elements.onLossBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.onLossBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.autoBetSettings.onLoss = btn.dataset.strategy;
                elements.onLossPercent.disabled = btn.dataset.strategy !== 'increase';
            });
        });
        
        // Start/Stop auto bet
        elements.startAutoBetBtn.addEventListener('click', toggleAutoBet);
    }

    function toggleAutoBet() {
        if (!gameState.autoMode) {
            startAutoBet();
        } else {
            stopAutoBet();
        }
    }

    function startAutoBet() {
        if (!gameState.autoBetSettings.selectedColor) {
            showNotification('Please select a color!', 'error');
            return;
        }
        
        gameState.autoMode = true;
        gameState.autoBetSettings.currentBet = 0;
        gameState.sessionProfit = 0;
        
        const numberOfBets = elements.numberOfBets.value;
        gameState.autoBetSettings.numberOfBets = numberOfBets === '∞' ? Infinity : parseInt(numberOfBets);
        gameState.autoBetSettings.onWinPercent = parseFloat(elements.onWinPercent.value) || 0;
        gameState.autoBetSettings.onLossPercent = parseFloat(elements.onLossPercent.value) || 0;
        gameState.autoBetSettings.stopOnWin = parseFloat(elements.stopOnWin.value) || 0;
        gameState.autoBetSettings.stopOnLoss = parseFloat(elements.stopOnLoss.value) || 0;
        
        elements.startAutoBetBtn.innerHTML = '<i class="fas fa-stop"></i> STOP AUTO BET';
        elements.startAutoBetBtn.classList.add('active');
        elements.betCounter.style.display = 'flex';
        elements.totalBetCount.textContent = numberOfBets;
        
        performAutoBet();
    }

    function stopAutoBet() {
        gameState.autoMode = false;
        elements.startAutoBetBtn.innerHTML = '<i class="fas fa-play"></i> START AUTO BET';
        elements.startAutoBetBtn.classList.remove('active');
        elements.betCounter.style.display = 'none';
    }

    function performAutoBet() {
        if (!gameState.autoMode) return;
        
        // Check if we've reached the bet limit
        if (gameState.autoBetSettings.currentBet >= gameState.autoBetSettings.numberOfBets) {
            stopAutoBet();
            showNotification('Auto bet completed!', 'success');
            return;
        }
        
        // Check stop conditions
        if (gameState.autoBetSettings.stopOnWin > 0 && 
            gameState.sessionProfit >= gameState.autoBetSettings.stopOnWin) {
            stopAutoBet();
            showNotification('Stop on win reached!', 'success');
            return;
        }
        
        if (gameState.autoBetSettings.stopOnLoss > 0 && 
            gameState.sessionProfit <= -gameState.autoBetSettings.stopOnLoss) {
            stopAutoBet();
            showNotification('Stop on loss reached!', 'error');
            return;
        }
        
        // Check balance
        const betAmount = parseFloat(elements.autoBetAmount.value);
        if (betAmount > gameState.balance && !gameState.isDemo) {
            stopAutoBet();
            showNotification('Insufficient balance!', 'error');
            return;
        }
        
        gameState.autoBetSettings.currentBet++;
        elements.currentBetCount.textContent = gameState.autoBetSettings.currentBet;
        elements.autoProfitAmount.textContent = gameState.sessionProfit.toFixed(2);
        
        spinWheel();
    }

    function handleAutoBetContinue(isWin, betAmount) {
        if (!gameState.autoMode) return;
        
        // Adjust bet amount based on strategy
        let newBetAmount = betAmount;
        
        if (isWin) {
            if (gameState.autoBetSettings.onWin === 'reset') {
                newBetAmount = parseFloat(elements.autoBetAmount.value);
            } else if (gameState.autoBetSettings.onWin === 'increase') {
                const increasePercent = gameState.autoBetSettings.onWinPercent / 100;
                newBetAmount = betAmount * (1 + increasePercent);
            }
        } else {
            if (gameState.autoBetSettings.onLoss === 'reset') {
                newBetAmount = parseFloat(elements.autoBetAmount.value);
            } else if (gameState.autoBetSettings.onLoss === 'increase') {
                const increasePercent = gameState.autoBetSettings.onLossPercent / 100;
                newBetAmount = betAmount * (1 + increasePercent);
            }
        }
        
        // Apply advanced strategy if selected
        if (gameState.selectedStrategy === 'martingale' && !isWin) {
            newBetAmount = betAmount * 2;
        } else if (gameState.selectedStrategy === 'reverse' && isWin) {
            newBetAmount = betAmount * 2;
        }
        
        // Check custom conditions
        checkCustomConditions();
        
        elements.autoBetAmount.value = Math.min(newBetAmount, gameState.balance);
        
        // Continue auto betting after a delay
        setTimeout(performAutoBet, 2000);
    }

    // Advanced Strategies
    function initAdvancedStrategies() {
        elements.strategyOptionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.strategyOptionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.selectedStrategy = btn.dataset.strategy;
                
                // Show/hide custom strategy section
                if (btn.dataset.strategy === 'custom') {
                    elements.customStrategySection.style.display = 'block';
                } else {
                    elements.customStrategySection.style.display = 'none';
                }
                
                updateStrategyInfo(btn.dataset.strategy);
            });
        });
        
        elements.createConditionBtn.addEventListener('click', () => {
            elements.conditionModal.classList.add('active');
        });
        
        elements.closeConditionModal.addEventListener('click', () => {
            elements.conditionModal.classList.remove('active');
        });
        
        elements.cancelConditionBtn.addEventListener('click', () => {
            elements.conditionModal.classList.remove('active');
        });
        
        elements.saveConditionBtn.addEventListener('click', saveCustomCondition);
    }

    function updateStrategyInfo(strategy) {
        const strategyInfo = {
            none: 'No automated strategy applied. Bet amounts remain constant.',
            martingale: 'Double your bet after each loss. Reset after a win. High risk strategy that requires significant bankroll.',
            reverse: 'Double your bet after each win. Reset after a loss. Capitalizes on winning streaks.',
            custom: 'Create your own betting strategy with custom conditions and actions.'
        };
        
        elements.strategyInfoText.textContent = strategyInfo[strategy] || '';
    }

    function saveCustomCondition() {
        const condition = {
            type: elements.conditionType.value,
            value: parseInt(elements.conditionValue.value),
            action: elements.conditionAction.value,
            id: Date.now()
        };
        
        gameState.customConditions.push(condition);
        renderCustomConditions();
        elements.conditionModal.classList.remove('active');
    }

    function renderCustomConditions() {
        if (gameState.customConditions.length === 0) {
            elements.customConditionsList.innerHTML = '';
            return;
        }
        
        elements.customConditionsList.innerHTML = gameState.customConditions.map(condition => {
            const typeText = {
                loseStreak: `Lose ${condition.value} times in a row`,
                winStreak: `Win ${condition.value} times in a row`,
                totalLoss: `Total loss exceeds ${condition.value} ฿`,
                totalWin: `Total win exceeds ${condition.value} ฿`
            };
            
            const actionText = {
                stop: 'Stop betting',
                switchColor: 'Switch color',
                reset: 'Reset bet amount',
                double: 'Double bet amount'
            };
            
            return `
                <div class="condition-item">
                    <span class="condition-text">
                        If ${typeText[condition.type]} → ${actionText[condition.action]}
                    </span>
                    <div class="condition-actions">
                        <button class="condition-action-btn" onclick="deleteCondition(${condition.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                </div>
                </div>
            `;
        }).join('');
    }

    window.deleteCondition = function(id) {
        gameState.customConditions = gameState.customConditions.filter(c => c.id !== id);
        renderCustomConditions();
    };

    function checkCustomConditions() {
        if (gameState.selectedStrategy !== 'custom') return;
        
        for (const condition of gameState.customConditions) {
            let conditionMet = false;
            
            switch (condition.type) {
                case 'loseStreak':
                    conditionMet = gameState.currentStreak.type === 'lose' && 
                                   gameState.currentStreak.count >= condition.value;
                    break;
                case 'winStreak':
                    conditionMet = gameState.currentStreak.type === 'win' && 
                                   gameState.currentStreak.count >= condition.value;
                    break;
                case 'totalLoss':
                    conditionMet = gameState.sessionProfit <= -condition.value;
                    break;
                case 'totalWin':
                    conditionMet = gameState.sessionProfit >= condition.value;
                    break;
            }
            
            if (conditionMet) {
                executeConditionAction(condition.action);
            }
        }
    }

    function executeConditionAction(action) {
        switch (action) {
            case 'stop':
                stopAutoBet();
                showNotification('Custom condition met: Betting stopped', 'info');
                break;
            case 'switchColor':
                switchToNextColor();
                break;
            case 'reset':
                elements.autoBetAmount.value = 10;
                break;
            case 'double':
                elements.autoBetAmount.value = parseFloat(elements.autoBetAmount.value) * 2;
                break;
        }
    }

    function switchToNextColor() {
        const colors = ['gray', 'green', 'blue', 'purple'];
        const currentIndex = colors.indexOf(gameState.selectedColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        gameState.selectedColor = colors[nextIndex];
        gameState.autoBetSettings.selectedColor = colors[nextIndex];
    }

    // Demo Mode
    function initDemoMode() {
        elements.demoModeBtn.addEventListener('click', () => {
            gameState.isDemo = !gameState.isDemo;
            elements.demoModeBtn.classList.toggle('active');
            
            if (gameState.isDemo) {
                elements.demoModeBtn.innerHTML = '<i class="fas fa-flask"></i> Demo Mode: ON';
                showNotification('Demo mode enabled. Bets will not affect your balance.', 'info');
            } else {
                elements.demoModeBtn.innerHTML = '<i class="fas fa-flask"></i> Demo Mode';
            }
        });
    }

    // Sound Control
    function initSoundControl() {
        elements.soundToggle.addEventListener('click', () => {
            gameState.soundEnabled = !gameState.soundEnabled;
            elements.soundToggle.classList.toggle('muted');
            
            if (gameState.soundEnabled) {
                elements.soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                initAudio();
            } else {
                elements.soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
    }

    // Initialize Game
    function init() {
        drawWheel();
        initTabs();
        initManualBetting();
        initAutoBetting();
        initAdvancedStrategies();
        initDemoMode();
        initSoundControl();
        updateBalanceDisplay();
        updateStatistics();
    }

    // Start game when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
