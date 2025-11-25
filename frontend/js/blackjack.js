// Blackjack Game JavaScript
class BlackjackGame {
    constructor() {
        this.balance = 1000;
        this.betAmount = 10;
        this.currentBet = 0;
        this.gameState = 'waiting'; // waiting, betting, playing, dealer, results
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
        
        this.playerCards = [];
        this.dealerCards = [];
        this.playerTotal = 0;
        this.dealerTotal = 0;
        this.insuranceBet = 0;
        this.canDouble = true;
        this.canSplit = false;
        
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
        
        // Action buttons
        this.placeBetBtn = document.getElementById('placeBet');
        this.clearBetsBtn = document.getElementById('clearBets');
        this.startAutoBetBtn = document.getElementById('startAutoBet');
        
        // Auto bet elements
        this.numberOfBetsInput = document.getElementById('numberOfBets');
        this.stopOnWinInput = document.getElementById('stopOnWin');
        this.stopOnLossInput = document.getElementById('stopOnLoss');
        
        // Card areas
        this.playerCardsContainer = document.getElementById('playerCards');
        this.dealerCardsContainer = document.getElementById('dealerCards');
        this.playerTotalElement = document.getElementById('playerTotal');
        this.dealerTotalElement = document.getElementById('dealerTotal');
        
        // Game controls
        this.hitBtn = document.getElementById('hitBtn');
        this.standBtn = document.getElementById('standBtn');
        this.doubleBtn = document.getElementById('doubleBtn');
        this.splitBtn = document.getElementById('splitBtn');
        
        // Insurance elements
        this.insuranceSection = document.getElementById('insuranceSection');
        this.acceptInsuranceBtn = document.getElementById('acceptInsurance');
        this.declineInsuranceBtn = document.getElementById('declineInsurance');
        
        // History
        this.historyList = document.getElementById('historyList');
        
        // Modal elements
        this.gameResultModal = document.getElementById('gameResultModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultAmount = document.getElementById('resultAmount');
        this.playerResult = document.getElementById('playerResult');
        this.dealerResult = document.getElementById('dealerResult');
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
        
        // Action buttons
        this.placeBetBtn.addEventListener('click', () => this.placeBet());
        this.clearBetsBtn.addEventListener('click', () => this.clearBets());
        this.startAutoBetBtn.addEventListener('click', () => this.startAutoBet());
        
        // Game controls
        this.hitBtn.addEventListener('click', () => this.hit());
        this.standBtn.addEventListener('click', () => this.stand());
        this.doubleBtn.addEventListener('click', () => this.doubleDown());
        this.splitBtn.addEventListener('click', () => this.split());
        
        // Insurance buttons
        this.acceptInsuranceBtn.addEventListener('click', () => this.acceptInsurance());
        this.declineInsuranceBtn.addEventListener('click', () => this.declineInsurance());
        
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
            if (this.gameState === 'playing') {
                switch(e.code) {
                    case 'KeyH':
                        e.preventDefault();
                        this.hit();
                        break;
                    case 'KeyS':
                        e.preventDefault();
                        this.stand();
                        break;
                    case 'KeyD':
                        e.preventDefault();
                        this.doubleDown();
                        break;
                }
            } else if (this.gameState === 'waiting' && e.code === 'Space') {
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
        if (rank === 'A') return 11; // Ace can be 1 or 11
        if (['J', 'Q', 'K'].includes(rank)) return 10;
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
    
    calculateHandValue(cards) {
        let total = 0;
        let aces = 0;
        
        for (let card of cards) {
            if (card.rank === 'A') {
                aces++;
                total += 11;
            } else {
                total += card.value;
            }
        }
        
        // Adjust for aces
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        
        return total;
    }
    
    placeBet() {
        if (this.gameState !== 'waiting') {
            this.showNotification('ไม่สามารถเดิมพันได้ในขณะนี้', 'error');
            return;
        }
        
        if (this.betAmount > this.balance) {
            this.showNotification('ยอดเงินไม่เพียงพอ', 'error');
            return;
        }
        
        this.currentBet = this.betAmount;
        this.balance -= this.currentBet;
        this.gameState = 'playing';
        this.updateDisplay();
        this.updateGameControls();
        
        // Start dealing cards
        setTimeout(() => this.dealInitialCards(), 500);
    }
    
    dealInitialCards() {
        // Clear previous cards
        this.playerCardsContainer.innerHTML = '';
        this.dealerCardsContainer.innerHTML = '';
        
        this.playerCards = [];
        this.dealerCards = [];
        
        // Deal initial cards
        this.dealCardToPlayer();
        setTimeout(() => this.dealCardToDealer(), 500);
        setTimeout(() => this.dealCardToPlayer(), 1000);
        setTimeout(() => this.dealCardToDealer(true), 1500);
        
        // Check for blackjack
        setTimeout(() => this.checkInitialBlackjack(), 2000);
    }
    
    dealCardToPlayer() {
        const card = this.dealCard();
        this.playerCards.push(card);
        this.displayCard(this.playerCardsContainer, card, 'player');
        this.updatePlayerTotal();
    }
    
    dealCardToDealer(faceDown = false) {
        const card = this.dealCard();
        this.dealerCards.push(card);
        this.displayCard(this.dealerCardsContainer, card, 'dealer', faceDown);
        this.updateDealerTotal();
    }
    
    displayCard(container, card, type, faceDown = false) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (faceDown) {
            cardElement.classList.add('face-down');
        } else {
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
        }
        
        container.appendChild(cardElement);
        
        // Add animation
        cardElement.style.transform = 'scale(0)';
        cardElement.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            cardElement.style.transform = 'scale(1)';
        }, 100);
    }
    
    updatePlayerTotal() {
        this.playerTotal = this.calculateHandValue(this.playerCards);
        this.playerTotalElement.textContent = this.playerTotal;
        
        if (this.playerTotal > 21) {
            this.playerBust();
        }
    }
    
    updateDealerTotal() {
        this.dealerTotal = this.calculateHandValue(this.dealerCards);
        this.dealerTotalElement.textContent = this.dealerTotal;
    }
    
    checkInitialBlackjack() {
        const playerBlackjack = this.playerTotal === 21;
        const dealerBlackjack = this.dealerTotal === 21;
        
        if (dealerBlackjack) {
            // Show dealer's second card
            this.showDealerCard();
            this.updateDealerTotal();
            
            if (playerBlackjack) {
                // Both have blackjack - push
                this.finishGame('push');
            } else {
                // Dealer has blackjack, player doesn't
                this.finishGame('dealer');
            }
        } else if (playerBlackjack) {
            // Player has blackjack, dealer doesn't
            this.finishGame('player');
        } else {
            // No blackjack - check for insurance
            if (this.dealerCards[0].rank === 'A') {
                this.showInsurance();
            } else {
                this.updateGameControls();
            }
        }
    }
    
    showDealerCard() {
        const dealerCards = this.dealerCardsContainer.querySelectorAll('.card');
        if (dealerCards.length > 1) {
            dealerCards[1].classList.remove('face-down');
            dealerCards[1].innerHTML = '';
            
            const card = this.dealerCards[1];
            const cardImage = document.createElement('img');
            const imagePath = `../../images/card/${card.rank}${card.suit}.png`;
            cardImage.src = imagePath;
            cardImage.alt = `${card.rank} of ${card.suit}`;
            cardImage.onerror = () => {
                dealerCards[1].textContent = `${card.rank}${card.suit}`;
            };
            
            dealerCards[1].appendChild(cardImage);
        }
    }
    
    showInsurance() {
        this.insuranceSection.style.display = 'block';
    }
    
    acceptInsurance() {
        if (this.balance >= this.currentBet / 2) {
            this.insuranceBet = this.currentBet / 2;
            this.balance -= this.insuranceBet;
            this.updateDisplay();
        }
        this.insuranceSection.style.display = 'none';
        this.updateGameControls();
    }
    
    declineInsurance() {
        this.insuranceSection.style.display = 'none';
        this.updateGameControls();
    }
    
    hit() {
        if (this.gameState !== 'playing') return;
        
        this.dealCardToPlayer();
        
        if (this.playerTotal > 21) {
            this.playerBust();
        } else {
            this.updateGameControls();
        }
    }
    
    stand() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'dealer';
        this.updateGameControls();
        this.dealerPlay();
    }
    
    doubleDown() {
        if (this.gameState !== 'playing' || !this.canDouble) return;
        
        if (this.balance >= this.currentBet) {
            this.balance -= this.currentBet;
            this.currentBet *= 2;
            this.updateDisplay();
            
            this.dealCardToPlayer();
            this.canDouble = false;
            
            if (this.playerTotal > 21) {
                this.playerBust();
            } else {
                this.stand();
            }
        } else {
            this.showNotification('ยอดเงินไม่เพียงพอสำหรับ Double Down', 'error');
        }
    }
    
    split() {
        if (this.gameState !== 'playing' || !this.canSplit) return;
        
        // For now, just show notification that split is not implemented
        this.showNotification('Split ยังไม่ได้รับการพัฒนา', 'info');
    }
    
    playerBust() {
        this.gameState = 'results';
        this.finishGame('dealer');
    }
    
    dealerPlay() {
        this.showDealerCard();
        this.updateDealerTotal();
        
        // Dealer must hit on 16 or less, stand on 17 or more
        const dealerInterval = setInterval(() => {
            if (this.dealerTotal < 17) {
                this.dealCardToDealer();
                if (this.dealerTotal > 21) {
                    clearInterval(dealerInterval);
                    this.finishGame('player');
                }
            } else {
                clearInterval(dealerInterval);
                this.determineWinner();
            }
        }, 1000);
    }
    
    determineWinner() {
        if (this.dealerTotal > 21) {
            this.finishGame('player');
        } else if (this.playerTotal > this.dealerTotal) {
            this.finishGame('player');
        } else if (this.dealerTotal > this.playerTotal) {
            this.finishGame('dealer');
        } else {
            this.finishGame('push');
        }
    }
    
    finishGame(result) {
        this.gameState = 'results';
        let winAmount = 0;
        let message = '';
        let icon = '';
        
        // Check insurance first
        if (this.insuranceBet > 0 && this.dealerTotal === 21) {
            winAmount += this.insuranceBet * 2;
        }
        
        switch(result) {
            case 'player':
                if (this.playerTotal === 21 && this.playerCards.length === 2) {
                    // Blackjack pays 3:2
                    winAmount += this.currentBet * 2.5;
                    message = 'Blackjack! คุณชนะ!';
                    icon = '🎉';
                } else {
                    // Regular win pays 1:1
                    winAmount += this.currentBet * 2;
                    message = 'คุณชนะ!';
                    icon = '🎉';
                }
                break;
            case 'dealer':
                message = 'เจ้ามือชนะ';
                icon = '😔';
                break;
            case 'push':
                winAmount += this.currentBet;
                message = 'เสมอ';
                icon = '🤝';
                break;
        }
        
        this.balance += winAmount;
        
        // Add to history
        this.addToHistory(result, this.playerTotal, this.dealerTotal, winAmount - this.currentBet);
        
        // Show result modal
        this.showResult(result, this.playerTotal, this.dealerTotal, winAmount - this.currentBet, message, icon);
        
        // Update display
        this.updateDisplay();
        this.updateGameControls();
        
        // Reset for next game
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }
    
    showResult(result, playerTotal, dealerTotal, winAmount, message, icon) {
        this.modalTitle.textContent = message;
        this.resultIcon.textContent = icon;
        this.resultMessage.textContent = message;
        this.resultAmount.textContent = winAmount > 0 ? 
            `+${Math.floor(winAmount)} บาท` : 
            winAmount < 0 ? 
            `เสีย ${Math.floor(Math.abs(winAmount))} บาท` : 
            'เสมอ';
        this.resultAmount.style.color = winAmount > 0 ? '#4CAF50' : winAmount < 0 ? '#f44336' : '#d4af37';
        
        this.playerResult.textContent = playerTotal;
        this.dealerResult.textContent = dealerTotal;
        
        this.showModal();
    }
    
    resetGame() {
        this.playerCardsContainer.innerHTML = '';
        this.dealerCardsContainer.innerHTML = '';
        this.playerTotalElement.textContent = '0';
        this.dealerTotalElement.textContent = '0';
        this.insuranceSection.style.display = 'none';
        
        this.playerCards = [];
        this.dealerCards = [];
        this.playerTotal = 0;
        this.dealerTotal = 0;
        this.currentBet = 0;
        this.insuranceBet = 0;
        this.canDouble = true;
        this.canSplit = false;
        
        this.gameState = 'waiting';
        this.updateDisplay();
        this.updateGameControls();
    }
    
    updateGameControls() {
        const isPlaying = this.gameState === 'playing';
        const canDouble = isPlaying && this.canDouble && this.balance >= this.currentBet;
        const canSplit = isPlaying && this.canSplit && this.playerCards.length === 2 && 
                        this.playerCards[0].rank === this.playerCards[1].rank;
        
        this.hitBtn.disabled = !isPlaying;
        this.standBtn.disabled = !isPlaying;
        this.doubleBtn.disabled = !canDouble;
        this.splitBtn.disabled = !canSplit;
        
        this.placeBetBtn.disabled = this.gameState !== 'waiting';
    }
    
    startAutoBet() {
        if (this.autoBet.active) {
            this.stopAutoBet();
            return;
        }
        
        if (this.balance < this.autoBet.amount) {
            this.showNotification('ยอดเงินไม่เพียงพอสำหรับ Auto Bet', 'error');
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
    
    addToHistory(result, playerTotal, dealerTotal, winAmount) {
        const historyItem = {
            timestamp: new Date(),
            result: result,
            playerTotal: playerTotal,
            dealerTotal: dealerTotal,
            winAmount: winAmount,
            bet: this.currentBet
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
                this.autoBet.totalLost += this.currentBet;
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
            const resultText = item.result === 'player' ? 'Player' : 
                              item.result === 'dealer' ? 'Dealer' : 'Push';
            
            return `
                <div class="history-item ${isWin ? 'win' : item.winAmount < 0 ? 'lose' : ''}">
                    <div>
                        <div class="history-time">${timeStr}</div>
                        <div class="history-result">${resultText} (${item.playerTotal}-${item.dealerTotal})</div>
                    </div>
                    <div class="history-amount ${isWin ? 'win' : item.winAmount < 0 ? 'lose' : ''}">
                        ${isWin ? '+' : item.winAmount < 0 ? '-' : ''}${Math.abs(Math.floor(item.winAmount))} บาท
                    </div>
                </div>
            `;
        }).join('');
    }
    
    clearBets() {
        this.currentBet = 0;
        this.updateDisplay();
        this.updateGameControls();
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
    // Check if we're on the blackjack game page
    if (document.getElementById('hitBtn')) {
        new BlackjackGame();
        console.log('Blackjack game loaded successfully! 🃏✨');
    }
});