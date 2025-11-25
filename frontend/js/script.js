// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Smooth scrolling for navigation links
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

// Navbar background on scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(26, 26, 46, 0.98)';
  } else {
    navbar.style.background = 'rgba(26, 26, 46, 0.95)';
  }
});

// Intersection Observer for animations
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.game-card, .promo-card, .about-text, .contact-info');

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Game card hover effects
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.02)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// Promo card shine effect
document.querySelectorAll('.promo-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px) scale(1.02)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// Form submission
const contactFormEl = document.querySelector('.contact-form');
if (contactFormEl) {
  contactFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name') || e.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const message = formData.get('message') || e.target.querySelector('textarea').value;
    if (!name || !email || !message) {
      showNotification('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showNotification('กรุณากรอกอีเมลที่ถูกต้อง', 'error');
      return;
    }
    showNotification('ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับในไม่ช้า', 'success');
    e.target.reset();
  });
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
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

// Game button interactions
document.querySelectorAll('.btn-game').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const gameName = button.closest('.game-card').querySelector('h3').textContent;
    showNotification(`กำลังเปิดเกม ${gameName}...`, 'info');

    // Simulate game loading
    setTimeout(() => {
      showNotification(`ยินดีต้อนรับสู่เกม ${gameName}!`, 'success');
    }, 2000);
  });
});

// Hero button interactions
document.querySelectorAll('.hero-buttons .btn').forEach(button => {
  button.addEventListener('click', (e) => {
    if (button.textContent.includes('เริ่มเล่น')) {
      e.preventDefault();
      showNotification('กำลังเข้าสู่ระบบเกม...', 'info');
      setTimeout(() => {
        showNotification('ยินดีต้อนรับสู่ Pyramid Casino!', 'success');
      }, 1500);
    }
  });
});

// Parallax effect for floating gems
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const gems = document.querySelectorAll('.floating-gem');

  gems.forEach((gem, index) => {
    const speed = 0.5 + (index * 0.1);
    const yPos = -(scrolled * speed);
    gem.style.transform = `translateY(${yPos}px)`;
  });
});

// Pyramid rotation speed control
let pyramidSpeed = 1;
const pyramid = document.querySelector('.pyramid');

if (pyramid) {
  // Speed up pyramid on hover
  pyramid.addEventListener('mouseenter', () => {
    pyramid.style.animationDuration = '5s';
  });

  pyramid.addEventListener('mouseleave', () => {
    pyramid.style.animationDuration = '20s';
  });
}

// Add loading animation
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  // Animate hero elements
  const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons');
  heroElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * 200);
  });
});

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    .hero-title, .hero-subtitle, .hero-buttons {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .notification-content i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close mobile menu
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');

    // Close notifications
    document.querySelectorAll('.notification').forEach(notification => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }
});

// Add smooth reveal animation for sections
const revealElements = document.querySelectorAll('.games-section, .promotions-section, .about-section, .contact-section');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
});

revealElements.forEach(element => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(50px)';
  element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  revealObserver.observe(element);
});

console.log('Pyramid Casino website loaded successfully! 🎰✨');

const isGamePage = /\/html\/games\/[^/]+\.html$/.test(window.location.pathname);
if (isGamePage) {
  const loaderStyles = document.createElement('style');
  loaderStyles.textContent = `
        .loading-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center}
        .loading-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(2px)}
        .loading-content{position:relative;display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:2rem 2.5rem;border-radius:12px;background:#1e1e2f;border:1px solid rgba(212,175,55,.25);box-shadow:0 12px 28px rgba(0,0,0,.35)}
        .loading-spinner{width:48px;height:48px;border:4px solid rgba(212,175,55,.25);border-top-color:#d4af37;border-radius:50%;animation:spin 1s linear infinite}
        .loading-text{color:#fff;font-weight:600;letter-spacing:.5px}
        @keyframes spin{to{transform:rotate(360deg)}}
    `;
  document.head.appendChild(loaderStyles);
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
      <div class="loading-backdrop"></div>
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">กำลังโหลดเกม...</div>
      </div>
    `;
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) gameContainer.style.visibility = 'hidden';
  document.body.appendChild(overlay);
  setTimeout(() => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (gameContainer) gameContainer.style.visibility = 'visible';
  }, 1500);
}
