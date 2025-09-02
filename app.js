// Innovation Club Website JavaScript

class InnovationClubApp {
    constructor() {
        this.currentPage = 'home';
        this.isScrolling = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupContactForm();
        this.setupScrollEffects();
        this.setupCarousel();
        this.setupGallery();
        this.setupScrollToTop();
        this.setupAnimations();
        this.setupEventRegistration();
        this.handleInitialLoad();
    }

    // Navigation Management
    setupNavigation() {
        // Handle navigation clicks with event delegation
        document.addEventListener('click', (e) => {
            // Check if clicked element or its parent has data-page attribute
            const target = e.target.closest('[data-page]');
            if (target) {
                e.preventDefault();
                const page = target.getAttribute('data-page');
                this.navigateToPage(page);
                return;
            }

            // Handle anchor links that should navigate to pages
            if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
                const href = e.target.getAttribute('href');
                if (href.startsWith('#') && href.length > 1) {
                    const page = href.substring(1);
                    if (document.getElementById(page)) {
                        e.preventDefault();
                        this.navigateToPage(page);
                        return;
                    }
                }
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            this.showPage(page, false);
        });

        // Handle navbar collapse on mobile
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarToggler && navbarCollapse) {
            // Close mobile menu when clicking on a nav link
            navbarCollapse.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    } else {
                        // Fallback: manually hide the collapse
                        navbarCollapse.classList.remove('show');
                    }
                }
            });
        }

        // Handle scroll indicator click
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            });
        }
    }

    navigateToPage(page) {
        // Update URL without reloading
        const url = page === 'home' ? '/' : `/#${page}`;
        history.pushState({ page }, '', url);
        
        // Show the page
        this.showPage(page, true);
    }

    showPage(page, updateHistory = false) {
        if (this.isScrolling) return;
        
        // Hide all pages with fade out
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(p => {
            p.classList.remove('active');
        });

        // Show target page with fade in
        setTimeout(() => {
            const targetPage = document.getElementById(page);
            if (targetPage) {
                targetPage.classList.add('active');
                this.currentPage = page;
                
                // Update active navigation
                this.updateActiveNav(page);
                
                // Scroll to top smoothly
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Trigger animations for the new page
                this.triggerPageAnimations(page);
            } else {
                // Fallback to home if page doesn't exist
                console.warn(`Page "${page}" not found, showing home`);
                this.showPage('home', updateHistory);
            }
        }, 150);
    }

    updateActiveNav(page) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link
        const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    handleInitialLoad() {
        // Check URL hash on load
        const hash = window.location.hash.slice(1);
        const initialPage = hash && document.getElementById(hash) ? hash : 'home';
        this.showPage(initialPage, false);
    }

    // Contact Form Management
    setupContactForm() {
        const form = document.getElementById('contactForm');
        const messageDiv = document.getElementById('formMessage');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form, messageDiv);
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.classList.remove('is-invalid');
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }

        // Name validation
        if (field.id === 'name' && value) {
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long.';
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Name should only contain letters and spaces.';
            }
        }

        // Message validation
        if (field.id === 'message' && value) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long.';
            }
        }

        if (!isValid) {
            field.classList.add('is-invalid');
            this.showFieldError(field, errorMessage);
        } else {
            field.classList.add('is-valid');
            this.removeFieldError(field);
        }

        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        this.removeFieldError(field);
    }

    showFieldError(field, message) {
        this.removeFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    removeFieldError(field) {
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleFormSubmission(form, messageDiv) {
        // Validate all fields
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage(messageDiv, 'Please correct the errors above.', 'danger');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';

        try {
            // Simulate form submission (replace with actual API call)
            await this.simulateFormSubmission(form);
            
            // Show success message
            this.showMessage(messageDiv, 'Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
            
            // Reset form
            form.reset();
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
                this.removeFieldError(input);
            });

        } catch (error) {
            this.showMessage(messageDiv, 'Sorry, there was an error sending your message. Please try again or contact us directly.', 'danger');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    simulateFormSubmission(form) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Simulated network error'));
                }
            }, 2000);
        });
    }

    showMessage(container, message, type) {
        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    // Scroll Effects
    setupScrollEffects() {
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', this.debounce(() => {
            // Navbar background on scroll
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Show/hide scroll to top button
            this.updateScrollToTopButton();
            
            // Trigger scroll animations
            this.handleScrollAnimations();
        }, 10));
    }

    // Scroll to Top Button
    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    updateScrollToTopButton() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.pointerEvents = 'none';
            }
        }
    }

    // Carousel Setup
    setupCarousel() {
        const carousel = document.getElementById('galleryCarousel');
        if (carousel) {
            // Initialize Bootstrap carousel with custom settings
            let bsCarousel;
            
            setTimeout(() => {
                if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
                    bsCarousel = new bootstrap.Carousel(carousel, {
                        interval: 4000,
                        ride: 'carousel',
                        wrap: true,
                        pause: 'hover'
                    });

                    // Pause on hover and resume on leave
                    carousel.addEventListener('mouseenter', () => {
                        if (bsCarousel) bsCarousel.pause();
                    });

                    carousel.addEventListener('mouseleave', () => {
                        if (bsCarousel) bsCarousel.cycle();
                    });

                    // Keyboard navigation
                    carousel.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowLeft') {
                            bsCarousel.prev();
                        } else if (e.key === 'ArrowRight') {
                            bsCarousel.next();
                        }
                    });
                }
            }, 100);
        }
    }

    // Gallery Setup with Lightbox
    setupGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLightbox(item, index);
            });

            // Keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `View gallery item ${index + 1}`);
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openLightbox(item, index);
                }
            });
        });
    }

    openLightbox(item, index) {
        const placeholder = item.querySelector('.gallery-placeholder');
        const overlay = item.querySelector('.gallery-overlay');
        
        if (!placeholder || !overlay) return;

        // Create lightbox modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'lightboxModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        const placeholderContent = placeholder.innerHTML;
        const title = overlay.querySelector('h5')?.textContent || 'Gallery Image';
        const description = overlay.querySelector('p')?.textContent || '';
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header gradient-bg text-white">
                        <h5 class="modal-title" id="lightboxModalLabel">
                            <i class="fas fa-images me-2"></i>${title}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center p-0">
                        <div class="gallery-placeholder ${placeholder.className.replace('gallery-placeholder', '').trim()}" style="height: 400px; border-radius: 0;">
                            ${placeholderContent}
                        </div>
                        <div class="p-3">
                            <p class="mb-0 text-muted">${description}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <small class="text-muted">Image ${index + 1} of ${document.querySelectorAll('.gallery-item').length}</small>
                        <button type="button" class="btn btn-gradient" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Initialize and show modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();

            // Remove modal from DOM when hidden
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });

            // Add keyboard navigation for multiple images
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' && index > 0) {
                    bsModal.hide();
                    setTimeout(() => {
                        this.openLightbox(document.querySelectorAll('.gallery-item')[index - 1], index - 1);
                    }, 300);
                } else if (e.key === 'ArrowRight' && index < document.querySelectorAll('.gallery-item').length - 1) {
                    bsModal.hide();
                    setTimeout(() => {
                        this.openLightbox(document.querySelectorAll('.gallery-item')[index + 1], index + 1);
                    }, 300);
                }
            });
        }
    }

    // Event Registration Handlers
    setupEventRegistration() {
        // Handle all registration buttons
        document.addEventListener('click', (e) => {
            if (e.target.textContent.includes('Register Now') && e.target.classList.contains('btn')) {
                e.preventDefault();
                this.handleEventRegistration(e.target);
            }
        });
    }

    handleEventRegistration(button) {
        const card = button.closest('.card');
        const eventTitle = card.querySelector('.card-title, h5')?.textContent || 'Event';
        
        // Create registration modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header gradient-bg text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-ticket-alt me-2"></i>Event Registration
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <i class="fas fa-calendar-check fa-3x gradient-text mb-3"></i>
                            <h4>${eventTitle}</h4>
                            <p class="text-muted">Thank you for your interest in this event!</p>
                        </div>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Registration Process:</strong><br>
                            This is a demo website. In a real implementation, this would connect to a registration system where you could:
                            <ul class="mb-0 mt-2">
                                <li>Fill out your details</li>
                                <li>Select ticket options</li>
                                <li>Make payment (if required)</li>
                                <li>Receive confirmation email</li>
                            </ul>
                        </div>
                        <div class="text-center">
                            <p class="mb-3">For now, please contact us directly to register:</p>
                            <a href="#contact" class="btn btn-gradient" data-bs-dismiss="modal" data-page="contact">
                                <i class="fas fa-envelope me-2"></i>Contact Us to Register
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();

            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
        }
    }

    // Animation System
    setupAnimations() {
        // Animate elements when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        this.observeAnimatableElements();
    }

    observeAnimatableElements() {
        const selectors = [
            '.card',
            '.stat-card',
            '.timeline-item',
            '.achievement-item',
            '.member-card',
            '.testimonial-card'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                this.animationObserver.observe(element);
            });
        });
    }

    animateElement(element) {
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Unobserve after animation
        this.animationObserver.unobserve(element);
    }

    triggerPageAnimations(page) {
        // Trigger animations for elements on the current page
        const pageElement = document.getElementById(page);
        if (pageElement) {
            const animatableElements = pageElement.querySelectorAll('.card, .stat-card, .timeline-item, .achievement-item, .member-card, .testimonial-card');
            
            animatableElements.forEach((element, index) => {
                setTimeout(() => {
                    if (element.style.opacity === '0') {
                        this.animateElement(element);
                    }
                }, index * 100);
            });
        }
    }

    handleScrollAnimations() {
        // Additional scroll-based animations can be added here
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;

        // Parallax effect for hero section (if on home page)
        if (this.currentPage === 'home') {
            const hero = document.querySelector('.hero-section');
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        }
    }

    // Utility Functions
    debounce(func, wait) {
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

    // Accessibility Enhancements
    setupAccessibility() {
        // Skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'sr-only sr-only-focusable';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Focus management for modals
        document.addEventListener('shown.bs.modal', (e) => {
            const modal = e.target;
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length) {
                focusableElements[0].focus();
            }
        });
    }

    // Performance Optimizations
    setupPerformanceOptimizations() {
        // Lazy load images when they come into view
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new InnovationClubApp();
    
    // Make app globally accessible for debugging
    window.innovationApp = app;
    
    // Add some CSS for smooth animations
    const style = document.createElement('style');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
        
        .sr-only-focusable:focus {
            position: static;
            width: auto;
            height: auto;
            padding: 0.5rem 1rem;
            margin: 0;
            overflow: visible;
            clip: auto;
            white-space: normal;
            background: var(--gradient-primary);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            z-index: 9999;
        }
    `;
    document.head.appendChild(style);
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations and reduce activity when page is hidden
        console.log('Page hidden - reducing activity');
    } else {
        // Resume normal activity when page becomes visible
        console.log('Page visible - resuming activity');
    }
});

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Service worker registration for future PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here in a production app
        console.log('Service Worker support detected');
    });
}