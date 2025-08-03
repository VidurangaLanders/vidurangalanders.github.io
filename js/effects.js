// Visual effects and animations - BACKGROUND FIX VERSION

// Create animated stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    
    const numStars = 60;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 2 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.animationDuration = (Math.random() * 3 + 3) + 's';
        starsContainer.appendChild(star);
    }
}

// Add floating particles effect
function createFloatingParticles() {
    let particleCount = 0;
    const maxParticles = 3;
    
    setInterval(() => {
        if (particleCount >= maxParticles) return;
        
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        particle.style.width = '1.5px';
        particle.style.height = '1.5px';
        particle.style.background = '#ff7f00';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '-1';
        particle.style.opacity = '0.4';
        
        document.body.appendChild(particle);
        particleCount++;
        
        const animation = particle.animate([
            { transform: 'translateY(0px)', opacity: 0.4 },
            { transform: 'translateY(-100vh)', opacity: 0 }
        ], {
            duration: 12000,
            easing: 'linear'
        });
        
        animation.onfinish = () => {
            particle.remove();
            particleCount--;
        };
    }, 5000);
}

// Ensure background covers full viewport on resize
window.addEventListener('resize', () => {
    const spaceBg = document.querySelector('.space-bg');
    if (spaceBg) {
        spaceBg.style.width = '100vw';
        spaceBg.style.height = '100vh';
        spaceBg.style.minHeight = '100vh';
    }
    
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
        starsContainer.style.width = '100vw';
        starsContainer.style.height = '100vh';
    }
});

// Smooth card hover effects
function initializeCardEffects() {
    const cards = document.querySelectorAll('.project-card, .research-card, .blog-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.005)';
            this.style.boxShadow = '0 15px 30px rgba(255, 127, 0, 0.12)';
            this.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
}

// Smooth intersection observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.research-card, .project-card, .skill-category, .award-item, .contact-card, .blog-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
}

// Smooth page transitions
function addPageTransitions() {
    const pages = document.querySelectorAll('.page');
    
    pages.forEach(page => {
        page.style.transition = 'opacity 0.4s ease-in-out';
    });
}

// Initialize all effects
function initializeEffects() {    
    createStars();
    createFloatingParticles();
    initializeCardEffects();
    initializeScrollAnimations();
    addPageTransitions();

    // Fix background positioning on initialization
    const spaceBg = document.querySelector('.space-bg');
    if (spaceBg) {
        spaceBg.style.transform = 'translateY(0px)';
        spaceBg.style.width = '100vw';
        spaceBg.style.height = '100vh';
        spaceBg.style.minHeight = '100vh';
    }
}