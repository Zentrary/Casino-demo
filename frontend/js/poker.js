// Poker Game JavaScript
class PokerGame {
  constructor() {
    this.balance = 1000;
    this.betAmount = 10;
    this.currentBet = 0;
    this.pot = 0;
    this.gameState = 'waiting'; // waiting, betting, dealing, playing, results
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

    this.deck = [];
    this.playerCards = [];
    this.dealerCards = [];
    this.communityCards = [];
    this.playerHand = null;
    this.dealerHand = null;
    this.gamePhase = 'preflop'; // preflop, flop, turn, river, showdown

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
    this.communityCardsContainer = document.getElementById('communityCards');
    this.playerHandInfo = document.getElementById('playerHandInfo');
    this.dealerHandInfo = document.getElementById('dealerHandInfo');

    // Game controls
    this.dealCardsBtn = document.getElementById('dealCards');
    this.foldBtn = document.getElementById('foldBtn');
    this.callBtn = document.getElementById('callBtn');
    this.raiseBtn = document.getElementById('raiseBtn');

    // Pot and bet info
    this.potAmount = document.getElementById('potAmount');
    this.currentBetElement = document.getElementById('currentBet');

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
    // Tab switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Bet amount controls
    this.betUpBtn.addEventListener('click', () => this.adjustBet(1));
    this.betDownBtn.addEventListener('click', () => this.adjustBet(-1));
    this.betHalfBtn.addEventListener('click', () => this.adjustBet(0.5));
    this.betDoubleBtn.addEventListener('click', () => this.adjustBet(2));

    this.autoBetUpBtn.addEventListener('click', () => this.adjustAutoBet(1));
    this.autoBetDownBtn.addEventListener('click', () => this.adjustAutoBet(-1));
    this.autoBetHalfBtn.addEventListener('click', () => this.adjustAutoBet(0.5));
    this.autoBetDoubleBtn.addEventListener('click', () => this.adjustAutoBet(2));

    // Preset buttons
    this.presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amount = parseFloat(e.target.dataset.amount);
        const bets = e.target.dataset.bets;

        if (amount) {
          this.setBetAmount(amount);
        } else if (bets) {
          this.setNumberOfBets(bets);
        }
      });
    });

    // Action buttons
    this.placeBetBtn.addEventListener('click', () => this.placeBet());
    this.clearBetsBtn.addEventListener('click', () => this.clearBets());
    this.startAutoBetBtn.addEventListener('click', () => this.startAutoBet());

    // Game controls
    this.dealCardsBtn.addEventListener('click', () => this.dealCards());
    this.foldBtn.addEventListener('click', () => this.fold());
    this.callBtn.addEventListener('click', () => this.call());
    this.raiseBtn.addEventListener('click', () => this.raise());

    // Modal controls
    this.closeModal.addEventListener('click', () => this.closeResultModal());
    this.continueBtn.addEventListener('click', () => this.continueGame());

    // Input events
    this.betAmountInput.addEventListener('input', (e) => {
      this.betAmount = Math.max(1, Math.min(1000, parseFloat(e.target.value) || 1));
      this.updateDisplay();
    });

    this.autoBetAmountInput.addEventListener('input', (e) => {
      this.autoBet.amount = Math.max(1, Math.min(1000, parseFloat(e.target.value) || 1));
    });

    this.numberOfBetsInput.addEventListener('input', (e) => {
      const value = e.target.value;
      this.autoBet.numberOfBets = value === '∞' ? Infinity : parseInt(value) || 1;
    });

    this.stopOnWinInput.addEventListener('input', (e) => {
      this.autoBet.stopOnWin = parseInt(e.target.value) || 0;
    });

    this.stopOnLossInput.addEventListener('input', (e) => {
      this.autoBet.stopOnLoss = parseInt(e.target.value) || 0;
    });
  }

  initializeDeck() {
    this.deck = [];
    const suits = ['C', 'D', 'H', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let suit of suits) {
      for (let rank of ranks) {
        this.deck.push({
          suit: suit,
          rank: rank,
          value: this.getCardValue(rank),
          image: `../../images/card/${rank}${suit}.png`
        });
      }
    }

    this.shuffleDeck();
  }

  getCardValue(rank) {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
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

  switchTab(tab) {
    this.tabButtons.forEach(btn => btn.classList.remove('active'));
    this.tabPanels.forEach(panel => panel.classList.remove('active'));

    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
  }

  adjustBet(multiplier) {
    if (multiplier === 0.5) {
      this.betAmount = Math.max(1, Math.floor(this.betAmount / 2));
    } else if (multiplier === 2) {
      this.betAmount = Math.min(1000, this.betAmount * 2);
    } else {
      this.betAmount = Math.max(1, Math.min(1000, this.betAmount + multiplier));
    }
    this.updateDisplay();
  }

  adjustAutoBet(multiplier) {
    if (multiplier === 0.5) {
      this.autoBet.amount = Math.max(1, Math.floor(this.autoBet.amount / 2));
    } else if (multiplier === 2) {
      this.autoBet.amount = Math.min(1000, this.autoBet.amount * 2);
    } else {
      this.autoBet.amount = Math.max(1, Math.min(1000, this.autoBet.amount + multiplier));
    }
    this.autoBetAmountInput.value = this.autoBet.amount;
  }

  setBetAmount(amount) {
    this.betAmount = amount;
    this.betAmountInput.value = amount;
    this.updateDisplay();
  }

  setNumberOfBets(bets) {
    this.numberOfBetsInput.value = bets;
    this.autoBet.numberOfBets = bets === '∞' ? Infinity : parseInt(bets);
  }

  placeBet() {
    if (this.balance < this.betAmount) {
      alert('ยอดเงินไม่เพียงพอ');
      return;
    }

    this.balance -= this.betAmount;
    this.currentBet = this.betAmount;
    this.pot = this.betAmount;
    this.gameState = 'dealing';

    this.updateDisplay();
    this.dealCards();
  }

  clearBets() {
    this.currentBet = 0;
    this.pot = 0;
    this.balance += this.betAmount;
    this.gameState = 'waiting';

    this.clearCards();
    this.updateDisplay();
  }

  startAutoBet() {
    if (this.balance < this.autoBet.amount) {
      alert('ยอดเงินไม่เพียงพอ');
      return;
    }

    this.autoBet.active = true;
    this.autoBet.currentBet = 0;
    this.autoBet.totalWon = 0;
    this.autoBet.totalLost = 0;

    this.placeBet();
  }

  dealCards() {
    if (this.gameState !== 'dealing') return;

    this.clearCards();

    // Deal player cards
    this.playerCards = [this.dealCard(), this.dealCard()];

    // Deal dealer cards
    this.dealerCards = [this.dealCard(), this.dealCard()];

    // Deal community cards (flop)
    this.communityCards = [this.dealCard(), this.dealCard(), this.dealCard()];

    this.gamePhase = 'flop';
    this.gameState = 'playing';

    this.displayCards();
    this.evaluateHands();
    this.updateDisplay();
  }

  fold() {
    this.gameState = 'results';
    this.showResult('lose', 'คุณแพ้ - Fold');
  }

  call() {
    if (this.balance < this.currentBet) {
      alert('ยอดเงินไม่เพียงพอ');
      return;
    }

    this.balance -= this.currentBet;
    this.pot += this.currentBet;

    this.dealNextCard();
    this.updateDisplay();
  }

  raise() {
    const raiseAmount = this.currentBet;
    if (this.balance < raiseAmount) {
      alert('ยอดเงินไม่เพียงพอ');
      return;
    }

    this.balance -= raiseAmount;
    this.pot += raiseAmount;
    this.currentBet += raiseAmount;

    this.dealNextCard();
    this.updateDisplay();
  }

  dealNextCard() {
    if (this.gamePhase === 'flop') {
      this.communityCards.push(this.dealCard());
      this.gamePhase = 'turn';
    } else if (this.gamePhase === 'turn') {
      this.communityCards.push(this.dealCard());
      this.gamePhase = 'river';
    } else if (this.gamePhase === 'river') {
      this.gamePhase = 'showdown';
      this.showdown();
      return;
    }

    this.displayCards();
    this.evaluateHands();
  }

  showdown() {
    this.gameState = 'results';

    const playerHand = this.evaluateHand([...this.playerCards, ...this.communityCards]);
    const dealerHand = this.evaluateHand([...this.dealerCards, ...this.communityCards]);

    this.playerHand = playerHand;
    this.dealerHand = dealerHand;

    const result = this.compareHands(playerHand, dealerHand);

    if (result > 0) {
      this.balance += this.pot;
      this.showResult('win', 'คุณชนะ!', this.pot);
    } else if (result < 0) {
      this.showResult('lose', 'คุณแพ้!', 0);
    } else {
      this.balance += this.pot / 2;
      this.showResult('tie', 'เสมอ!', this.pot / 2);
    }
  }

  evaluateHands() {
    if (this.playerCards.length === 2) {
      this.playerHand = this.evaluateHand([...this.playerCards, ...this.communityCards]);
      this.dealerHand = this.evaluateHand([...this.dealerCards, ...this.communityCards]);

      this.playerHandInfo.textContent = this.getHandName(this.playerHand);
      this.dealerHandInfo.textContent = this.getHandName(this.dealerHand);
    }
  }

  evaluateHand(cards) {
    if (cards.length < 5) return { type: 'High Card', value: 0, cards: [] };

    // Get all possible 5-card combinations
    const combinations = this.getCombinations(cards, 5);
    let bestHand = { type: 'High Card', value: 0, cards: [] };

    for (let combo of combinations) {
      const hand = this.analyzeHand(combo);
      if (this.compareHands(hand, bestHand) > 0) {
        bestHand = hand;
      }
    }

    return bestHand;
  }

  getCombinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];

    const result = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tailCombos = this.getCombinations(arr.slice(i + 1), k - 1);
      for (let combo of tailCombos) {
        result.push([head, ...combo]);
      }
    }
    return result;
  }

  analyzeHand(cards) {
    const ranks = cards.map(card => card.value).sort((a, b) => b - a);
    const suits = cards.map(card => card.suit);
    const rankCounts = {};

    ranks.forEach(rank => {
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = suits.every(suit => suit === suits[0]);
    const isStraight = this.isStraight(ranks);

    // Royal Flush
    if (isFlush && isStraight && ranks[0] === 14) {
      return { type: 'Royal Flush', value: 10, cards: cards };
    }

    // Straight Flush
    if (isFlush && isStraight) {
      return { type: 'Straight Flush', value: 9, cards: cards };
    }

    // Four of a Kind
    if (counts[0] === 4) {
      return { type: 'Four of a Kind', value: 8, cards: cards };
    }

    // Full House
    if (counts[0] === 3 && counts[1] === 2) {
      return { type: 'Full House', value: 7, cards: cards };
    }

    // Flush
    if (isFlush) {
      return { type: 'Flush', value: 6, cards: cards };
    }

    // Straight
    if (isStraight) {
      return { type: 'Straight', value: 5, cards: cards };
    }

    // Three of a Kind
    if (counts[0] === 3) {
      return { type: 'Three of a Kind', value: 4, cards: cards };
    }

    // Two Pair
    if (counts[0] === 2 && counts[1] === 2) {
      return { type: 'Two Pair', value: 3, cards: cards };
    }

    // One Pair
    if (counts[0] === 2) {
      return { type: 'One Pair', value: 2, cards: cards };
    }

    // High Card
    return { type: 'High Card', value: 1, cards: cards };
  }

  isStraight(ranks) {
    const sorted = [...new Set(ranks)].sort((a, b) => a - b);
    if (sorted.length !== 5) return false;

    // Check for regular straight
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] !== 1) {
        // Check for A-2-3-4-5 straight
        if (sorted[0] === 2 && sorted[4] === 14) {
          return true;
        }
        return false;
      }
    }
    return true;
  }

  compareHands(hand1, hand2) {
    if (hand1.value !== hand2.value) {
      return hand1.value - hand2.value;
    }

    // Compare high cards for same hand type
    const ranks1 = hand1.cards.map(card => card.value).sort((a, b) => b - a);
    const ranks2 = hand2.cards.map(card => card.value).sort((a, b) => b - a);

    for (let i = 0; i < Math.min(ranks1.length, ranks2.length); i++) {
      if (ranks1[i] !== ranks2[i]) {
        return ranks1[i] - ranks2[i];
      }
    }

    return 0;
  }

  getHandName(hand) {
    return hand.type;
  }

  displayCards() {
    this.displayPlayerCards();
    this.displayDealerCards();
    this.displayCommunityCards();
  }

  displayPlayerCards() {
    this.playerCardsContainer.innerHTML = '';
    this.playerCards.forEach(card => {
      const cardElement = this.createCardElement(card);
      this.playerCardsContainer.appendChild(cardElement);
    });
  }

  displayDealerCards() {
    this.dealerCardsContainer.innerHTML = '';
    this.dealerCards.forEach((card, index) => {
      const cardElement = this.createCardElement(card, index === 0);
      this.dealerCardsContainer.appendChild(cardElement);
    });
  }

  displayCommunityCards() {
    this.communityCardsContainer.innerHTML = '';
    this.communityCards.forEach(card => {
      const cardElement = this.createCardElement(card);
      this.communityCardsContainer.appendChild(cardElement);
    });
  }

  createCardElement(card, faceDown = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    if (faceDown) {
      cardDiv.classList.add('face-down');
    } else {
      const img = document.createElement('img');
      img.src = card.image;
      img.alt = `${card.rank}${card.suit}`;
      cardDiv.appendChild(img);
    }

    return cardDiv;
  }

  clearCards() {
    this.playerCards = [];
    this.dealerCards = [];
    this.communityCards = [];
    this.playerHand = null;
    this.dealerHand = null;
    this.gamePhase = 'preflop';

    this.playerCardsContainer.innerHTML = '';
    this.dealerCardsContainer.innerHTML = '';
    this.communityCardsContainer.innerHTML = '';
    this.playerHandInfo.textContent = 'Waiting...';
    this.dealerHandInfo.textContent = 'Waiting...';
  }

  showResult(result, message, amount) {
    this.gameState = 'results';

    const modal = this.gameResultModal;
    const icon = this.resultIcon;
    const resultMessage = this.resultMessage;
    const resultAmount = this.resultAmount;
    const playerResult = this.playerResult;
    const dealerResult = this.dealerResult;

    if (result === 'win') {
      icon.textContent = '🎉';
      resultMessage.textContent = message;
      resultAmount.textContent = `+${amount} บาท`;
      resultAmount.style.color = '#4CAF50';
    } else if (result === 'lose') {
      icon.textContent = '😞';
      resultMessage.textContent = message;
      resultAmount.textContent = `-${this.pot} บาท`;
      resultAmount.style.color = '#f44336';
    } else {
      icon.textContent = '🤝';
      resultMessage.textContent = message;
      resultAmount.textContent = `+${amount} บาท`;
      resultAmount.style.color = '#FF9800';
    }

    playerResult.textContent = this.playerHand ? this.playerHand.type : 'High Card';
    dealerResult.textContent = this.dealerHand ? this.dealerHand.type : 'High Card';

    modal.classList.add('show');

    // Add to history
    this.addToHistory(result, message, amount);

    // Handle auto bet
    if (this.autoBet.active) {
      this.handleAutoBet(result, amount);
    }
  }

  handleAutoBet(result, amount) {
    this.autoBet.currentBet++;

    if (result === 'win') {
      this.autoBet.totalWon += amount;
    } else {
      this.autoBet.totalLost += this.pot;
    }

    // Check stop conditions
    if (this.autoBet.stopOnWin > 0 && this.autoBet.totalWon >= this.autoBet.stopOnWin) {
      this.autoBet.active = false;
      return;
    }

    if (this.autoBet.stopOnLoss > 0 && this.autoBet.totalLost >= this.autoBet.stopOnLoss) {
      this.autoBet.active = false;
      return;
    }

    if (this.autoBet.currentBet >= this.autoBet.numberOfBets) {
      this.autoBet.active = false;
      return;
    }

    // Continue auto bet
    setTimeout(() => {
      this.continueGame();
    }, 2000);
  }

  addToHistory(result, message, amount) {
    const historyItem = {
      time: new Date().toLocaleTimeString(),
      result: result,
      message: message,
      amount: amount,
      hand: this.playerHand ? this.playerHand.type : 'High Card'
    };

    this.gameHistory.unshift(historyItem);
    if (this.gameHistory.length > 50) {
      this.gameHistory.pop();
    }

    this.updateHistory();
  }

  updateHistory() {
    this.historyList.innerHTML = '';

    this.gameHistory.forEach(item => {
      const historyElement = document.createElement('div');
      historyElement.className = `history-item ${item.result}`;

      historyElement.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-result">${item.message}</div>
                <div class="history-amount ${item.result}">${item.amount > 0 ? '+' : ''}${item.amount} บาท</div>
            `;

      this.historyList.appendChild(historyElement);
    });
  }

  closeResultModal() {
    this.gameResultModal.classList.remove('show');
  }

  continueGame() {
    this.closeResultModal();
    this.resetGame();
  }

  resetGame() {
    this.currentBet = 0;
    this.pot = 0;
    this.gameState = 'waiting';
    this.gamePhase = 'preflop';

    this.clearCards();
    this.updateDisplay();
  }

  updateDisplay() {
    this.balanceElement.textContent = this.balance;
    this.betAmountInput.value = this.betAmount;
    this.autoBetAmountInput.value = this.autoBet.amount;
    this.potAmount.textContent = this.pot;
    this.currentBetElement.textContent = this.currentBet;

    // Update button states
    this.dealCardsBtn.disabled = this.gameState !== 'dealing';
    this.foldBtn.disabled = this.gameState !== 'playing';
    this.callBtn.disabled = this.gameState !== 'playing';
    this.raiseBtn.disabled = this.gameState !== 'playing';

    // Update preset buttons
    this.presetButtons.forEach(btn => {
      btn.classList.remove('active');
      const amount = parseFloat(btn.dataset.amount);
      if (amount && amount === this.betAmount) {
        btn.classList.add('active');
      }
    });
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new PokerGame();
});
