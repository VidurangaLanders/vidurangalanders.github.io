// Navigation functionality

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Close mobile menu if open
    closeMobileMenu();
    
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showProjectDetail(projectId) {
    showPage('project-' + projectId);
}

function showBlogDetail(blogId) {
    showPage('blog-' + blogId);
}

// Mobile menu functionality
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navLinks && mobileToggle) {
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navLinks && mobileToggle) {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    
    if (navLinks && navLinks.classList.contains('active')) {
        if (!nav.contains(event.target)) {
            closeMobileMenu();
        }
    }
});

// Close mobile menu on window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

// Handle navigation link clicks
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('onclick');
            if (href) {
                // Extract page name from onclick attribute
                const match = href.match(/showPage\('([^']+)'\)/);
                if (match) {
                    showPage(match[1]);
                }
            }
        });
    });
    
    // Handle back button functionality
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('onclick');
            if (href) {
                const match = href.match(/showPage\('([^']+)'\)/);
                if (match) {
                    showPage(match[1]);
                }
            }
        });
    });
});

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add active state to navigation
function updateActiveNavigation() {
    const currentPage = document.querySelector('.page.active');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    if (currentPage) {
        const pageId = currentPage.id;
        const correspondingLink = document.querySelector(`[onclick*="showPage('${pageId}')"]`);
        if (correspondingLink) {
            correspondingLink.classList.add('active');
        }
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavigation();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        showPage(event.state.page);
    }
});

// Update URL and browser history
function updateHistory(pageId) {
    const newUrl = window.location.pathname + '?page=' + pageId;
    history.pushState({ page: pageId }, '', newUrl);
}

// Simple art modal functionality
function openArtModal(imageSrc, title, description) {
    const modal = document.getElementById('art-modal');
    const modalImage = document.getElementById('art-modal-image');
    const modalTitle = document.getElementById('art-modal-title');
    const modalDescription = document.getElementById('art-modal-description');
    const loadingDiv = document.querySelector('.art-loading');
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Show loading state
    loadingDiv.style.display = 'block';
    modalImage.style.display = 'none';
    
    // Update text content
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    
    // Load full-size image
    const fullImage = new Image();
    fullImage.onload = function() {
        modalImage.src = imageSrc;
        modalImage.alt = title;
        modalImage.style.display = 'block';
        loadingDiv.style.display = 'none';
    };
    fullImage.onerror = function() {
        loadingDiv.textContent = 'Error loading image';
        loadingDiv.style.color = '#ff4444';
    };
    fullImage.src = imageSrc;
}

function closeArtModal() {
    const modal = document.getElementById('art-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('art-modal');
    if (event.target === modal) {
        closeArtModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeArtModal();
    }
});

// Image loading functionality
document.addEventListener('DOMContentLoaded', function() {
    const artThumbnails = document.querySelectorAll('.art-thumbnail');
    
    artThumbnails.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            
            img.addEventListener('error', function() {
                this.style.display = 'none';
                // Show fallback placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'art-image-placeholder';
                placeholder.innerHTML = `
                    <div class="art-preview">${this.alt}</div>
                `;
                this.parentNode.appendChild(placeholder);
            });
        }
    });
});