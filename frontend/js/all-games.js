// All Games Page JavaScript
class AllGamesPage {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.initializeElements();
        this.bindEvents();
        this.loadGames();
    }
    
    initializeElements() {
        this.searchInput = document.getElementById('gameSearch');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.gamesGrid = document.getElementById('gamesGrid');
        this.gameCards = document.querySelectorAll('.game-card');
    }
    
    bindEvents() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterGames();
        });
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target);
                this.currentFilter = e.target.dataset.filter;
                this.filterGames();
            });
        });
        
        // Game card clicks
        this.gameCards.forEach(card => {
            const playBtn = card.querySelector('.play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openGame(card);
                });
            }
        });
    }
    
    loadGames() {
        // Initialize games data
        this.games = Array.from(this.gameCards).map(card => ({
            element: card,
            name: card.dataset.name,
            category: card.dataset.category,
            visible: true
        }));
        
        this.filteredGames = [...this.games];
    }
    
    setActiveFilter(activeBtn) {
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    filterGames() {
        this.filteredGames = this.games.filter(game => {
            const matchesFilter = this.currentFilter === 'all' || game.category === this.currentFilter;
            const matchesSearch = game.name.includes(this.searchTerm);
            return matchesFilter && matchesSearch;
        });
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.games.forEach(game => {
            const isVisible = this.filteredGames.includes(game);
            game.element.style.display = isVisible ? 'block' : 'none';
            
            if (isVisible) {
                game.element.classList.add('show');
                game.element.classList.remove('hidden');
            } else {
                game.element.classList.add('hidden');
                game.element.classList.remove('show');
            }
        });
        
        // Update grid layout
        this.gamesGrid.style.opacity = '0.5';
        setTimeout(() => {
            this.gamesGrid.style.opacity = '1';
        }, 300);
    }
    
    openGame(gameCard) {
        const gameName = gameCard.dataset.name;
        const gameCategory = gameCard.dataset.category;
        
        // Show loading animation
        this.showLoading();
        
        // Simulate game loading
        setTimeout(() => {
            this.hideLoading();
            this.redirectToGame(gameName, gameCategory);
        }, 1500);
    }
    
    redirectToGame(gameName, category) {
        // Map game names to their respective pages
        const gamePages = {
            'slot machine': 'games/slot.html',
            'blackjack': 'games/blackjack.html',
            'roulette': 'games/roulette.html',
            'poker': 'games/poker.html',
            'classic dice': 'games/classicdice.html',
            'coin flip': 'games/coinflip.html',
            'keno': 'games/keno.html',
            'mines': 'games/mine.html',
            'baccarat': 'games/baccarat.html',
            'ringoffortune': 'games/ringoffortune.html',
            'dice sum': 'games/dicesum.html',
            'crash': 'games/crash.html',
            'color crash': 'games/colorcrash.html'
        };
        
        const pageName = gamePages[gameName];
        if (pageName) {
            // Show notification
            this.showNotification(`กำลังเปิดเกม ${gameName}...`, 'info');
            
            // Redirect to game page
            setTimeout(() => {
                window.location.href = pageName;
            }, 2000);
        } else {
            this.showNotification('เกมนี้ยังไม่พร้อมใช้งาน', 'error');
        }
    }
    
    showLoading() {
        this.gamesGrid.classList.add('loading');
    }
    
    hideLoading() {
        this.gamesGrid.classList.remove('loading');
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AllGamesPage();
    
    // Add smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe game cards for animation
    document.querySelectorAll('.game-card').forEach(card => {
        observer.observe(card);
    });
    
    console.log('All Games page loaded successfully! 🎮✨');
});
