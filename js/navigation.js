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

// Update URL and browser history (optional enhancement)
function updateHistory(pageId) {
    const newUrl = window.location.pathname + '?page=' + pageId;
    history.pushState({ page: pageId }, '', newUrl);
}

// Art modal functionality
function openArtModal(artId) {
    const modal = document.getElementById('art-modal');
    const modalBody = document.getElementById('art-modal-body');
    
    // Art content data
    const artContent = {
        'collatz-feather': {
            title: 'Collatz Feather',
            description: 'This piece visualizes the trajectory lengths of Collatz sequences as a feather-like structure, where each strand represents a different mathematical path through the conjecture\'s landscape. Featured at Joint Mathematics Meetings 2023.',
            details: 'Created using generalized forms of the Collatz Conjecture, this artwork demonstrates how mathematical sequences can create naturally beautiful patterns. Each feather strand corresponds to different starting values and their convergence paths.',
            techniques: 'Mathematical visualization, Algorithm art, Fractal generation'
        },
        'collatz-feather-2': {
            title: 'Collatz Feather 2.0',
            description: 'An enhanced version of the original Collatz Feather with improved mathematical visualization techniques and refined aesthetic elements.',
            details: 'Building upon the success of the original, this version incorporates advanced rendering techniques and explores deeper mathematical relationships within the Collatz sequences.',
            techniques: 'Enhanced algorithms, Advanced rendering, Mathematical optimization'
        },
        'spiral': {
            title: 'SpiraL',
            description: 'Using spiral coordinates to plot Collatz sequences revealed hidden symmetries and created mesmerizing patterns that bridge the gap between pure mathematics and visual art.',
            details: 'This piece demonstrates how changing coordinate systems can reveal previously hidden mathematical beauty. The spiral representation uncovers symmetries that are invisible in traditional Cartesian plotting.',
            techniques: 'Spiral coordinates, Symmetry analysis, Mathematical transformation'
        },
        'springycomb': {
            title: 'Springycomb Merge',
            description: 'Complex mathematical patterns forming honeycomb-like structures through iterative mathematical processes.',
            details: 'The honeycomb patterns emerge naturally from mathematical iterations, demonstrating how complex structures can arise from simple mathematical rules.',
            techniques: 'Iterative algorithms, Pattern emergence, Structural mathematics'
        },
        'web-spiral': {
            title: 'Web Spiral',
            description: 'Intricate web-like patterns emerging from mathematical sequences, creating complex network visualizations.',
            details: 'This artwork explores the network properties of mathematical sequences, revealing how individual calculations can form interconnected webs of relationships.',
            techniques: 'Network visualization, Graph theory, Mathematical networks'
        },
        'rainbow': {
            title: 'Collatz Rainbow',
            description: 'A colorful visualization of Collatz conjecture variations, where different mathematical properties are represented through a spectrum of colors.',
            details: 'Each color represents different mathematical properties of the sequences, creating a rainbow effect that makes the underlying mathematics more accessible and beautiful.',
            techniques: 'Color mapping, Mathematical visualization, Spectrum analysis'
        }
    };
    
    const art = artContent[artId];
    if (art) {
        modalBody.innerHTML = `
            <h3>${art.title}</h3>
            <p><strong>Description:</strong> ${art.description}</p>
            <p><strong>Mathematical Details:</strong> ${art.details}</p>
            <p><strong>Techniques:</strong> ${art.techniques}</p>
            <div style="margin-top: 2rem; text-align: center;">
                <a href="https://vidurangalanders.github.io" target="_blank" class="btn btn-primary">View in Full Gallery</a>
                <a href="https://vidurangalanders.github.io/collatz-fractal/" target="_blank" class="btn btn-secondary">Create Similar Art</a>
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
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