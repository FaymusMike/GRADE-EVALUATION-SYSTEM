// assets/js/auth.js - COMPLETE FIXED VERSION

const Auth = {
    currentUser: null,
    sessionTimeout: 3600000,
    sessionCheckInterval: null,
    
    init() {
        // Small delay to ensure storage is ready
        setTimeout(() => {
            this.checkSession();
            this.verifyDemoUsers();
        }, 100);
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                setTimeout(() => this.checkSession(), 50);
            }
        });
        
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && !window.location.pathname.includes('login.html')) {
                setTimeout(() => this.checkSession(), 50);
            }
        });
        
        this.setupEventListeners();
        this.setupRegistrationForm();
        this.startSessionChecker();
    },
    
    // Verify demo users exist and are accessible
    verifyDemoUsers() {
        const users = Storage.get('users');
        const students = Storage.get('students');
        
        console.log('=== VERIFYING DEMO USERS ===');
        console.log('Users found:', users.length);
        console.log('Students found:', students.length);
        
        // Test each user
        const testCredentials = [
            { email: 'admin@jpts.edu', password: 'admin123', type: 'admin' },
            { email: 'lecturer@jpts.edu', password: 'lecturer123', type: 'lecturer' },
            { email: 'student@jpts.edu', password: 'student123', type: 'student' },
            { email: 'exam.officer@jpts.edu', password: 'exam123', type: 'exam_officer' }
        ];
        
        testCredentials.forEach(cred => {
            let user = users.find(u => u.email === cred.email);
            if (!user) {
                user = students.find(s => s.email === cred.email);
            }
            if (user) {
                const decodedPassword = atob(user.password);
                console.log(`${cred.type}: ${cred.email} -> Password match: ${decodedPassword === cred.password ? 'YES ✓' : 'NO ✗'}`);
            } else {
                console.log(`${cred.type}: ${cred.email} -> NOT FOUND ✗`);
            }
        });
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
            console.log('Password length:', password.length);
            
            // Get fresh data from storage
            const users = Storage.get('users');
            const students = Storage.get('students');
            
            // Check in users table first
            let user = users.find(u => {
                const decodedPassword = atob(u.password);
                const match = u.email === email && decodedPassword === password && u.status === 'active';
                if (match) console.log('Found match in users table:', u.name, 'Role:', u.role);
                return match;
            });
            
            // Check in students table if not found
            if (!user) {
                user = students.find(s => {
                    const decodedPassword = atob(s.password);
                    const match = s.email === email && decodedPassword === password && s.status === 'active';
                    if (match) console.log('Found match in students table:', s.name);
                    return match;
                });
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
                
                // Update last login time
                if (user.role) {
                    Storage.update('users', user.id, { lastLogin: new Date().toISOString() });
                } else {
                    Storage.update('students', user.id, { lastLogin: new Date().toISOString() });
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
            role: 'student',
            submittedAt: new Date().toISOString()
        };
        
        Storage.add('studentRegistrations', registration);
        
        // Notify admin
        this.addNotification('admin', 'New Student Registration', `${registrationData.name} (${registrationData.matricNumber}) has registered and is awaiting approval.`);
        
        return { success: true, message: 'Registration submitted for approval. You will be notified once approved.' };
    },
    
    approveStudentRegistration(registrationId) {
        const registration = Storage.findOne('studentRegistrations', r => r.id === registrationId);
        if (!registration) return false;
        
        const student = {
            id: Storage.generateId(),
            name: registration.name,
            matricNumber: registration.matricNumber,
            email: registration.email,
            password: registration.password,
            department: registration.department,
            level: registration.level,
            semester: registration.semester,
            phone: registration.phone,
            address: registration.address,
            gender: registration.gender,
            dateOfBirth: registration.dateOfBirth,
            passport: registration.passport || '',
            status: 'active',
            role: 'student',
            approvedAt: new Date().toISOString(),
            createdAt: registration.createdAt
        };
        
        Storage.add('students', student);
        Storage.delete('studentRegistrations', registrationId);
        
        this.addNotification(student.id, 'Registration Approved', 'Your account has been approved. You can now log in.');
        this.addNotification('admin', 'Student Approved', `${student.name} has been approved.`);
        
        return true;
    },
    
    rejectStudentRegistration(registrationId, reason) {
        const registration = Storage.findOne('studentRegistrations', r => r.id === registrationId);
        if (!registration) return false;
        
        this.addNotification(registration.email, 'Registration Rejected', `Your registration was rejected. Reason: ${reason}`);
        Storage.delete('studentRegistrations', registrationId);
        return true;
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
                    return true;
                } else {
                    this.logout('Session expired. Please login again.');
                    return false;
                }
            }
            
            if (!currentPath.includes('login.html') && !currentPath.includes('index.html')) {
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
            userNameSpan.textContent = this.currentUser.name || this.currentUser.email;
        }
        this.updateNotificationBadge();
    },
    
    updateNotificationBadge() {
        const notifications = Storage.get('notifications').filter(n => n.userId === this.currentUser?.id && !n.read);
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = notifications.length;
            badge.style.display = notifications.length > 0 ? 'inline-block' : 'none';
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
    
    logAction(action, details) {
        const log = {
            id: Storage.generateId(),
            userId: this.currentUser?.id || 'system',
            userEmail: this.currentUser?.email || 'system',
            action: action,
            details: details,
            timestamp: new Date().toISOString()
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
        
        const logoutMessage = sessionStorage.getItem('logoutMessage');
        if (logoutMessage && window.location.pathname.includes('login.html')) {
            setTimeout(() => {
                this.showToast(logoutMessage, 'info');
                sessionStorage.removeItem('logoutMessage');
            }, 500);
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
        toast.className = `custom-toast alert alert-${type}`;
        toast.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close btn-sm"></button>
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

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => Auth.init(), 100);
    });
} else {
    setTimeout(() => Auth.init(), 100);
}

// Make Auth available globally
window.Auth = Auth;