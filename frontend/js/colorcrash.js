// Color Crash Game Logic with Rolling Animation
class ColorCrashGame {
  constructor() {
    this.balance = 1000;
    this.betAmount = 10;
    this.selectedSymbolKey = null;
    this.selectedMultiplier = 0;
    this.isRolling = false;
    this.gameHistory = [];
    this.previousRolls = [];
    this.autoBetActive = false;
    this.autoBetSettings = {
      amount: 10,
      symbolKey: null,
      multiplier: 0,
      numberOfBets: Infinity,
      betsPlaced: 0,
      totalProfit: 0,
      onWinAction: 'reset',
      onWinPercent: 10,
      onLossAction: 'reset',
      onLossPercent: 10,
      stopOnWin: 0,
      stopOnLoss: 0,
      wins: 0,
      losses: 0
    };

    // Symbols: five items with specified percentages
    this.symbols = [
      { key: 'x0', label: 'x0', image: '../../images/game images/colorcrash game images/x0.png', multiplier: 0, weight: 45 },  // 45%
      { key: 'x1', label: 'x1', image: '../../images/game images/colorcrash game images/x1.png', multiplier: 1.25, weight: 35 },  // 35%
      { key: 'x2', label: 'x2', image: '../../images/game images/colorcrash game images/x2.png', multiplier: 2, weight: 15 },  // 15%
      { key: 'x4', label: 'x4', image: '../../images/game images/colorcrash game images/x4.png', multiplier: 4, weight: 3 },   // 3%
      { key: 'x14', label: 'x14', image: '../../images/game images/colorcrash game images/x14.png', multiplier: 14, weight: 2 }   // 2%
    ];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateBalance();
    this.updateProfitDisplay();
    this.loadGameHistory();
    this.initializeRollingTrack();
  }

  initializeRollingTrack() {
    const rollingTrack = document.getElementById('rollingTrack');
    rollingTrack.innerHTML = '';

    // Create initial tiles for display
    for (let i = 0; i < 20; i++) {
      const tile = this.createRollingTile();
      rollingTrack.appendChild(tile);
    }
  }

  createRollingTile(symbol = null) {
    const tile = document.createElement('div');
    tile.className = 'rolling-tile';

    const content = document.createElement('div');
    content.className = 'tile-content';

    const s = symbol || this.getRandomSymbol();
    const img = document.createElement('img');
    img.src = s.image;
    img.alt = s.label;
    content.appendChild(img);
    tile.dataset.symbol = s.key;

    // Add symbol class for background color
    tile.classList.add(`symbol-${s.key}`);

    tile.appendChild(content);
    return tile;
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Manual betting controls
    this.setupManualBettingControls();

    // Auto betting controls
    this.setupAutoBettingControls();

    // Symbol selection
    this.setupSymbolSelection();

    // Advanced settings
    this.setupAdvancedSettings();

    // Modal controls
    this.setupModalControls();
  }

  setupManualBettingControls() {
    const betAmountInput = document.getElementById('betAmount');
    const betHalfBtn = document.getElementById('betHalf');
    const betDoubleBtn = document.getElementById('betDouble');
    const betUpBtn = document.getElementById('betUp');
    const betDownBtn = document.getElementById('betDown');
    const presetBtns = document.querySelectorAll('.preset-btn[data-amount]');
    const placeBetBtn = document.getElementById('placeBet');

    betAmountInput.addEventListener('input', (e) => {
      this.betAmount = Math.max(1, Math.min(1000, parseInt(e.target.value) || 1));
      this.updateProfitDisplay();
    });

    betHalfBtn.addEventListener('click', () => {
      this.betAmount = Math.max(1, Math.floor(this.betAmount / 2));
      betAmountInput.value = this.betAmount;
      this.updateProfitDisplay();
    });

    betDoubleBtn.addEventListener('click', () => {
      this.betAmount = Math.min(1000, this.betAmount * 2);
      betAmountInput.value = this.betAmount;
      this.updateProfitDisplay();
    });

    betUpBtn.addEventListener('click', () => {
      this.betAmount = Math.min(1000, this.betAmount + 1);
      betAmountInput.value = this.betAmount;
      this.updateProfitDisplay();
    });

    betDownBtn.addEventListener('click', () => {
      this.betAmount = Math.max(1, this.betAmount - 1);
      betAmountInput.value = this.betAmount;
      this.updateProfitDisplay();
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.betAmount = parseInt(btn.dataset.amount);
        betAmountInput.value = this.betAmount;
        this.updateProfitDisplay();
      });
    });

    placeBetBtn.addEventListener('click', () => this.placeBet());
  }

  setupAutoBettingControls() {
    const autoBetAmountInput = document.getElementById('autoBetAmount');
    const autoBetHalfBtn = document.getElementById('autoBetHalf');
    const autoBetDoubleBtn = document.getElementById('autoBetDouble');
    const autoBetUpBtn = document.getElementById('autoBetUp');
    const autoBetDownBtn = document.getElementById('autoBetDown');
    const autoPresetBtns = document.querySelectorAll('#auto .preset-btn[data-amount]');
    const startAutoBetBtn = document.getElementById('startAutoBet');
    const stopAutoBetBtn = document.getElementById('stopAutoBet');
    const numberOfBetsInput = document.getElementById('numberOfBets');
    const presetBetsBtns = document.querySelectorAll('.preset-btn[data-bets]');

    autoBetAmountInput.addEventListener('input', (e) => {
      this.autoBetSettings.amount = Math.max(1, Math.min(1000, parseInt(e.target.value) || 1));
    });

    autoBetHalfBtn.addEventListener('click', () => {
      this.autoBetSettings.amount = Math.max(1, Math.floor(this.autoBetSettings.amount / 2));
      autoBetAmountInput.value = this.autoBetSettings.amount;
    });

    autoBetDoubleBtn.addEventListener('click', () => {
      this.autoBetSettings.amount = Math.min(1000, this.autoBetSettings.amount * 2);
      autoBetAmountInput.value = this.autoBetSettings.amount;
    });

    autoBetUpBtn.addEventListener('click', () => {
      this.autoBetSettings.amount = Math.min(1000, this.autoBetSettings.amount + 1);
      autoBetAmountInput.value = this.autoBetSettings.amount;
    });

    autoBetDownBtn.addEventListener('click', () => {
      this.autoBetSettings.amount = Math.max(1, this.autoBetSettings.amount - 1);
      autoBetAmountInput.value = this.autoBetSettings.amount;
    });

    autoPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.autoBetSettings.amount = parseInt(btn.dataset.amount);
        autoBetAmountInput.value = this.autoBetSettings.amount;
      });
    });

    numberOfBetsInput.addEventListener('input', (e) => {
      const value = e.target.value;
      this.autoBetSettings.numberOfBets = value === '∞' ? Infinity : parseInt(value) || Infinity;
    });

    presetBetsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.bets;
        this.autoBetSettings.numberOfBets = value === '∞' ? Infinity : parseInt(value);
        numberOfBetsInput.value = value;
      });
    });

    startAutoBetBtn.addEventListener('click', () => this.startAutoBet());
    stopAutoBetBtn.addEventListener('click', () => this.stopAutoBet());
  }

  setupSymbolSelection() {
    const symbolBtns = document.querySelectorAll('.symbol-btn');
    symbolBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.dataset.symbol;
        const multiplier = parseInt(e.currentTarget.dataset.multiplier);

        symbolBtns.forEach(b => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');

        this.selectedSymbolKey = key;
        this.selectedMultiplier = multiplier;
        this.updateProfitDisplay();
      });
    });
  }

  setupAdvancedSettings() {
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedPanel = document.getElementById('advancedPanel');
    const onWinAction = document.getElementById('onWinAction');
    const onWinPercent = document.getElementById('onWinPercent');
    const onLossAction = document.getElementById('onLossAction');
    const onLossPercent = document.getElementById('onLossPercent');
    const stopOnWin = document.getElementById('stopOnWin');
    const stopOnLoss = document.getElementById('stopOnLoss');

    advancedToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        advancedPanel.classList.add('active');
      } else {
        advancedPanel.classList.remove('active');
      }
    });

    onWinAction.addEventListener('change', (e) => {
      this.autoBetSettings.onWinAction = e.target.value;
    });

    onWinPercent.addEventListener('input', (e) => {
      this.autoBetSettings.onWinPercent = parseInt(e.target.value) || 10;
    });

    onLossAction.addEventListener('change', (e) => {
      this.autoBetSettings.onLossAction = e.target.value;
    });

    onLossPercent.addEventListener('input', (e) => {
      this.autoBetSettings.onLossPercent = parseInt(e.target.value) || 10;
    });

    stopOnWin.addEventListener('input', (e) => {
      this.autoBetSettings.stopOnWin = parseInt(e.target.value) || 0;
    });

    stopOnLoss.addEventListener('input', (e) => {
      this.autoBetSettings.stopOnLoss = parseInt(e.target.value) || 0;
    });
  }

  setupModalControls() {
    const modal = document.getElementById('gameResultModal');
    const closeModal = document.getElementById('closeModal');
    const continueBtn = document.getElementById('continueBtn');

    closeModal.addEventListener('click', () => this.closeModal());
    continueBtn.addEventListener('click', () => this.closeModal());

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  switchTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
  }

  placeBet() {
    if (this.isRolling) return;

    if (!this.selectedSymbolKey) {
      this.showNotification('กรุณาเลือกสัญลักษณ์ก่อนวางเดิมพัน', 'error');
      return;
    }

    if (this.betAmount > this.balance) {
      this.showNotification('ยอดเงินไม่เพียงพอ', 'error');
      return;
    }

    if (this.betAmount < 1) {
      this.showNotification('จำนวนเงินเดิมพันต้องมากกว่า 0', 'error');
      return;
    }

    this.balance -= this.betAmount;
    this.updateBalance();
    this.roll();
  }

  startAutoBet() {
    if (this.isRolling) return;

    if (!this.selectedSymbolKey) {
      this.showNotification('กรุณาเลือกสัญลักษณ์ก่อนเริ่ม Auto Bet', 'error');
      return;
    }

    if (this.autoBetSettings.amount > this.balance) {
      this.showNotification('ยอดเงินไม่เพียงพอสำหรับ Auto Bet', 'error');
      return;
    }

    this.autoBetActive = true;
    this.autoBetSettings.symbolKey = this.selectedSymbolKey;
    this.autoBetSettings.multiplier = this.selectedMultiplier;
    this.autoBetSettings.betsPlaced = 0;
    this.autoBetSettings.totalProfit = 0;
    this.autoBetSettings.wins = 0;
    this.autoBetSettings.losses = 0;

    document.getElementById('startAutoBet').disabled = true;
    document.getElementById('stopAutoBet').disabled = false;

    this.updateAutoBetStatus();
    this.showNotification('Auto Bet เริ่มทำงาน', 'success');

    // Start first auto bet
    this.autoBet();
  }

  stopAutoBet() {
    this.autoBetActive = false;
    document.getElementById('startAutoBet').disabled = false;
    document.getElementById('stopAutoBet').disabled = true;
    this.showNotification('Auto Bet หยุดทำงาน', 'info');
  }

  autoBet() {
    if (!this.autoBetActive) return;

    // Check if we should stop
    if (this.autoBetSettings.numberOfBets !== Infinity &&
      this.autoBetSettings.betsPlaced >= this.autoBetSettings.numberOfBets) {
      this.stopAutoBet();
      return;
    }

    if (this.autoBetSettings.stopOnWin > 0 &&
      this.autoBetSettings.wins >= this.autoBetSettings.stopOnWin) {
      this.stopAutoBet();
      return;
    }

    if (this.autoBetSettings.stopOnLoss > 0 &&
      this.autoBetSettings.losses >= this.autoBetSettings.stopOnLoss) {
      this.stopAutoBet();
      return;
    }

    if (this.autoBetSettings.amount > this.balance) {
      this.showNotification('ยอดเงินไม่เพียงพอสำหรับ Auto Bet', 'error');
      this.stopAutoBet();
      return;
    }

    this.balance -= this.autoBetSettings.amount;
    this.updateBalance();
    this.autoBetSettings.betsPlaced++;
    this.updateAutoBetStatus();

    this.roll(true);
  }

  roll(isAutoBet = false) {
    if (this.isRolling) return;

    this.isRolling = true;
    this.updateGameStatus('กำลัง Roll...');

    // Ensure rolling display is visible (result handled by modal)
    const rolling = document.querySelector('.rolling-display');
    if (rolling) rolling.style.display = 'block';

    // Start rolling animation
    this.startRollingAnimation();

    // Set countdown
    const rollDuration = 3000 + Math.random() * 2000; // 3-5 seconds
    this.startCountdown(rollDuration);

    // Finish roll after duration
    setTimeout(() => {
      this.finishRoll(isAutoBet);
    }, rollDuration);
  }

  startRollingAnimation() {
    const rollingTrack = document.getElementById('rollingTrack');

    // Clear existing tiles
    rollingTrack.innerHTML = '';

    // Create rolling tiles
    for (let i = 0; i < 30; i++) {
      const tile = this.createRollingTile();
      rollingTrack.appendChild(tile);
    }

    // Start smooth rolling animation with requestAnimationFrame
    this.rollingPosition = 0;
    this.rollingSpeed = 1;
    this.rollingAcceleration = 0.005;
    this.rollingMaxSpeed = 8;
    this.rollingStartTime = Date.now();
    this.rollingDuration = 3000 + Math.random() * 2000; // 3-5 seconds

    this.animateRolling();
  }

  animateRolling() {
    if (!this.isRolling) return;

    const rollingTrack = document.getElementById('rollingTrack');
    const currentTime = Date.now();
    const elapsed = currentTime - this.rollingStartTime;

    // Check if we should start decelerating (last 1 second)
    const timeUntilStop = this.rollingDuration - elapsed;

    if (timeUntilStop <= 1000) {
      // Start deceleration in the last 1 second
      const decelerationFactor = timeUntilStop / 1000; // 1.0 to 0.0
      this.rollingSpeed = this.rollingMaxSpeed * decelerationFactor * decelerationFactor; // Quadratic deceleration
    } else {
      // Gradually increase speed until max
      this.rollingSpeed = Math.min(this.rollingSpeed + this.rollingAcceleration, this.rollingMaxSpeed);
    }

    // Ensure minimum speed for smooth movement
    this.rollingSpeed = Math.max(this.rollingSpeed, 0.1);

    // Update position
    this.rollingPosition -= this.rollingSpeed;
    rollingTrack.style.transform = `translateX(${this.rollingPosition}px)`;

    // Add new tiles at the end (less frequently during deceleration)
    if (Math.random() < (timeUntilStop <= 1000 ? 0.1 : 0.4)) {
      const newTile = this.createRollingTile();
      rollingTrack.appendChild(newTile);
    }

    // Remove tiles that are off screen
    const tiles = rollingTrack.querySelectorAll('.rolling-tile');
    if (tiles.length > 50) {
      tiles[0].remove();
    }

    // Continue animation
    requestAnimationFrame(() => this.animateRolling());
  }

  startCountdown(duration) {
    const countdownTime = document.getElementById('countdownTime');
    let remaining = duration / 1000;

    const countdownInterval = setInterval(() => {
      remaining -= 0.1;
      countdownTime.textContent = remaining.toFixed(1) + 's';

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        countdownTime.textContent = '0.0s';
      }
    }, 100);

    this.countdownInterval = countdownInterval;
  }

  finishRoll(isAutoBet = false) {
    // Stop rolling animation
    this.isRolling = false;
    if (this.rollInterval) {
      clearInterval(this.rollInterval);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Generate final result
    const resultSymbol = this.getRandomSymbol();

    // Smoothly position the result indicator at the center
    const rollingTrack = document.getElementById('rollingTrack');
    const centerPosition = -rollingTrack.offsetWidth / 2 + 40; // Center the indicator

    // Smooth transition to center position
    rollingTrack.style.transition = 'transform 0.5s ease-out';
    rollingTrack.style.transform = `translateX(${centerPosition}px)`;

    // Highlight the center tile after transition
    setTimeout(() => {
      const tiles = rollingTrack.querySelectorAll('.rolling-tile');
      const centerTile = tiles[Math.floor(tiles.length / 2)];
      if (centerTile) {
        centerTile.classList.add('highlighted');

        // Update center tile to show result
        const content = centerTile.querySelector('.tile-content');
        content.innerHTML = '';
        const img = document.createElement('img');
        img.src = resultSymbol.image;
        img.alt = resultSymbol.label;
        content.appendChild(img);
        centerTile.dataset.symbol = resultSymbol.key;

        // Update tile class for background color
        centerTile.className = `rolling-tile symbol-${resultSymbol.key} highlighted`;
      }
    }, 500);

    // Check result
    const isWin = this.checkWin(resultSymbol, isAutoBet);
    const profit = isWin ? this.calculateProfit(isAutoBet) : 0;

    if (isWin) {
      this.balance += profit;
      this.updateBalance();

      if (isAutoBet) {
        this.autoBetSettings.totalProfit += profit;
        this.autoBetSettings.wins++;
      }
    } else {
      if (isAutoBet) {
        this.autoBetSettings.totalProfit -= this.autoBetSettings.amount;
        this.autoBetSettings.losses++;
      }
    }

    // Add to history
    this.addToHistory(resultSymbol.label, resultSymbol.key, isWin, profit, isAutoBet);
    this.addToPreviousRolls(resultSymbol.label, resultSymbol.key);

    // Show result
    this.showResult(resultSymbol, isWin, profit);

    // Update auto bet status
    if (isAutoBet) {
      this.updateAutoBetStatus();
    }

    this.isRolling = false;
    this.updateGameStatus('เลือกสัญลักษณ์และวางเดิมพัน');

    // Continue auto bet if active
    if (this.autoBetActive && isAutoBet) {
      setTimeout(() => this.autoBet(), 2000);
    }
  }

  getRandomSymbol() {
    const totalWeight = this.symbols.reduce((sum, s) => sum + s.weight, 0);
    let r = Math.random() * totalWeight;
    for (const s of this.symbols) {
      if (r < s.weight) return s;
      r -= s.weight;
    }
    return this.symbols[this.symbols.length - 1];
  }

  checkWin(resultSymbol, isAutoBet = false) {
    if (isAutoBet) {
      return resultSymbol.key === this.autoBetSettings.symbolKey;
    }
    return resultSymbol.key === this.selectedSymbolKey;
  }

  calculateProfit(isAutoBet = false) {
    const amount = isAutoBet ? this.autoBetSettings.amount : this.betAmount;
    const multiplier = isAutoBet ? this.autoBetSettings.multiplier : this.selectedMultiplier;
    return amount * multiplier;
  }

  showResult(resultSymbol, isWin, profit) {
    // Keep rolling display visible; show modal with result
    this.showResultModal(resultSymbol, isWin, profit);
  }

  showResultModal(resultSymbol, isWin, profit) {
    const modal = document.getElementById('gameResultModal');
    const resultIcon = document.getElementById('resultIcon');
    const resultMessage = document.getElementById('resultMessage');
    const resultAmount = document.getElementById('resultAmount');
    const resultNumber = document.getElementById('resultNumber');
    const resultColorValue = document.getElementById('resultColorValue');
    const profitResult = document.getElementById('profitResult');

    // Update modal content
    resultIcon.textContent = isWin ? '🎉' : '💔';
    resultMessage.textContent = isWin ? 'คุณชนะ!' : 'คุณแพ้';
    resultAmount.textContent = isWin ? `+${profit.toFixed(2)} บาท` : `-${this.betAmount} บาท`;
    resultNumber.textContent = resultSymbol.multiplier + 'x';
    resultColorValue.textContent = resultSymbol.label;
    profitResult.textContent = isWin ? `+${profit.toFixed(2)} บาท` : `-${this.betAmount} บาท`;

    // Add animation classes
    if (isWin) {
      resultIcon.classList.add('win-animation');
      this.createParticles('win');
    } else {
      resultIcon.classList.add('lose-animation');
      this.createParticles('lose');
    }

    // Show modal
    modal.classList.add('active');

    // Remove animation classes after animation
    setTimeout(() => {
      resultIcon.classList.remove('win-animation', 'lose-animation');
    }, 600);
  }

  createParticles(type) {
    const gameDisplay = document.querySelector('.game-display');
    const particleCount = 10;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = `particle ${type}`;
      particle.textContent = type === 'win' ? '✨' : '💥';
      particle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                font-size: 1.5rem;
                pointer-events: none;
                z-index: 1000;
            `;

      gameDisplay.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000);
    }
  }

  addToHistory(label, symbolKey, isWin, profit, isAutoBet) {
    const historyItem = {
      label,
      symbolKey,
      isWin,
      profit,
      isAutoBet,
      timestamp: new Date()
    };

    this.gameHistory.unshift(historyItem);

    // Keep only last 50 items
    if (this.gameHistory.length > 50) {
      this.gameHistory = this.gameHistory.slice(0, 50);
    }

    this.updateHistoryDisplay();
  }

  addToPreviousRolls(label, symbolKey) {
    const rollItem = {
      label,
      symbolKey,
      timestamp: new Date()
    };

    this.previousRolls.unshift(rollItem);

    // Keep only last 20 items
    if (this.previousRolls.length > 20) {
      this.previousRolls = this.previousRolls.slice(0, 20);
    }

    this.updatePreviousRollsDisplay();
  }

  updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    this.gameHistory.slice(0, 10).forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = `history-item ${item.isWin ? 'win' : 'loss'}`;

      historyItem.innerHTML = `
                <div class="history-number">${item.label}</div>
                <div class="history-color">
                    <div class="history-color-circle ${item.symbolKey}"></div>
                    <span class="history-color-text">${item.label}</span>
                </div>
                <div class="history-result ${item.isWin ? 'win' : 'loss'}">
                    ${item.isWin ? `+${item.profit.toFixed(2)}` : `-${item.isAutoBet ? this.autoBetSettings.amount : this.betAmount}`}
                </div>
            `;

      historyList.appendChild(historyItem);
    });
  }

  updatePreviousRollsDisplay() {
    const rollsList = document.getElementById('rollsList');
    rollsList.innerHTML = '';

    this.previousRolls.slice(0, 20).forEach(item => {
      const rollItem = document.createElement('div');
      rollItem.className = 'roll-item';

      rollItem.innerHTML = `
                <div class="roll-number">${item.label}</div>
                <div class="roll-color-circle ${item.symbolKey}"></div>
            `;

      rollsList.appendChild(rollItem);
    });
  }

  updateAutoBetStatus() {
    document.getElementById('betsPlaced').textContent = this.autoBetSettings.betsPlaced;
    document.getElementById('betsRemaining').textContent =
      this.autoBetSettings.numberOfBets === Infinity ? '∞' :
        Math.max(0, this.autoBetSettings.numberOfBets - this.autoBetSettings.betsPlaced);
    document.getElementById('totalProfit').textContent =
      this.autoBetSettings.totalProfit >= 0 ?
        `+${this.autoBetSettings.totalProfit.toFixed(2)}` :
        this.autoBetSettings.totalProfit.toFixed(2);
  }

  closeModal() {
    const modal = document.getElementById('gameResultModal');
    modal.classList.remove('active');
  }

  updateBalance() {
    document.getElementById('balance').textContent = this.balance.toFixed(2);
  }

  updateProfitDisplay() {
    if (!this.selectedSymbolKey || !this.selectedMultiplier) {
      document.getElementById('profitAmount').textContent = '0.00';
      return;
    }

    const profit = this.betAmount * this.selectedMultiplier;
    document.getElementById('profitAmount').textContent = profit.toFixed(2);
  }

  updateGameStatus(status) {
    document.getElementById('gameStatus').textContent = status;
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

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  loadGameHistory() {
    // Load from localStorage if available
    const savedHistory = localStorage.getItem('colorcrash-history');
    if (savedHistory) {
      this.gameHistory = JSON.parse(savedHistory);
      this.updateHistoryDisplay();
    }

    const savedRolls = localStorage.getItem('colorcrash-rolls');
    if (savedRolls) {
      this.previousRolls = JSON.parse(savedRolls);
      this.updatePreviousRollsDisplay();
    }

    const savedBalance = localStorage.getItem('colorcrash-balance');
    if (savedBalance) {
      this.balance = parseFloat(savedBalance);
      this.updateBalance();
    }
  }

  saveGameHistory() {
    localStorage.setItem('colorcrash-history', JSON.stringify(this.gameHistory));
    localStorage.setItem('colorcrash-rolls', JSON.stringify(this.previousRolls));
    localStorage.setItem('colorcrash-balance', this.balance.toString());
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.colorCrashGame = new ColorCrashGame();

  // Save game state periodically
  setInterval(() => {
    if (window.colorCrashGame) {
      window.colorCrashGame.saveGameHistory();
    }
  }, 5000);

  // Save game state when page is unloaded
  window.addEventListener('beforeunload', () => {
    if (window.colorCrashGame) {
      window.colorCrashGame.saveGameHistory();
    }
  });
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .notification-content i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(notificationStyles);

console.log('Color Crash Game with Rolling Animation loaded successfully! 🎯✨');
