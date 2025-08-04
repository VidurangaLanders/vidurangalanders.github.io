// Main application initialization and logic

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {    
    // Initialize modules
    try {
        initializeEffects();
        updateActiveNavigation();
        initializeKeyboardNavigation();
        setupErrorHandling();
    } catch (error) {
        // Continue without effects if there's an error
    }
});

// Keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Escape key closes mobile menu
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
        
        // Arrow keys for navigation (when not in input fields)
        if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            switch(event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    navigateToNextPage();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    navigateToPreviousPage();
                    break;
                case 'Home':
                    showPage('home');
                    break;
            }
        }
    });
}

// Navigate to next/previous page
function navigateToNextPage() {
    const pages = ['home', 'research', 'projects', 'cv', 'blog', 'arts', 'contact'];
    const currentPage = document.querySelector('.page.active');
    
    if (currentPage) {
        const currentIndex = pages.indexOf(currentPage.id);
        const nextIndex = (currentIndex + 1) % pages.length;
        showPage(pages[nextIndex]);
    }
}

function navigateToPreviousPage() {
    const pages = ['home', 'research', 'projects', 'cv', 'blog', 'arts', 'contact'];
    const currentPage = document.querySelector('.page.active');
    
    if (currentPage) {
        const currentIndex = pages.indexOf(currentPage.id);
        const prevIndex = currentIndex === 0 ? pages.length - 1 : currentIndex - 1;
        showPage(pages[prevIndex]);
    }
}

// Simplified error handling
function setupErrorHandling() {
    window.addEventListener('error', function(event) {
        console.error('Application error:', event.error);
        // Don't show error messages to users unless critical
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 0, 0, 0.1);
        border: 1px solid rgba(255, 0, 0, 0.3);
        color: #ff6b6b;
        padding: 1rem;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        backdrop-filter: blur(10px);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Export functions for global use
window.portfolioApp = {
    showPage,
    toggleMobileMenu,
    showProjectDetail,
    showBlogDetail,
};