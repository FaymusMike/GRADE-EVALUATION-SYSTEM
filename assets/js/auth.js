// assets/js/auth.js - PATCHED VERSION (only fixing the critical issues)
// Add this at the beginning of the file or replace the entire auth.js

const Auth = {
    currentUser: null,
    sessionTimeout: 3600000,
    sessionCheckInterval: null,
    
    init() {
        // Fix bfcache issues - prevent extension conflicts
        if (document.visibilityState === 'visible') {
            setTimeout(() => this.checkSession(), 100);
        }
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                setTimeout(() => this.checkSession(), 50);
            }
        });
        
        // Fix bfcache - pageshow event with proper handling
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Don't reload if we're on login page
                if (!window.location.pathname.includes('login.html')) {
                    setTimeout(() => this.checkSession(), 50);
                }
            }
        });
        
        this.setupEventListeners();
        this.setupRegistrationForm();
        this.startSessionChecker();
    },
    
    startSessionChecker() {
        if (this.sessionCheckInterval) clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = setInterval(() => {
            if (this.currentUser) {
                const session = localStorage.getItem('session') || sessionStorage.getItem('session');
                if (session) {
                    try {
                        const sessionData = JSON.parse(session);
                        if (Date.now() - sessionData.loginTime > this.sessionTimeout) {
                            this.logout('Session expired. Please login again.');
                        }
                    } catch (e) {}
                }
            }
        }, 60000);
    },
    
    login(email, password, remember = false) {
        try {
            console.log('Attempting login for:', email);
            
            // FIX: Check in users table (admin, lecturers, exam officers)
            let user = null;
            const users = Storage.get('users');
            user = users.find(u => u.email === email && atob(u.password) === password && u.status === 'active');
            
            // FIX: Check in students table if not found
            if (!user) {
                const students = Storage.get('students');
                user = students.find(s => s.email === email && atob(s.password) === password && s.status === 'active');
            }
            
            if (user) {
                console.log('Login successful for:', user.name, 'Role:', user.role || 'student');
                
                this.currentUser = user;
                const sessionData = {
                    user: { ...user, password: undefined },
                    loginTime: Date.now(),
                    remember,
                    role: user.role || (user.matricNumber ? 'student' : 'user')
                };
                
                if (remember) {
                    localStorage.setItem('session', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('session', JSON.stringify(sessionData));
                }
                
                this.logAction('login', { email: user.email, role: sessionData.role });
                this.redirectToDashboard();
                return true;
            }
            
            console.log('Login failed: No user found with those credentials');
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },
    
    redirectToDashboard() {
        if (window.redirectTimeout) clearTimeout(window.redirectTimeout);
        window.redirectTimeout = setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 200);
    },
    
    registerStudent(registrationData) {
        // Check if matric number already exists
        const existingStudent = Storage.findOne('students', s => s.matricNumber === registrationData.matricNumber);
        if (existingStudent) {
            return { success: false, message: 'Matric number already registered' };
        }
        
        // Check if email already exists
        const existingEmail = Storage.findOne('students', s => s.email === registrationData.email);
        if (existingEmail) {
            return { success: false, message: 'Email already registered' };
        }
        
        // Check if pending registration exists
        const pendingRegistration = Storage.findOne('studentRegistrations', r => r.matricNumber === registrationData.matricNumber);
        if (pendingRegistration) {
            return { success: false, message: 'Registration already pending approval' };
        }
        
        // Create pending registration
        const registration = {
            id: Storage.generateId(),
            ...registrationData,
            password: btoa(registrationData.password),
            status: 'pending',
            submittedAt: new Date().toISOString(),
            role: 'student'
        };
        
        Storage.add('studentRegistrations', registration);
        
        // Notify admin
        this.addNotification('admin', 'New Student Registration', `${registrationData.name} (${registrationData.matricNumber}) has registered and is awaiting approval.`);
        
        return { success: true, message: 'Registration submitted for approval. You will be notified once approved.' };
    },
    
    logout(message = null) {
        try {
            if (this.currentUser) {
                this.logAction('logout', {});
            }
            this.currentUser = null;
            localStorage.removeItem('session');
            sessionStorage.removeItem('session');
            
            if (this.sessionCheckInterval) {
                clearInterval(this.sessionCheckInterval);
            }
            
            if (window.redirectTimeout) clearTimeout(window.redirectTimeout);
            
            if (message) {
                sessionStorage.setItem('logoutMessage', message);
            }
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        }
    },
    
    checkSession() {
        // Don't run checks on login, register, or index pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('login.html') || currentPath.includes('register.html') || 
            currentPath.includes('forgot-password.html') || currentPath.includes('index.html')) {
            return true;
        }
        
        if (this.currentUser) return true;
        
        try {
            const session = localStorage.getItem('session') || sessionStorage.getItem('session');
            if (session) {
                const sessionData = JSON.parse(session);
                if (Date.now() - sessionData.loginTime < this.sessionTimeout) {
                    this.currentUser = sessionData.user;
                    this.updateUserInterface();
                    
                    // Check if current page is accessible for this role
                    const currentPage = currentPath.split('/').pop().replace('.html', '');
                    if (!this.validatePageAccess(currentPage, sessionData.role)) {
                        this.redirectToDashboard();
                    }
                    return true;
                } else {
                    this.logout('Session expired. Please login again.');
                    return false;
                }
            }
            
            // No session, redirect to login for protected pages
            if (!currentPath.includes('login.html') && !currentPath.includes('index.html')) {
                window.location.href = 'login.html';
            }
            return false;
        } catch (error) {
            console.warn('Session check error:', error);
            return false;
        }
    },
    
    validatePageAccess(page, role) {
        const rolePages = {
            admin: ['dashboard', 'students', 'lecturers', 'courses', 'results', 'admin-approvals', 'student-approvals', 'course-approvals', 'profile-approvals', 'transcript', 'reports', 'settings', 'profile'],
            lecturer: ['dashboard', 'my-courses', 'enter-results', 'my-students', 'transcript', 'profile'],
            student: ['dashboard', 'my-results', 'semester-gpa', 'course-registration', 'transcript', 'profile', 'notifications'],
            exam_officer: ['dashboard', 'results-review', 'approve-results', 'students', 'courses', 'reports', 'transcript']
        };
        
        const allowedPages = rolePages[role] || rolePages.student;
        return allowedPages.includes(page) || page === 'dashboard' || page === '';
    },
    
    updateUserInterface() {
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan && this.currentUser) {
            userNameSpan.textContent = this.currentUser.name || this.currentUser.email;
        }
        this.updateNotificationBadge();
    },
    
    updateNotificationBadge() {
        const notifications = Storage.get('notifications').filter(n => n.userId === this.currentUser?.id && !n.read);
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const count = notifications.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    },
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const permissions = {
            admin: ['*'],
            lecturer: ['view_courses', 'enter_results', 'view_registered_students', 'submit_results'],
            student: ['view_results', 'register_courses', 'view_transcript', 'update_profile'],
            exam_officer: ['review_results', 'approve_results', 'publish_results', 'verify_transcripts']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    },
    
    addNotification(userId, title, message) {
        const notification = {
            id: Storage.generateId(),
            userId: userId,
            title: title,
            message: message,
            read: false,
            timestamp: new Date().toISOString()
        };
        Storage.add('notifications', notification);
        this.updateNotificationBadge();
        return notification;
    },
    
    markNotificationRead(notificationId) {
        Storage.update('notifications', notificationId, { read: true });
        this.updateNotificationBadge();
    },
    
    logAction(action, details) {
        const log = {
            id: Storage.generateId(),
            userId: this.currentUser?.id || 'system',
            userEmail: this.currentUser?.email || 'system',
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            ip: 'simulated'
        };
        const logs = Storage.get('auditLogs');
        logs.push(log);
        Storage.set('auditLogs', logs);
    },
    
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value.trim();
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
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const input = this.previousElementSibling;
                if (input && input.tagName === 'INPUT') {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('bi-eye');
                        icon.classList.toggle('bi-eye-slash');
                    }
                }
            });
        });
        
        // Check for logout message
        const logoutMessage = sessionStorage.getItem('logoutMessage');
        if (logoutMessage && window.location.pathname.includes('login.html')) {
            setTimeout(() => {
                this.showToast(logoutMessage, 'info');
                sessionStorage.removeItem('logoutMessage');
            }, 500);
        }
        
        // Fix registration button click
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'register.html';
            });
        }
    },
    
    setupRegistrationForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (password !== confirmPassword) {
                    this.showToast('Passwords do not match', 'danger');
                    return;
                }
                
                if (password.length < 8) {
                    this.showToast('Password must be at least 8 characters', 'warning');
                    return;
                }
                
                const registrationData = {
                    name: document.getElementById('fullName').value,
                    matricNumber: document.getElementById('matricNumber').value,
                    email: document.getElementById('email').value,
                    password: password,
                    department: document.getElementById('department').value,
                    level: document.getElementById('level').value,
                    semester: document.getElementById('semester').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value,
                    gender: document.getElementById('gender').value,
                    dateOfBirth: document.getElementById('dateOfBirth').value,
                    session: document.getElementById('session')?.value || '2023/2024'
                };
                
                // Handle passport upload
                const passportFile = document.getElementById('passport')?.files[0];
                if (passportFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        registrationData.passport = reader.result;
                        const result = this.registerStudent(registrationData);
                        this.showToast(result.message, result.success ? 'success' : 'danger');
                        if (result.success) {
                            setTimeout(() => window.location.href = 'login.html', 3000);
                        }
                    };
                    reader.readAsDataURL(passportFile);
                } else {
                    const result = this.registerStudent(registrationData);
                    this.showToast(result.message, result.success ? 'success' : 'danger');
                    if (result.success) {
                        setTimeout(() => window.location.href = 'login.html', 3000);
                    }
                }
            });
        }
    },
    
    showToast(message, type) {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `custom-toast alert alert-${type} fade-in`;
        toast.style.cssText = 'animation: slideInRight 0.3s ease;';
        toast.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <i class="bi bi-${type === 'success' ? 'check-circle-fill' : type === 'danger' ? 'exclamation-triangle-fill' : 'info-circle-fill'} me-2"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close btn-sm" style="font-size: 0.75rem;"></button>
            </div>
        `;
        
        const closeBtn = toast.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => toast.remove());
        
        toastContainer.appendChild(toast);
        setTimeout(() => {
            if (toast && toast.remove) toast.remove();
        }, 5000);
    }
};

// Initialize auth when DOM is ready - with bfcache protection
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => Auth.init(), 100);
    });
} else {
    setTimeout(() => Auth.init(), 100);
}