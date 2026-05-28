// assets/js/storage.js - Storage Management System
const Storage = {
    // Initialize database
    init() {
        const dbStructure = {
            users: [
                { id: '1', name: 'Admin User', email: 'admin@jpts.edu', password: btoa('admin123'), role: 'admin', department: 'Administration' },
                { id: '2', name: 'John Lecturer', email: 'lecturer@jpts.edu', password: btoa('lecturer123'), role: 'lecturer', department: 'Computer Science' },
                { id: '3', name: 'Jane Student', email: 'student@jpts.edu', password: btoa('student123'), role: 'student', matricNumber: 'JPT/2024/001', department: 'Computer Science' }
            ],
            students: [],
            lecturers: [],
            courses: [],
            results: [],
            sessions: [{ id: '1', name: '2023/2024', current: true, semester: 'First' }],
            departments: ['Computer Science', 'Engineering', 'Business', 'Medicine'],
            notifications: [],
            auditLogs: []
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
            return JSON.parse(localStorage.getItem(collection)) || [];
        } catch {
            return [];
        }
    },
    
    set(collection, data) {
        localStorage.setItem(collection, JSON.stringify(data));
        return true;
    },
    
    add(collection, item) {
        const items = this.get(collection);
        item.id = Date.now().toString();
        item.createdAt = new Date().toISOString();
        items.push(item);
        this.set(collection, items);
        return item;
    },
    
    update(collection, id, updates) {
        const items = this.get(collection);
        const index = items.findIndex(item => item.id == id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(collection, items);
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
    
    // Validation helpers
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Backup/Restore
    backup() {
        const backup = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup[key] = localStorage.getItem(key);
        }
        const backupStr = JSON.stringify(backup);
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jpts_backup_${new Date().toISOString()}.json`;
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
        } catch {
            return false;
        }
    },
    
    // Audit logging
    logAction(userId, action, details) {
        const log = {
            id: this.generateId(),
            userId,
            action,
            details,
            timestamp: new Date().toISOString(),
            ip: 'simulated'
        };
        const logs = this.get('auditLogs');
        logs.push(log);
        this.set('auditLogs', logs);
    }
};

// Initialize storage
Storage.init();