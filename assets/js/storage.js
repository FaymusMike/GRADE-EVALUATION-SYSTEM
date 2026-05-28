// assets/js/storage.js - COMPLETE ENHANCED RELATIONAL DATABASE STRUCTURE
// Simulates a real database with relationships, foreign keys, and data integrity

const Storage = {
    // Database version for migrations
    DB_VERSION: '2.0.0',
    
    // Initialize database with proper relationships and foreign keys
    init() {
        const dbStructure = {
            // ============ CORE USER TABLES ============
            // Users table (admin, lecturers, exam officers)
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
            
            // Students table (approved students only)
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
                    guardianName: 'Mr. John Doe',
                    guardianPhone: '08056789012',
                    emergencyContact: '08067890123',
                    bloodGroup: 'O+',
                    approvedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: null
                }
            ],
            
            // ============ ACADEMIC TABLES ============
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
            
            // Courses with foreign keys to departments, lecturers
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
            
            // Course registrations (junction table between students and courses)
            courseRegistrations: [],
            
            // Results table with foreign keys to students, courses, sessions
            results: [],
            
            // ============ ACADEMIC CALENDAR TABLES ============
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
            
            // ============ REFERENCE TABLES ============
            // Departments
            departments: [
                { id: 'dept1', name: 'Computer Science', code: 'CSC', faculty: 'Engineering', hod: 'lec1', studentCount: 0 },
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
            
            // ============ WORKFLOW TABLES ============
            // Notifications
            notifications: [],
            
            // Profile update requests (approval workflow)
            profileUpdateRequests: [],
            
            // Audit logs for tracking all changes
            auditLogs: [],
            
            // Transcript requests
            transcriptRequests: [],
            
            // Payment records (simulation)
            payments: [],
            
            // Result approval workflow tracking
            resultApprovals: [],
            
            // Course approval workflow tracking
            courseApprovals: [],
            
            // ============ SYSTEM TABLES ============
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
        
        // Initialize all collections if they don't exist
        for (const [key, defaultValue] of Object.entries(dbStructure)) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(defaultValue));
            }
        }
        
        // Run migrations if needed
        this.runMigrations();
    },
    
    // Run database migrations
    runMigrations() {
        const currentVersion = localStorage.getItem('db_version');
        if (currentVersion !== this.DB_VERSION) {
            console.log(`Upgrading database from ${currentVersion} to ${this.DB_VERSION}`);
            // Add migration logic here if needed
            localStorage.setItem('db_version', this.DB_VERSION);
        }
    },
    
    // ============ CRUD OPERATIONS ============
    
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
        
        // Update related counts if needed
        this.updateRelatedCounts(collection, item, 'add');
        
        return item;
    },
    
    // Update an existing record
    update(collection, id, updates) {
        const items = this.get(collection);
        const index = items.findIndex(item => item.id == id);
        
        if (index !== -1) {
            // Store old value for audit
            const oldValue = { ...items[index] };
            
            // Apply updates
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(collection, items);
            
            // Add to audit log for important collections
            if (['results', 'students', 'courseRegistrations', 'users'].includes(collection)) {
                this.logAuditTrail(collection, id, oldValue, items[index]);
            }
            
            // Update related counts
            this.updateRelatedCounts(collection, items[index], 'update', oldValue);
            
            return true;
        }
        return false;
    },
    
    // Delete a record
    delete(collection, id) {
        const items = this.get(collection);
        const deletedItem = items.find(item => item.id == id);
        const filtered = items.filter(item => item.id != id);
        this.set(collection, filtered);
        
        // Log deletion
        if (deletedItem) {
            this.logAuditTrail(collection, id, deletedItem, null);
            this.updateRelatedCounts(collection, deletedItem, 'delete');
        }
        
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
    
    // ============ RELATIONAL QUERIES ============
    
    // Get students for a specific course
    getStudentsForCourse(courseId, sessionId) {
        const registrations = this.get('courseRegistrations').filter(reg => 
            reg.courseId === courseId && reg.sessionId === sessionId && reg.status === 'approved'
        );
        return registrations.map(reg => this.findById('students', reg.studentId)).filter(s => s);
    },
    
    // Get courses for a specific student
    getCoursesForStudent(studentId, sessionId) {
        const registrations = this.get('courseRegistrations').filter(reg => 
            reg.studentId === studentId && reg.sessionId === sessionId && reg.status === 'approved'
        );
        return registrations.map(reg => this.findById('courses', reg.courseId)).filter(c => c);
    },
    
    // Get results for a student
    getStudentResults(studentId, sessionId = null) {
        let results = this.get('results').filter(r => r.studentId === studentId && r.status === 'published');
        if (sessionId) {
            results = results.filter(r => r.sessionId === sessionId);
        }
        return results;
    },
    
    // Get results for a course
    getCourseResults(courseId, sessionId) {
        return this.get('results').filter(r => r.courseId === courseId && r.sessionId === sessionId);
    },
    
    // Calculate GPA for a student
    calculateStudentGPA(studentId, sessionId) {
        const results = this.getStudentResults(studentId, sessionId);
        const courses = this.get('courses');
        
        let totalPoints = 0;
        let totalCredits = 0;
        
        results.forEach(result => {
            const course = courses.find(c => c.id === result.courseId);
            if (course) {
                totalPoints += (result.gradePoints || 0) * course.creditUnit;
                totalCredits += course.creditUnit;
            }
        });
        
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    },
    
    // Calculate CGPA for a student (all sessions)
    calculateStudentCGPA(studentId) {
        const allResults = this.getStudentResults(studentId);
        const courses = this.get('courses');
        
        let totalPoints = 0;
        let totalCredits = 0;
        
        allResults.forEach(result => {
            const course = courses.find(c => c.id === result.courseId);
            if (course) {
                totalPoints += (result.gradePoints || 0) * course.creditUnit;
                totalCredits += course.creditUnit;
            }
        });
        
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    },
    
    // Get dashboard statistics
    getDashboardStats() {
        const students = this.get('students');
        const lecturers = this.get('lecturers');
        const courses = this.get('courses');
        const results = this.get('results');
        
        return {
            totalStudents: students.length,
            totalLecturers: lecturers.length,
            totalCourses: courses.length,
            totalResults: results.length,
            publishedResults: results.filter(r => r.status === 'published').length,
            pendingResults: results.filter(r => r.status === 'submitted').length,
            approvedResults: results.filter(r => r.status === 'approved').length,
            activeStudents: students.filter(s => s.status === 'active').length,
            activeCourses: courses.filter(c => c.status === 'active').length,
            pendingRegistrations: this.get('studentRegistrations').filter(r => r.status === 'pending').length,
            pendingCourseRegistrations: this.get('courseRegistrations').filter(r => r.status === 'pending').length
        };
    },
    
    // ============ UPDATE RELATED COUNTS ============
    updateRelatedCounts(collection, item, action, oldItem = null) {
        // Update course enrollment count
        if (collection === 'courseRegistrations' && item.status === 'approved' && action === 'add') {
            const course = this.findById('courses', item.courseId);
            if (course) {
                this.update('courses', course.id, { enrolledCount: (course.enrolledCount || 0) + 1 });
            }
        } else if (collection === 'courseRegistrations' && action === 'delete') {
            const course = this.findById('courses', item.courseId);
            if (course) {
                this.update('courses', course.id, { enrolledCount: Math.max(0, (course.enrolledCount || 0) - 1) });
            }
        }
        
        // Update department student count
        if (collection === 'students' && action === 'add') {
            const department = this.findOne('departments', d => d.name === item.department);
            if (department) {
                this.update('departments', department.id, { studentCount: (department.studentCount || 0) + 1 });
            }
        } else if (collection === 'students' && action === 'delete') {
            const department = this.findOne('departments', d => d.name === item.department);
            if (department) {
                this.update('departments', department.id, { studentCount: Math.max(0, (department.studentCount || 0) - 1) });
            }
        }
    },
    
    // ============ AUDIT & LOGGING ============
    logAuditTrail(collection, recordId, oldValue, newValue) {
        const auditLog = {
            id: this.generateId(),
            collection,
            recordId,
            action: newValue ? (oldValue ? 'UPDATE' : 'CREATE') : 'DELETE',
            oldValue: oldValue ? JSON.stringify(oldValue) : null,
            newValue: newValue ? JSON.stringify(newValue) : null,
            userId: this.getCurrentUserId(),
            userEmail: this.getCurrentUserEmail(),
            timestamp: new Date().toISOString(),
            ip: 'simulated'
        };
        
        const logs = this.get('auditLogs');
        logs.push(auditLog);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.shift();
        }
        
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
    
    getCurrentUserEmail() {
        try {
            const session = localStorage.getItem('session') || sessionStorage.getItem('session');
            if (session) {
                const sessionData = JSON.parse(session);
                return sessionData.user?.email || 'system';
            }
        } catch (e) {}
        return 'system';
    },
    
    // ============ SESSION MANAGEMENT ============
    getCurrentSession() {
        return this.findOne('sessions', s => s.current === true);
    },
    
    setCurrentSession(sessionId) {
        const sessions = this.get('sessions');
        sessions.forEach(s => {
            s.current = (s.id === sessionId);
        });
        this.set('sessions', sessions);
    },
    
    isRegistrationOpen() {
        const session = this.getCurrentSession();
        if (!session) return false;
        const now = new Date();
        const deadline = new Date(session.registrationDeadline);
        return session.registrationOpen && now <= deadline;
    },
    
    // ============ BACKUP & RESTORE ============
    backup() {
        const backup = {
            version: this.DB_VERSION,
            timestamp: new Date().toISOString(),
            data: {}
        };
        
        // Exclude sessions from backup for security
        const excludeCollections = ['session'];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !excludeCollections.includes(key) && !key.includes('session')) {
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
        
        // Save backup metadata
        const backups = this.get('backups');
        backups.push({
            id: this.generateId(),
            filename: `jpts_backup_${new Date().toISOString().split('T')[0]}.json`,
            size: blob.size,
            createdAt: new Date().toISOString()
        });
        this.set('backups', backups);
        
        return true;
    },
    
    restore(backupData) {
        try {
            const backup = JSON.parse(backupData);
            
            // Validate backup version
            if (!backup.version || !backup.data) {
                throw new Error('Invalid backup file format');
            }
            
            // Restore each collection
            for (const [key, value] of Object.entries(backup.data)) {
                localStorage.setItem(key, value);
            }
            
            this.logAuditTrail('system', 'restore', null, { version: backup.version });
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    },
    
    // ============ DATA VALIDATION ============
    validateMatricNumber(matricNumber) {
        // Format: JPT/YYYY/XXX or JPT/YYYY/DEPT/XXXX
        const pattern = /^JPT\/\d{4}\/([A-Z]{3}\/)?\d{3,4}$/;
        return pattern.test(matricNumber);
    },
    
    validateEmail(email) {
        const pattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return pattern.test(email);
    },
    
    isMatricNumberUnique(matricNumber, excludeId = null) {
        const students = this.get('students');
        const existing = students.find(s => s.matricNumber === matricNumber && s.id !== excludeId);
        return !existing;
    },
    
    isEmailUnique(email, excludeId = null) {
        const students = this.get('students');
        const users = this.get('users');
        const existingStudent = students.find(s => s.email === email && s.id !== excludeId);
        const existingUser = users.find(u => u.email === email && u.id !== excludeId);
        return !existingStudent && !existingUser;
    },
    
    // ============ UTILITY FUNCTIONS ============
    generateMatricNumber(department, level) {
        const year = new Date().getFullYear();
        const deptCode = department.substring(0, 3).toUpperCase();
        const students = this.get('students');
        const count = students.length + 1;
        return `JPT/${year}/${deptCode}/${String(count).padStart(4, '0')}`;
    },
    
    generateStaffId(role) {
        const prefix = role === 'lecturer' ? 'LEC' : 'STF';
        const count = this.get('lecturers').length + 1;
        return `${prefix}${String(count).padStart(3, '0')}`;
    },
    
    // Export data to CSV
    exportToCSV(collection, filename) {
        const data = this.get(collection);
        if (!data || data.length === 0) {
            console.warn('No data to export');
            return false;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header] || '';
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
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
        const maxStorage = 5 * 1024 * 1024; // 5MB
        return Math.min((total / maxStorage) * 100, 100);
    }
};

// Initialize storage on load
Storage.init();