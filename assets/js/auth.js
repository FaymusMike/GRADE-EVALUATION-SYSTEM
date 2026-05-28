// assets/js/auth.js - COMPLETE FIXED FILE
const Auth = {
    currentUser: null,
    sessionTimeout: 3600000, // 1 hour
    
    init() {
        // Fix: Delay session check to avoid bfcache conflicts
        setTimeout(() => {
            this.checkSession();
        }, 100);
        
        // Fix: Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkSession();
            }
        });
        
        // Fix: Prevent bfcache from destroying session
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Page restored from bfcache - recheck session
                setTimeout(() => this.checkSession(), 50);
            }
        });
        
        this.setupEventListeners();
    },
    
    login(email, password, remember = false) {
        try {
            const users = Storage.get('users');
            const user = users.find(u => u.email === email && atob(u.password) === password);
            
            if (user) {
                this.currentUser = user;
                const sessionData = {
                    user: { ...user, password: undefined },
                    loginTime: Date.now(),
                    remember
                };
                
                if (remember) {
                    localStorage.setItem('session', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('session', JSON.stringify(sessionData));
                }
                
                Storage.logAction(user.id, 'login', { email: user.email });
                this.redirectToDashboard(user.role);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },
    
    logout() {
        try {
            if (this.currentUser) {
                Storage.logAction(this.currentUser.id, 'logout', {});
            }
            this.currentUser = null;
            localStorage.removeItem('session');
            sessionStorage.removeItem('session');
            
            // Fix: Clear any pending redirects
            if (window.redirectTimeout) {
                clearTimeout(window.redirectTimeout);
            }
            
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        }
    },
    
    checkSession() {
        // Don't run on login page
        if (window.location.pathname.includes('login.html')) {
            return true;
        }
        
        // Don't re-check if we already have a valid user
        if (this.currentUser) {
            return true;
        }
        
        try {
            const session = localStorage.getItem('session') || sessionStorage.getItem('session');
            if (session) {
                const sessionData = JSON.parse(session);
                if (Date.now() - sessionData.loginTime < this.sessionTimeout) {
                    this.currentUser = sessionData.user;
                    
                    // Update UI with user info
                    this.updateUserInterface();
                    return true;
                } else {
                    // Session expired
                    this.logout();
                    return false;
                }
            }
            
            // No session found, redirect to login for protected pages
            if (!window.location.pathname.includes('login.html') && 
                !window.location.pathname.includes('index.html')) {
                window.location.href = 'login.html';
            }
            return false;
        } catch (error) {
            console.warn('Session check error:', error);
            return false;
        }
    },
    
    updateUserInterface() {
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan && this.currentUser) {
            userNameSpan.textContent = this.currentUser.name;
        }
    },
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const permissions = {
            admin: ['*'],
            lecturer: ['view_results', 'enter_results', 'view_students'],
            student: ['view_own_results', 'view_transcript', 'view_profile'],
            exam_officer: ['view_all_results', 'approve_results', 'manage_courses']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    },
    
    redirectToDashboard(role) {
        // Fix: Small delay and clear any existing timeout
        if (window.redirectTimeout) {
            clearTimeout(window.redirectTimeout);
        }
        
        window.redirectTimeout = setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 150);
    },
    
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const remember = document.getElementById('rememberMe')?.checked || false;
                
                if (this.login(email, password, remember)) {
                    this.showToast('Login successful! Redirecting...', 'success');
                } else {
                    this.showToast('Invalid credentials. Please try again.', 'danger');
                }
            });
        }
        
        const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtn2');
        logoutBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.logout();
                });
            }
        });
        
        // Password toggle
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('bi-eye');
                    icon.classList.toggle('bi-eye-slash');
                }
            });
        });
    },
    
    showToast(message, type) {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `custom-toast alert alert-${type}`;
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
                <span>${message}</span>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            if (toast && toast.remove) {
                toast.remove();
            }
        }, 3000);
    }
};

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    // DOM already loaded, init immediately but with slight delay
    setTimeout(() => Auth.init(), 50);
}