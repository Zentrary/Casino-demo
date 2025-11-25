// Baccarat Game JavaScript
class BaccaratGame {
    constructor() {
        this.balance = 1000;
        this.betAmount = 10;
        this.currentBets = {
            player: 0,
            banker: 0,
            tie: 0,
            'player-pair': 0,
            'banker-pair': 0
        };
        this.gameState = 'waiting'; // waiting, betting, dealing, results
        this.gameHistory = [];
        this.autoBet = {
            active: false,
            amount: 10,
            numberOfBets: Infinity,
            stopOnWin: 0,
            stopOnLoss: 0,
            currentBet: 0,
            totalWon: 0,
            totalLost: 0
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.initializeDeck();
    }
    
    initializeElements() {
        // Balance and bet elements
        this.balanceElement = document.getElementById('balance');
        this.betAmountInput = document.getElementById('betAmount');
        this.autoBetAmountInput = document.getElementById('autoBetAmount');
        
        // Bet controls
        this.betUpBtn = document.getElementById('betUp');
        this.betDownBtn = document.getElementById('betDown');
        this.betHalfBtn = document.getElementById('betHalf');
        this.betDoubleBtn = document.getElementById('betDouble');
        
        this.autoBetUpBtn = document.getElementById('autoBetUp');
        this.autoBetDownBtn = document.getElementById('autoBetDown');
        this.autoBetHalfBtn = document.getElementById('autoBetHalf');
        this.autoBetDoubleBtn = document.getElementById('autoBetDouble');
        
        // Preset buttons
        this.presetButtons = document.querySelectorAll('.preset-btn');
        
        // Betting buttons
        this.bettingButtons = document.querySelectorAll('.bet-btn');
        this.bettingZones = document.querySelectorAll('.betting-zone');
        
        // Action buttons
        this.placeBetBtn = document.getElementById('placeBet');
        this.clearBetsBtn = document.getElementById('clearBets');
        this.dealCardsBtn = document.getElementById('dealCards');
        this.clearTableBtn = document.getElementById('clearTable');
        this.startAutoBetBtn = document.getElementById('startAutoBet');
        
        // Auto bet elements
        this.numberOfBetsInput = document.getElementById('numberOfBets');
        this.stopOnWinInput = document.getElementById('stopOnWin');
        this.stopOnLossInput = document.getElementById('stopOnLoss');
        
        // Card areas
        this.playerCardsContainer = document.getElementById('playerCards');
        this.bankerCardsContainer = document.getElementById('bankerCards');
        this.playerTotalElement = document.getElementById('playerTotal');
        this.bankerTotalElement = document.getElementById('bankerTotal');
        
        // Bet amount displays
        this.playerBetAmount = document.getElementById('playerBetAmount');
        this.bankerBetAmount = document.getElementById('bankerBetAmount');
        this.tieBetAmount = document.getElementById('tieBetAmount');
        this.playerPairBetAmount = document.getElementById('playerPairBetAmount');
        this.bankerPairBetAmount = document.getElementById('bankerPairBetAmount');
        
        // History
        this.historyList = document.getElementById('historyList');
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.playerResult = document.getElementById('playerResult');
        this.bankerResult = document.getElementById('bankerResult');
        this.closeModal = document.getElementById('closeModal');
        this.continueBtn = document.getElementById('continueBtn');
        
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
    }
    
    bindEvents() {
        // Bet amount controls
        this.betUpBtn.addEventListener('click', () => this.increaseBet());
        this.betDownBtn.addEventListener('click', () => this.decreaseBet());
        this.betHalfBtn.addEventListener('click', () => this.halveBet());
        this.betDoubleBtn.addEventListener('click', () => this.doubleBet());
        
        this.autoBetUpBtn.addEventListener('click', () => this.increaseAutoBet());
        this.autoBetDownBtn.addEventListener('click', () => this.decreaseAutoBet());
        this.autoBetHalfBtn.addEventListener('click', () => this.halveAutoBet());
        this.autoBetDoubleBtn.addEventListener('click', () => this.doubleAutoBet());
        
        // Preset buttons
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount || e.target.dataset.bets;
                if (e.target.dataset.amount) {
                    this.setBetAmount(parseInt(amount));
                } else if (e.target.dataset.bets) {
                    this.setNumberOfBets(amount);
                }
            });
        });
        
        // Betting buttons
        this.bettingButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const betType = e.target.closest('.bet-btn').dataset.bet;
                this.addBet(betType);
            });
        });
        
        // Betting zones
        this.bettingZones.forEach(zone => {
            zone.addEventListener('click', (e) => {
                const betType = zone.dataset.bet;
                this.addBet(betType);
            });
        });
        
        // Action buttons
        this.placeBetBtn.addEventListener('click', () => this.placeBet());
        this.clearBetsBtn.addEventListener('click', () => this.clearBets());
        this.dealCardsBtn.addEventListener('click', () => this.dealCards());
        this.clearTableBtn.addEventListener('click', () => this.clearTable());
        this.startAutoBetBtn.addEventListener('click', () => this.startAutoBet());
        
        // Input changes
        this.betAmountInput.addEventListener('change', () => this.updateBetAmount());
        this.autoBetAmountInput.addEventListener('change', () => this.updateAutoBetAmount());
        this.numberOfBetsInput.addEventListener('change', () => this.updateNumberOfBets());
        this.stopOnWinInput.addEventListener('change', () => this.updateStopOnWin());
        this.stopOnLossInput.addEventListener('change', () => this.updateStopOnLoss());
        
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
            if (e.code === 'Space' && this.gameState === 'waiting') {
                e.preventDefault();
                this.placeBet();
            }
        });
    }
    
    initializeDeck() {
        this.deck = [];
        const suits = ['C', 'D', 'H', 'S'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push({
                    suit: suit,
                    rank: rank,
                    value: this.getCardValue(rank)
                });
            }
        }
        
        this.shuffleDeck();
    }
    
    getCardValue(rank) {
        if (rank === 'A') return 1;
        if (['J', 'Q', 'K'].includes(rank)) return 0;
        return parseInt(rank);
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCard() {
        if (this.deck.length === 0) {
            this.initializeDeck();
        }
        return this.deck.pop();
    }
    
    getBaccaratValue(cards) {
        let total = 0;
        for (let card of cards) {
            total += card.value;
        }
        return total % 10;
    }
    
    addBet(betType) {
        if (this.gameState !== 'waiting') {
            this.showNotification('ไม่สามารถเดิมพันได้ในขณะนี้', 'error');
            return;
        }
        
        const totalBetAmount = Object.values(this.currentBets).reduce((sum, bet) => sum + bet, 0);
        if (totalBetAmount + this.betAmount > this.balance) {
            this.showNotification('ยอดเงินไม่เพียงพอ', 'error');
            return;
        }
        
        this.currentBets[betType] += this.betAmount;
        this.updateBetDisplay();
        this.updateBettingButtons();
    }
    
    clearBets() {
        this.currentBets = {
            player: 0,
            banker: 0,
            tie: 0,
            'player-pair': 0,
            'banker-pair': 0
        };
        this.updateBetDisplay();
        this.updateBettingButtons();
    }
    
    placeBet() {
        const totalBetAmount = Object.values(this.currentBets).reduce((sum, bet) => sum + bet, 0);
        
        if (totalBetAmount === 0) {
            this.showNotification('กรุณาเลือกเดิมพัน', 'error');
            return;
        }
        
        if (totalBetAmount > this.balance) {
            this.showNotification('ยอดเงินไม่เพียงพอ', 'error');
            return;
        }
        
        this.balance -= totalBetAmount;
        this.gameState = 'dealing';
        this.updateDisplay();
        this.updateBettingButtons();
        
        // Start dealing cards
        setTimeout(() => this.dealCards(), 1000);
    }
    
    dealCards() {
        this.gameState = 'dealing';
        this.dealCardsBtn.disabled = true;
        
        // Clear previous cards
        this.playerCardsContainer.innerHTML = '';
        this.bankerCardsContainer.innerHTML = '';
        
        this.playerCards = [];
        this.bankerCards = [];
        
        // Deal initial cards
        this.dealCardToPlayer();
        setTimeout(() => this.dealCardToBanker(), 500);
        setTimeout(() => this.dealCardToPlayer(), 1000);
        setTimeout(() => this.dealCardToBanker(), 1500);
        
        // Check for third card rules
        setTimeout(() => this.checkThirdCardRules(), 2000);
    }
    
    dealCardToPlayer() {
        const card = this.dealCard();
        this.playerCards.push(card);
        this.displayCard(this.playerCardsContainer, card, 'player');
        this.updatePlayerTotal();
    }
    
    dealCardToBanker() {
        const card = this.dealCard();
        this.bankerCards.push(card);
        this.displayCard(this.bankerCardsContainer, card, 'banker');
        this.updateBankerTotal();
    }
    
    displayCard(container, card, type) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        // Create card image
        const cardImage = document.createElement('img');
        const imagePath = `../../images/card/${card.rank}${card.suit}.png`;
        cardImage.src = imagePath;
        cardImage.alt = `${card.rank} of ${card.suit}`;
        cardImage.onerror = () => {
            // Fallback to text if image not found
            cardElement.textContent = `${card.rank}${card.suit}`;
        };
        
        cardElement.appendChild(cardImage);
        container.appendChild(cardElement);
        
        // Add animation
        cardElement.style.transform = 'scale(0)';
        cardElement.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            cardElement.style.transform = 'scale(1)';
        }, 100);
    }
    
    updatePlayerTotal() {
        const total = this.getBaccaratValue(this.playerCards);
        this.playerTotalElement.textContent = total;
    }
    
    updateBankerTotal() {
        const total = this.getBaccaratValue(this.bankerCards);
        this.bankerTotalElement.textContent = total;
    }
    
    checkThirdCardRules() {
        const playerTotal = this.getBaccaratValue(this.playerCards);
        const bankerTotal = this.getBaccaratValue(this.bankerCards);
        
        // Check if either hand has 8 or 9 (natural)
        if (playerTotal >= 8 || bankerTotal >= 8) {
            this.finishGame();
            return;
        }
        
        // Player third card rule
        let playerThirdCard = null;
        if (playerTotal <= 5) {
            playerThirdCard = this.dealCard();
            this.playerCards.push(playerThirdCard);
            setTimeout(() => {
                this.displayCard(this.playerCardsContainer, playerThirdCard, 'player');
                this.updatePlayerTotal();
            }, 500);
        }
        
        // Banker third card rule
        setTimeout(() => {
            const newPlayerTotal = this.getBaccaratValue(this.playerCards);
            let bankerThirdCard = null;
            
            if (bankerTotal <= 2) {
                bankerThirdCard = this.dealCard();
            } else if (bankerTotal === 3 && (!playerThirdCard || playerThirdCard.value !== 8)) {
                bankerThirdCard = this.dealCard();
            } else if (bankerTotal === 4 && playerThirdCard && [2, 3, 4, 5, 6, 7].includes(playerThirdCard.value)) {
                bankerThirdCard = this.dealCard();
            } else if (bankerTotal === 5 && playerThirdCard && [4, 5, 6, 7].includes(playerThirdCard.value)) {
                bankerThirdCard = this.dealCard();
            } else if (bankerTotal === 6 && playerThirdCard && [6, 7].includes(playerThirdCard.value)) {
                bankerThirdCard = this.dealCard();
            }
            
            if (bankerThirdCard) {
                this.bankerCards.push(bankerThirdCard);
                this.displayCard(this.bankerCardsContainer, bankerThirdCard, 'banker');
                this.updateBankerTotal();
            }
            
            setTimeout(() => this.finishGame(), 1000);
        }, 1000);
    }
    
    finishGame() {
        const playerTotal = this.getBaccaratValue(this.playerCards);
        const bankerTotal = this.getBaccaratValue(this.bankerCards);
        
        let winner = '';
        let winAmount = 0;
        
        if (playerTotal > bankerTotal) {
            winner = 'player';
        } else if (bankerTotal > playerTotal) {
            winner = 'banker';
        } else {
            winner = 'tie';
        }
        
        // Calculate winnings
        if (winner === 'player' && this.currentBets.player > 0) {
            winAmount += this.currentBets.player * 1.94;
        }
        if (winner === 'banker' && this.currentBets.banker > 0) {
            winAmount += this.currentBets.banker * 1.89;
        }
        if (winner === 'tie' && this.currentBets.tie > 0) {
            winAmount += this.currentBets.tie * 8.74;
        }
        
        // Check for pairs
        if (this.isPair(this.playerCards) && this.currentBets['player-pair'] > 0) {
            winAmount += this.currentBets['player-pair'] * 11.65;
        }
        if (this.isPair(this.bankerCards) && this.currentBets['banker-pair'] > 0) {
            winAmount += this.currentBets['banker-pair'] * 11.65;
        }
        
        this.balance += winAmount;
        this.gameState = 'results';
        
        // Add to history
        this.addToHistory(winner, playerTotal, bankerTotal, winAmount);
        
        // Show result modal
        this.showResult(winner, playerTotal, bankerTotal, winAmount);
        
        // Update display
        this.updateDisplay();
        this.updateBettingButtons();
        
        // Reset for next game
        setTimeout(() => {
            this.clearTable();
        }, 3000);
    }
    
    isPair(cards) {
        if (cards.length < 2) return false;
        return cards[0].rank === cards[1].rank;
    }
    
    showResult(winner, playerTotal, bankerTotal, winAmount) {
        this.modalTitle.textContent = winAmount > 0 ? '🎉 ชนะ!' : '😔 เสียใจ';
        this.resultIcon.textContent = winAmount > 0 ? '🎉' : '😔';
        this.resultMessage.textContent = winAmount > 0 ? 
            `คุณชนะ! ได้รับ ${Math.floor(winAmount)} บาท` : 
            'คุณไม่ชนะในรอบนี้';
        this.resultAmount.textContent = winAmount > 0 ? 
            `+${Math.floor(winAmount)} บาท` : 
            `เสีย ${Object.values(this.currentBets).reduce((sum, bet) => sum + bet, 0)} บาท`;
        this.resultAmount.style.color = winAmount > 0 ? '#4CAF50' : '#f44336';
        
        this.playerResult.textContent = playerTotal;
        this.bankerResult.textContent = bankerTotal;
        
        this.showModal();
    }
    
    clearTable() {
        this.playerCardsContainer.innerHTML = '';
        this.bankerCardsContainer.innerHTML = '';
        this.playerTotalElement.textContent = '0';
        this.bankerTotalElement.textContent = '0';
        this.clearBets();
        this.gameState = 'waiting';
        this.dealCardsBtn.disabled = false;
    }
    
    startAutoBet() {
        if (this.autoBet.active) {
            this.stopAutoBet();
            return;
        }
        
        const totalBetAmount = Object.values(this.currentBets).reduce((sum, bet) => sum + bet, 0);
        if (totalBetAmount === 0) {
            this.showNotification('กรุณาเลือกเดิมพันสำหรับ Auto Bet', 'error');
            return;
        }
        
        this.autoBet.active = true;
        this.autoBet.amount = parseInt(this.autoBetAmountInput.value) || 10;
        this.autoBet.numberOfBets = this.numberOfBetsInput.value === '∞' ? Infinity : parseInt(this.numberOfBetsInput.value) || 10;
        this.autoBet.stopOnWin = parseInt(this.stopOnWinInput.value) || 0;
        this.autoBet.stopOnLoss = parseInt(this.stopOnLossInput.value) || 0;
        this.autoBet.currentBet = 0;
        this.autoBet.totalWon = 0;
        this.autoBet.totalLost = 0;
        
        this.startAutoBetBtn.textContent = 'Stop Auto Bet';
        this.startAutoBetBtn.style.background = '#f44336';
        
        this.executeAutoBet();
    }
    
    stopAutoBet() {
        this.autoBet.active = false;
        this.startAutoBetBtn.textContent = 'Start Auto Bet';
        this.startAutoBetBtn.style.background = 'linear-gradient(45deg, #d4af37, #f4d03f)';
    }
    
    executeAutoBet() {
        if (!this.autoBet.active) return;
        
        if (this.autoBet.currentBet >= this.autoBet.numberOfBets) {
            this.stopAutoBet();
            this.showNotification('Auto Bet ครบจำนวนที่กำหนดแล้ว', 'info');
            return;
        }
        
        if (this.autoBet.stopOnWin > 0 && this.autoBet.totalWon >= this.autoBet.stopOnWin) {
            this.stopAutoBet();
            this.showNotification('Auto Bet หยุดตามเงื่อนไข Stop on Win', 'info');
            return;
        }
        
        if (this.autoBet.stopOnLoss > 0 && this.autoBet.totalLost >= this.autoBet.stopOnLoss) {
            this.stopAutoBet();
            this.showNotification('Auto Bet หยุดตามเงื่อนไข Stop on Loss', 'info');
            return;
        }
        
        if (this.balance < this.autoBet.amount) {
            this.stopAutoBet();
            this.showNotification('ยอดเงินไม่เพียงพอสำหรับ Auto Bet', 'error');
            return;
        }
        
        // Set bet amount and place bet
        this.betAmount = this.autoBet.amount;
        this.betAmountInput.value = this.betAmount;
        this.placeBet();
        
        this.autoBet.currentBet++;
    }
    
    addToHistory(winner, playerTotal, bankerTotal, winAmount) {
        const historyItem = {
            timestamp: new Date(),
            winner: winner,
            playerTotal: playerTotal,
            bankerTotal: bankerTotal,
            winAmount: winAmount,
            bets: { ...this.currentBets }
        };
        
        this.gameHistory.unshift(historyItem);
        
        // Keep only last 20 items
        if (this.gameHistory.length > 20) {
            this.gameHistory = this.gameHistory.slice(0, 20);
        }
        
        this.updateHistoryDisplay();
        
        // Update auto bet totals
        if (this.autoBet.active) {
            if (winAmount > 0) {
                this.autoBet.totalWon += winAmount;
            } else {
                this.autoBet.totalLost += Object.values(this.currentBets).reduce((sum, bet) => sum + bet, 0);
            }
        }
    }
    
    updateHistoryDisplay() {
        if (this.gameHistory.length === 0) {
            this.historyList.innerHTML = '<p>ยังไม่มีประวัติการเล่น</p>';
            return;
        }
        
        this.historyList.innerHTML = this.gameHistory.map(item => {
            const timeStr = item.timestamp.toLocaleTimeString('th-TH');
            const isWin = item.winAmount > 0;
            const winnerText = item.winner === 'player' ? 'Player' : 
                              item.winner === 'banker' ? 'Banker' : 'Tie';
            
            return `
                <div class="history-item ${isWin ? 'win' : 'lose'}">
                    <div>
                        <div class="history-time">${timeStr}</div>
                        <div class="history-result">${winnerText} (${item.playerTotal}-${item.bankerTotal})</div>
                    </div>
                    <div class="history-amount ${isWin ? 'win' : 'lose'}">
                        ${isWin ? '+' : '-'}${isWin ? Math.floor(item.winAmount) : Object.values(item.bets).reduce((sum, bet) => sum + bet, 0)} บาท
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateBetDisplay() {
        this.playerBetAmount.textContent = this.currentBets.player;
        this.bankerBetAmount.textContent = this.currentBets.banker;
        this.tieBetAmount.textContent = this.currentBets.tie;
        this.playerPairBetAmount.textContent = this.currentBets['player-pair'];
        this.bankerPairBetAmount.textContent = this.currentBets['banker-pair'];
    }
    
    updateBettingButtons() {
        this.bettingButtons.forEach(btn => {
            const betType = btn.dataset.bet;
            if (this.currentBets[betType] > 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.bettingZones.forEach(zone => {
            const betType = zone.dataset.bet;
            if (this.currentBets[betType] > 0) {
                zone.classList.add('active');
            } else {
                zone.classList.remove('active');
            }
        });
    }
    
    updateDisplay() {
        this.balanceElement.textContent = Math.floor(this.balance);
        this.betAmountInput.value = this.betAmount;
        this.autoBetAmountInput.value = this.autoBet.amount;
    }
    
    // Bet amount controls
    increaseBet() {
        if (this.betAmount < 1000) {
            this.betAmount = Math.min(1000, this.betAmount + 10);
            this.betAmountInput.value = this.betAmount;
        }
    }
    
    decreaseBet() {
        if (this.betAmount > 1) {
            this.betAmount = Math.max(1, this.betAmount - 10);
            this.betAmountInput.value = this.betAmount;
        }
    }
    
    halveBet() {
        this.betAmount = Math.max(1, Math.floor(this.betAmount / 2));
        this.betAmountInput.value = this.betAmount;
    }
    
    doubleBet() {
        this.betAmount = Math.min(1000, this.betAmount * 2);
        this.betAmountInput.value = this.betAmount;
    }
    
    increaseAutoBet() {
        if (this.autoBet.amount < 1000) {
            this.autoBet.amount = Math.min(1000, this.autoBet.amount + 10);
            this.autoBetAmountInput.value = this.autoBet.amount;
        }
    }
    
    decreaseAutoBet() {
        if (this.autoBet.amount > 1) {
            this.autoBet.amount = Math.max(1, this.autoBet.amount - 10);
            this.autoBetAmountInput.value = this.autoBet.amount;
        }
    }
    
    halveAutoBet() {
        this.autoBet.amount = Math.max(1, Math.floor(this.autoBet.amount / 2));
        this.autoBetAmountInput.value = this.autoBet.amount;
    }
    
    doubleAutoBet() {
        this.autoBet.amount = Math.min(1000, this.autoBet.amount * 2);
        this.autoBetAmountInput.value = this.autoBet.amount;
    }
    
    setBetAmount(amount) {
        this.betAmount = Math.max(1, Math.min(1000, amount));
        this.betAmountInput.value = this.betAmount;
    }
    
    setNumberOfBets(bets) {
        this.numberOfBetsInput.value = bets;
    }
    
    updateBetAmount() {
        this.betAmount = Math.max(1, Math.min(1000, parseInt(this.betAmountInput.value) || 1));
        this.betAmountInput.value = this.betAmount;
    }
    
    updateAutoBetAmount() {
        this.autoBet.amount = Math.max(1, Math.min(1000, parseInt(this.autoBetAmountInput.value) || 1));
        this.autoBetAmountInput.value = this.autoBet.amount;
    }
    
    updateNumberOfBets() {
        const value = this.numberOfBetsInput.value;
        if (value !== '∞') {
            this.autoBet.numberOfBets = Math.max(1, parseInt(value) || 1);
        } else {
            this.autoBet.numberOfBets = Infinity;
        }
    }
    
    updateStopOnWin() {
        this.autoBet.stopOnWin = Math.max(0, parseInt(this.stopOnWinInput.value) || 0);
    }
    
    updateStopOnLoss() {
        this.autoBet.stopOnLoss = Math.max(0, parseInt(this.stopOnLossInput.value) || 0);
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
    
    showModal() {
        this.gameResultModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    hideModal() {
        this.gameResultModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Continue auto bet if active
        if (this.autoBet.active) {
            setTimeout(() => this.executeAutoBet(), 1000);
        }
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
    // Check if we're on the baccarat game page
    if (document.getElementById('dealCards')) {
        new BaccaratGame();
        console.log('Baccarat game loaded successfully! 🃏✨');
    }
});
