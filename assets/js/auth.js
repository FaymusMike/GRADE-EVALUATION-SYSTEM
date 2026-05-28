// assets/js/auth.js - Authentication System
const Auth = {
    currentUser: null,
    sessionTimeout: 3600000, // 1 hour
    
    init() {
        this.checkSession();
        this.setupEventListeners();
    },
    
    login(email, password, remember = false) {
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
    },
    
    logout() {
        if (this.currentUser) {
            Storage.logAction(this.currentUser.id, 'logout', {});
        }
        this.currentUser = null;
        localStorage.removeItem('session');
        sessionStorage.removeItem('session');
        window.location.href = 'login.html';
    },
    
    checkSession() {
        const session = localStorage.getItem('session') || sessionStorage.getItem('session');
        if (session) {
            const sessionData = JSON.parse(session);
            if (Date.now() - sessionData.loginTime < this.sessionTimeout) {
                this.currentUser = sessionData.user;
                return true;
            } else {
                this.logout();
                return false;
            }
        }
        return false;
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
        window.location.href = 'dashboard.html';
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
            if (btn) btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
        
        // Password toggle
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                btn.querySelector('i').classList.toggle('bi-eye');
                btn.querySelector('i').classList.toggle('bi-eye-slash');
            });
        });
    },
    
    showToast(message, type) {
        const toastContainer = document.querySelector('.toast-container') || (() => {
            const div = document.createElement('div');
            div.className = 'toast-container';
            document.body.appendChild(div);
            return div;
        })();
        
        const toast = document.createElement('div');
        toast.className = `custom-toast alert alert-${type}`;
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                <span>${message}</span>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => Auth.init());