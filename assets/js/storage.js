// assets/js/storage.js - COMPLETE FIXED VERSION with verified user data

const Storage = {
    // Database version for migrations
    DB_VERSION: '2.0.1',
    
    // Initialize database with proper relationships
    init() {
        // CRITICAL FIX: Verify and reset user data if corrupted
        const existingUsers = localStorage.getItem('users');
        let needsReset = false;
        
        if (existingUsers) {
            try {
                const users = JSON.parse(existingUsers);
                // Check if users exist and have proper passwords
                if (!users.length || users.length === 0) {
                    needsReset = true;
                } else {
                    // Verify each user has proper password encoding
                    users.forEach(user => {
                        if (!user.password || user.password.length < 10) {
                            needsReset = true;
                        }
                    });
                }
            } catch (e) {
                needsReset = true;
            }
        } else {
            needsReset = true;
        }
        
        const dbStructure = {
            // ============ CORE USER TABLES ============
            // Users table (admin, lecturers, exam officers) - FIXED PASSWORDS
            users: [
                { 
                    id: '1', 
                    name: 'Admin User', 
                    email: 'admin@jpts.edu', 
                    password: btoa('admin123'), 
                    role: 'admin', 
                    department: 'Administration', 
                    staffId: 'ADM001',
                    status: 'active',
                    phone: '08012345678',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    avatar: null
                },
                { 
                    id: '2', 
                    name: 'Dr. John Smith', 
                    email: 'lecturer@jpts.edu', 
                    password: btoa('lecturer123'), 
                    role: 'lecturer', 
                    department: 'Computer Science', 
                    staffId: 'LEC001',
                    status: 'active',
                    phone: '08023456789',
                    qualification: 'PhD Computer Science',
                    specialization: 'Software Engineering',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    avatar: null
                },
                { 
                    id: '3', 
                    name: 'Dr. Sarah Johnson', 
                    email: 'exam.officer@jpts.edu', 
                    password: btoa('exam123'), 
                    role: 'exam_officer', 
                    department: 'Academic Affairs', 
                    staffId: 'EX001',
                    status: 'active',
                    phone: '08034567890',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    avatar: null
                }
            ],
            
            // Student registrations (pending approval workflow)
            studentRegistrations: [],
            
            // Students table (approved students only) - FIXED PASSWORD
            students: [
                { 
                    id: 'stud1', 
                    name: 'Jane Doe', 
                    matricNumber: 'JPT/2024/001', 
                    email: 'student@jpts.edu', 
                    password: btoa('student123'), 
                    department: 'Computer Science', 
                    level: '100', 
                    semester: 'First',
                    session: '2023/2024',
                    phone: '08045678901',
                    address: '123 Campus Road, Lagos',
                    gender: 'Female',
                    dateOfBirth: '2000-01-01',
                    passport: '',
                    status: 'active',
                    role: 'student',
                    guardianName: 'Mr. John Doe',
                    guardianPhone: '08056789012',
                    emergencyContact: '08067890123',
                    bloodGroup: 'O+',
                    approvedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: null
                }
            ],
            
            // Lecturers
            lecturers: [
                { 
                    id: 'lec1', 
                    name: 'Dr. John Smith', 
                    staffId: 'LEC001', 
                    email: 'lecturer@jpts.edu', 
                    department: 'Computer Science', 
                    phone: '08023456789',
                    qualification: 'PhD',
                    specialization: 'Software Engineering',
                    assignedCourses: ['course1', 'course2'], 
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    updatedAt: null
                }
            ],
            
            // Courses
            courses: [
                { 
                    id: 'course1', 
                    code: 'CSC101', 
                    title: 'Introduction to Programming', 
                    creditUnit: 3, 
                    department: 'Computer Science', 
                    level: '100', 
                    semester: 'First', 
                    lecturerId: 'lec1',
                    lecturerName: 'Dr. John Smith',
                    status: 'active', 
                    prerequisites: [], 
                    isCompulsory: true,
                    capacity: 100,
                    enrolledCount: 0,
                    description: 'Fundamentals of programming using Python',
                    createdAt: new Date().toISOString(),
                    updatedAt: null
                },
                { 
                    id: 'course2', 
                    code: 'CSC102', 
                    title: 'Discrete Mathematics', 
                    creditUnit: 3, 
                    department: 'Computer Science', 
                    level: '100', 
                    semester: 'First', 
                    lecturerId: 'lec1',
                    lecturerName: 'Dr. John Smith',
                    status: 'active', 
                    prerequisites: [], 
                    isCompulsory: true,
                    capacity: 100,
                    enrolledCount: 0,
                    description: 'Mathematical foundations for computing',
                    createdAt: new Date().toISOString(),
                    updatedAt: null
                },
                { 
                    id: 'course3', 
                    code: 'GST101', 
                    title: 'Use of English', 
                    creditUnit: 2, 
                    department: 'General Studies', 
                    level: '100', 
                    semester: 'First', 
                    lecturerId: null,
                    lecturerName: 'Not Assigned',
                    status: 'active', 
                    prerequisites: [], 
                    isCompulsory: true,
                    capacity: 200,
                    enrolledCount: 0,
                    description: 'English language and communication skills',
                    createdAt: new Date().toISOString(),
                    updatedAt: null
                }
            ],
            
            // Course registrations
            courseRegistrations: [],
            
            // Results table
            results: [],
            
            // Academic sessions
            sessions: [
                { 
                    id: 'session1', 
                    name: '2023/2024', 
                    current: true, 
                    semester: 'First',
                    semesterType: 'Harmattan',
                    startDate: '2023-09-01',
                    endDate: '2024-06-30',
                    registrationOpen: true, 
                    registrationDeadline: '2024-12-31',
                    registrationStartDate: '2024-09-01',
                    addDropDeadline: '2024-10-15',
                    resultPublicationStart: '2025-01-15', 
                    resultPublicationEnd: '2025-02-15',
                    examStartDate: '2024-12-01',
                    examEndDate: '2024-12-20',
                    createdAt: new Date().toISOString()
                }
            ],
            
            // Departments
            departments: [
                { id: 'dept1', name: 'Computer Science', code: 'CSC', faculty: 'Engineering', hod: 'lec1', studentCount: 1 },
                { id: 'dept2', name: 'Engineering', code: 'ENG', faculty: 'Engineering', hod: null, studentCount: 0 },
                { id: 'dept3', name: 'Business Administration', code: 'BUS', faculty: 'Management Sciences', hod: null, studentCount: 0 },
                { id: 'dept4', name: 'Medicine', code: 'MED', faculty: 'Health Sciences', hod: null, studentCount: 0 },
                { id: 'dept5', name: 'Law', code: 'LAW', faculty: 'Law', hod: null, studentCount: 0 }
            ],
            
            // Levels
            levels: [
                { id: 100, name: '100 Level', shortName: 'Freshman', minCredits: 12, maxCredits: 18 },
                { id: 200, name: '200 Level', shortName: 'Sophomore', minCredits: 12, maxCredits: 18 },
                { id: 300, name: '300 Level', shortName: 'Junior', minCredits: 12, maxCredits: 21 },
                { id: 400, name: '400 Level', shortName: 'Senior', minCredits: 12, maxCredits: 21 },
                { id: 500, name: '500 Level', shortName: 'Graduate', minCredits: 9, maxCredits: 15 }
            ],
            
            // Grade system configuration
            gradeSystem: [
                { min: 70, max: 100, grade: 'A', points: 5.0, remark: 'Excellent' },
                { min: 60, max: 69, grade: 'B', points: 4.0, remark: 'Very Good' },
                { min: 50, max: 59, grade: 'C', points: 3.0, remark: 'Good' },
                { min: 45, max: 49, grade: 'D', points: 2.0, remark: 'Fair' },
                { min: 40, max: 44, grade: 'E', points: 1.0, remark: 'Pass' },
                { min: 0, max: 39, grade: 'F', points: 0.0, remark: 'Fail' }
            ],
            
            // Notifications
            notifications: [],
            
            // Profile update requests
            profileUpdateRequests: [],
            
            // Audit logs
            auditLogs: [],
            
            // Transcript requests
            transcriptRequests: [],
            
            // Payment records
            payments: [],
            
            // Result approval workflow tracking
            resultApprovals: [],
            
            // Course approval workflow tracking
            courseApprovals: [],
            
            // System settings
            systemSettings: [
                { key: 'institutionName', value: 'JPTS Institute', category: 'general' },
                { key: 'institutionAddress', value: '123 Academic Road, Lagos, Nigeria', category: 'general' },
                { key: 'institutionPhone', value: '+234 123 456 7890', category: 'general' },
                { key: 'institutionEmail', value: 'info@jpts.edu', category: 'general' },
                { key: 'currentSession', value: 'session1', category: 'academic' },
                { key: 'minCredits', value: '12', category: 'registration' },
                { key: 'maxCredits', value: '24', category: 'registration' },
                { key: 'passMark', value: '40', category: 'grading' },
                { key: 'maintenanceMode', value: 'false', category: 'system' },
                { key: 'theme', value: 'light', category: 'ui' }
            ],
            
            // Backup metadata
            backups: []
        };
        
        // Initialize or reset all collections
        if (needsReset) {
            console.log('Resetting database with fresh data...');
            localStorage.clear();
        }
        
        for (const [key, defaultValue] of Object.entries(dbStructure)) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(defaultValue));
                console.log(`Initialized collection: ${key}`);
            }
        }
        
        // Verify users were properly created
        const verifyUsers = JSON.parse(localStorage.getItem('users'));
        console.log('Users in database:', verifyUsers.map(u => ({ email: u.email, role: u.role, hasPassword: !!u.password })));
        
        // Run migrations if needed
        this.runMigrations();
    },
    
    // Run database migrations
    runMigrations() {
        const currentVersion = localStorage.getItem('db_version');
        if (currentVersion !== this.DB_VERSION) {
            console.log(`Upgrading database from ${currentVersion} to ${this.DB_VERSION}`);
            localStorage.setItem('db_version', this.DB_VERSION);
        }
    },
    
    // Get all records from a collection
    get(collection) {
        try {
            const data = localStorage.getItem(collection);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${collection}:`, error);
            return [];
        }
    },
    
    // Set entire collection
    set(collection, data) {
        try {
            localStorage.setItem(collection, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error writing to ${collection}:`, error);
            return false;
        }
    },
    
    // Add a new record with auto-generated ID
    add(collection, item) {
        const items = this.get(collection);
        item.id = this.generateId();
        item.createdAt = new Date().toISOString();
        items.push(item);
        this.set(collection, items);
        return item;
    },
    
    // Update an existing record
    update(collection, id, updates) {
        const items = this.get(collection);
        const index = items.findIndex(item => item.id == id);
        
        if (index !== -1) {
            const oldValue = { ...items[index] };
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(collection, items);
            
            if (['results', 'students', 'courseRegistrations', 'users'].includes(collection)) {
                this.logAuditTrail(collection, id, oldValue, items[index]);
            }
            return true;
        }
        return false;
    },
    
    // Delete a record
    delete(collection, id) {
        const items = this.get(collection);
        const filtered = items.filter(item => item.id != id);
        this.set(collection, filtered);
        return true;
    },
    
    // Find records by predicate
    find(collection, predicate) {
        return this.get(collection).filter(predicate);
    },
    
    // Find single record by predicate
    findOne(collection, predicate) {
        return this.get(collection).find(predicate);
    },
    
    // Find by ID
    findById(collection, id) {
        return this.get(collection).find(item => item.id == id);
    },
    
    // Generate unique ID
    generateId() {
        return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Get current session
    getCurrentSession() {
        return this.findOne('sessions', s => s.current === true);
    },
    
    isRegistrationOpen() {
        const session = this.getCurrentSession();
        if (!session) return false;
        return session.registrationOpen;
    },
    
    // Audit trail logging
    logAuditTrail(collection, recordId, oldValue, newValue) {
        const auditLog = {
            id: this.generateId(),
            collection,
            recordId,
            action: newValue ? (oldValue ? 'UPDATE' : 'CREATE') : 'DELETE',
            oldValue: oldValue ? JSON.stringify(oldValue) : null,
            newValue: newValue ? JSON.stringify(newValue) : null,
            userId: this.getCurrentUserId(),
            timestamp: new Date().toISOString()
        };
        
        const logs = this.get('auditLogs');
        logs.push(auditLog);
        if (logs.length > 1000) logs.shift();
        this.set('auditLogs', logs);
    },
    
    getCurrentUserId() {
        try {
            const session = localStorage.getItem('session') || sessionStorage.getItem('session');
            if (session) {
                const sessionData = JSON.parse(session);
                return sessionData.user?.id || 'system';
            }
        } catch (e) {}
        return 'system';
    },
    
    // Backup system
    backup() {
        const backup = {
            version: this.DB_VERSION,
            timestamp: new Date().toISOString(),
            data: {}
        };
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.includes('session')) {
                backup.data[key] = localStorage.getItem(key);
            }
        }
        
        const backupStr = JSON.stringify(backup);
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jpts_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    },
    
    // Clear all data (reset system)
    clearAllData() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.includes('session')) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
        this.init();
        return true;
    },
    
    // Get storage usage percentage
    getStorageUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            total += (key?.length || 0) + (value?.length || 0);
        }
        const maxStorage = 5 * 1024 * 1024;
        return Math.min((total / maxStorage) * 100, 100);
    }
};

// Initialize storage immediately
Storage.init();

// Make Storage available globally
window.Storage = Storage;