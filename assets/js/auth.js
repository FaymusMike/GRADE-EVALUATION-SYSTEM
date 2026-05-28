// assets/js/auth.js - COMPLETE WITH REGISTRATION SYSTEM
const Auth = {
    currentUser: null,
    sessionTimeout: 3600000,
    
    init() {
        setTimeout(() => this.checkSession(), 100);
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.checkSession();
        });
        
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) setTimeout(() => this.checkSession(), 50);
        });
        
        this.setupEventListeners();
        this.setupRegistrationForm();
    },
    
    login(email, password, remember = false) {
        try {
            // Check in users table first (admin, lecturers, exam officers)
            let user = Storage.findOne('users', u => u.email === email && atob(u.password) === password && u.status === 'active');
            
            // Check in students table
            if (!user) {
                user = Storage.findOne('students', s => s.email === email && atob(s.password) === password && s.status === 'active');
            }
            
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
                
                this.logAction('login', { email: user.email });
                this.redirectToDashboard();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
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
            submittedAt: new Date().toISOString()
        };
        
        Storage.add('studentRegistrations', registration);
        
        // Notify admin
        this.addNotification('admin', 'New Student Registration', `${registrationData.name} has registered and is awaiting approval.`);
        
        return { success: true, message: 'Registration submitted for approval. You will be notified once approved.' };
    },
    
    approveStudentRegistration(registrationId) {
        const registration = Storage.findOne('studentRegistrations', r => r.id === registrationId);
        if (!registration) return false;
        
        // Create student account
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
            approvedAt: new Date().toISOString(),
            createdAt: registration.createdAt
        };
        
        Storage.add('students', student);
        Storage.delete('studentRegistrations', registrationId);
        
        // Notify student
        this.addNotification(student.id, 'Registration Approved', 'Your account has been approved. You can now log in.');
        
        return true;
    },
    
    rejectStudentRegistration(registrationId, reason) {
        const registration = Storage.findOne('studentRegistrations', r => r.id === registrationId);
        if (!registration) return false;
        
        // Notify student
        this.addNotification(registration.email, 'Registration Rejected', `Your registration was rejected. Reason: ${reason}`);
        
        Storage.delete('studentRegistrations', registrationId);
        return true;
    },
    
    requestProfileUpdate(studentId, updates) {
        const student = Storage.findOne('students', s => s.id === studentId);
        if (!student) return false;
        
        // Create profile update request
        const request = {
            id: Storage.generateId(),
            studentId,
            currentData: { ...student },
            requestedChanges: updates,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };
        
        Storage.add('profileUpdateRequests', request);
        
        // Notify admin
        this.addNotification('admin', 'Profile Update Request', `${student.name} has requested to update their profile.`);
        
        return { success: true, message: 'Profile update request submitted for approval.' };
    },
    
    approveProfileUpdate(requestId) {
        const request = Storage.findOne('profileUpdateRequests', r => r.id === requestId);
        if (!request) return false;
        
        // Apply updates to student
        Storage.update('students', request.studentId, request.requestedChanges);
        Storage.delete('profileUpdateRequests', requestId);
        
        // Notify student
        this.addNotification(request.studentId, 'Profile Updated', 'Your profile changes have been approved.');
        
        return true;
    },
    
    logout() {
        try {
            if (this.currentUser) {
                this.logAction('logout', {});
            }
            this.currentUser = null;
            localStorage.removeItem('session');
            sessionStorage.removeItem('session');
            
            if (window.redirectTimeout) clearTimeout(window.redirectTimeout);
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        }
    },
    
    checkSession() {
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
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
                    this.logout();
                    return false;
                }
            }
            
            if (!window.location.pathname.includes('index.html')) {
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
            lecturer: ['view_courses', 'enter_results', 'view_registered_students', 'submit_results'],
            student: ['view_results', 'register_courses', 'view_transcript', 'update_profile'],
            exam_officer: ['review_results', 'approve_results', 'publish_results', 'verify_transcripts']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    },
    
    redirectToDashboard() {
        if (window.redirectTimeout) clearTimeout(window.redirectTimeout);
        window.redirectTimeout = setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 150);
    },
    
    addNotification(userId, title, message) {
        Storage.add('notifications', {
            userId,
            title,
            message,
            read: false,
            timestamp: new Date().toISOString()
        });
    },
    
    logAction(action, details) {
        Storage.logAuditTrail('auth', this.currentUser?.id || 'system', { action, details }, {});
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
                    dateOfBirth: document.getElementById('dateOfBirth').value
                };
                
                // Handle passport upload
                const passportFile = document.getElementById('passport').files[0];
                if (passportFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        registrationData.passport = reader.result;
                        const result = this.registerStudent(registrationData);
                        this.showToast(result.message, result.success ? 'success' : 'danger');
                        if (result.success) {
                            setTimeout(() => window.location.href = 'login.html', 2000);
                        }
                    };
                    reader.readAsDataURL(passportFile);
                } else {
                    const result = this.registerStudent(registrationData);
                    this.showToast(result.message, result.success ? 'success' : 'danger');
                    if (result.success) {
                        setTimeout(() => window.location.href = 'login.html', 2000);
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
            <div class="d-flex align-items-center">
                <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
                <span>${message}</span>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
};

// Initialize auth
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    setTimeout(() => Auth.init(), 50);
}