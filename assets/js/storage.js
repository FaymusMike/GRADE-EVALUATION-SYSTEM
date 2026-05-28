// assets/js/storage.js - COMPLETE REDESIGNED DATABASE
const Storage = {
    // Initialize database with proper relationships
    init() {
        const dbStructure = {
            // Users with roles
            users: [
                { id: '1', name: 'Admin User', email: 'admin@jpts.edu', password: btoa('admin123'), role: 'admin', department: 'Administration', status: 'active', createdAt: new Date().toISOString() },
                { id: '2', name: 'Dr. John Smith', email: 'lecturer@jpts.edu', password: btoa('lecturer123'), role: 'lecturer', department: 'Computer Science', staffId: 'LEC001', status: 'active', createdAt: new Date().toISOString() },
                { id: '3', name: 'Dr. Sarah Johnson', email: 'exam.officer@jpts.edu', password: btoa('exam123'), role: 'exam_officer', department: 'Academic Affairs', staffId: 'EX001', status: 'active', createdAt: new Date().toISOString() }
            ],
            
            // Student registrations (pending approval first)
            studentRegistrations: [],
            
            // Approved students
            students: [
                { id: 'stud1', name: 'Jane Doe', matricNumber: 'JPT/2024/001', email: 'student@jpts.edu', password: btoa('student123'), department: 'Computer Science', level: '100', semester: 'First', phone: '08012345678', address: '123 Campus Road', gender: 'Female', dateOfBirth: '2000-01-01', passport: '', status: 'active', approvedAt: new Date().toISOString(), createdAt: new Date().toISOString() }
            ],
            
            // Lecturers
            lecturers: [
                { id: 'lec1', name: 'Dr. John Smith', staffId: 'LEC001', email: 'lecturer@jpts.edu', department: 'Computer Science', phone: '08012345678', assignedCourses: ['course1', 'course2'], status: 'active', createdAt: new Date().toISOString() }
            ],
            
            // Courses
            courses: [
                { id: 'course1', code: 'CSC101', title: 'Introduction to Programming', creditUnit: 3, department: 'Computer Science', level: '100', semester: 'First', lecturerId: 'lec1', status: 'active', prerequisites: [], isCompulsory: true, createdAt: new Date().toISOString() },
                { id: 'course2', code: 'CSC102', title: 'Discrete Mathematics', creditUnit: 3, department: 'Computer Science', level: '100', semester: 'First', lecturerId: 'lec1', status: 'active', prerequisites: [], isCompulsory: true, createdAt: new Date().toISOString() },
                { id: 'course3', code: 'GST101', title: 'Use of English', creditUnit: 2, department: 'Computer Science', level: '100', semester: 'First', lecturerId: null, status: 'active', prerequisites: [], isCompulsory: true, createdAt: new Date().toISOString() }
            ],
            
            // Course registrations (with approval workflow)
            courseRegistrations: [],
            
            // Results with full lifecycle
            results: [],
            
            // Academic sessions
            sessions: [
                { id: 'session1', name: '2023/2024', current: true, semester: 'First', registrationOpen: true, registrationDeadline: '2024-12-31', resultPublicationStart: '2025-01-15', resultPublicationEnd: '2025-02-15', createdAt: new Date().toISOString() }
            ],
            
            // Departments
            departments: ['Computer Science', 'Engineering', 'Business Administration', 'Medicine', 'Law'],
            
            // Levels
            levels: ['100', '200', '300', '400', '500'],
            
            // Notifications
            notifications: [],
            
            // Profile update requests
            profileUpdateRequests: [],
            
            // Audit logs
            auditLogs: [],
            
            // Transcript requests
            transcriptRequests: [],
            
            // Payment records (simulation)
            payments: []
        };
        
        for (const [key, defaultValue] of Object.entries(dbStructure)) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(defaultValue));
            }
        }
    },
    
    // Generic CRUD operations
    get(collection) {
        try {
            const data = localStorage.getItem(collection);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${collection}:`, error);
            return [];
        }
    },
    
    set(collection, data) {
        try {
            localStorage.setItem(collection, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error writing to ${collection}:`, error);
            return false;
        }
    },
    
    add(collection, item) {
        const items = this.get(collection);
        item.id = this.generateId();
        item.createdAt = new Date().toISOString();
        items.push(item);
        this.set(collection, items);
        return item;
    },
    
    update(collection, id, updates) {
        const items = this.get(collection);
        const index = items.findIndex(item => item.id == id);
        if (index !== -1) {
            // Log the change for audit trail
            const oldValue = { ...items[index] };
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(collection, items);
            
            // Add to audit log for important collections
            if (['results', 'students', 'courseRegistrations'].includes(collection)) {
                this.logAuditTrail(collection, id, oldValue, items[index]);
            }
            return true;
        }
        return false;
    },
    
    delete(collection, id) {
        const items = this.get(collection);
        const filtered = items.filter(item => item.id != id);
        this.set(collection, filtered);
        return true;
    },
    
    find(collection, predicate) {
        return this.get(collection).filter(predicate);
    },
    
    findOne(collection, predicate) {
        return this.get(collection).find(predicate);
    },
    
    generateId() {
        return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Generate matric number
    generateMatricNumber(department, level) {
        const year = new Date().getFullYear();
        const deptCode = department.substring(0, 3).toUpperCase();
        const count = this.get('students').length + 1;
        return `JPT/${year}/${deptCode}/${String(count).padStart(4, '0')}`;
    },
    
    // Audit trail logging
    logAuditTrail(collection, recordId, oldValue, newValue) {
        const auditLog = {
            id: this.generateId(),
            collection,
            recordId,
            action: 'UPDATE',
            oldValue: JSON.stringify(oldValue),
            newValue: JSON.stringify(newValue),
            userId: this.getCurrentUserId(),
            timestamp: new Date().toISOString(),
            ip: 'simulated'
        };
        
        const logs = this.get('auditLogs');
        logs.push(auditLog);
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
        const backup = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.includes('session')) {
                backup[key] = localStorage.getItem(key);
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
    
    restore(backupData) {
        try {
            const data = JSON.parse(backupData);
            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, value);
            }
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    },
    
    // Get current session
    getCurrentSession() {
        return this.findOne('sessions', s => s.current === true);
    },
    
    // Check if registration is open
    isRegistrationOpen() {
        const session = this.getCurrentSession();
        if (!session) return false;
        return session.registrationOpen && new Date() <= new Date(session.registrationDeadline);
    }
};

// Initialize storage on load
Storage.init();