// assets/js/ui.js - UI Components and Rendering
const UI = {
    currentPage: 'dashboard',
    
    async loadPage(page) {
        this.currentPage = page;
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        // Show loading state
        contentArea.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        
        // Simulate async loading
        setTimeout(() => {
            const content = this.getPageContent(page);
            contentArea.innerHTML = content;
            this.initializePageComponents(page);
        }, 300);
    },
    
    getPageContent(page) {
        switch(page) {
            case 'dashboard': return this.renderDashboard();
            case 'students': return this.renderStudentsPage();
            case 'lecturers': return this.renderLecturersPage();
            case 'courses': return this.renderCoursesPage();
            case 'results': return this.renderResultsPage();
            case 'transcript': return this.renderTranscriptPage();
            case 'reports': return this.renderReportsPage();
            case 'settings': return this.renderSettingsPage();
            case 'profile': return this.renderProfilePage();
            default: return this.renderDashboard();
        }
    },
    
    renderDashboard() {
        const students = Storage.get('students');
        const lecturers = Storage.get('lecturers');
        const courses = Storage.get('courses');
        const results = Storage.get('results');
        
        const publishedResults = results.filter(r => r.status === 'published');
        const avgGPA = publishedResults.length > 0 ? 
            (publishedResults.reduce((sum, r) => sum + (r.gradePoints || 0), 0) / publishedResults.length).toFixed(2) : 0;
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Dashboard Overview</h2>
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted">Total Students</h6>
                                    <h3 class="stat-value">${students.length}</h3>
                                </div>
                                <i class="bi bi-people fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted">Total Lecturers</h6>
                                    <h3 class="stat-value">${lecturers.length}</h3>
                                </div>
                                <i class="bi bi-person-badge fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted">Active Courses</h6>
                                    <h3 class="stat-value">${courses.length}</h3>
                                </div>
                                <i class="bi bi-book fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted">Average GPA</h6>
                                    <h3 class="stat-value">${avgGPA}</h3>
                                </div>
                                <i class="bi bi-graph-up fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-8">
                        <div class="dashboard-card">
                            <h5>Recent Activity</h5>
                            <canvas id="activityChart" height="300"></canvas>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-card">
                            <h5>Quick Actions</h5>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="UI.loadPage('students')">
                                    <i class="bi bi-person-plus"></i> Add Student
                                </button>
                                <button class="btn btn-success" onclick="UI.loadPage('results')">
                                    <i class="bi bi-plus-circle"></i> Enter Results
                                </button>
                                <button class="btn btn-info" onclick="UI.loadPage('reports')">
                                    <i class="bi bi-bar-chart"></i> View Reports
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderStudentsPage() {
        const students = Storage.get('students');
        
        return `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Student Management</h2>
                    <button class="btn btn-primary" onclick="UI.showStudentModal()">
                        <i class="bi bi-plus-circle"></i> Add Student
                    </button>
                </div>
                
                <div class="dashboard-card">
                    <div class="table-responsive">
                        <table class="table table-hover" id="studentsTable">
                            <thead>
                                <tr>
                                    <th>Matric No</th>
                                    <th>Full Name</th>
                                    <th>Department</th>
                                    <th>Level</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${students.map(student => `
                                    <tr>
                                        <td>${student.matricNumber || 'N/A'}</td>
                                        <td>${student.name}</td>
                                        <td>${student.department}</td>
                                        <td>${student.level || '100'}</td>
                                        <td>${student.email}</td>
                                        <td>
                                            <button class="btn btn-sm btn-info" onclick="UI.viewStudent('${student.id}')">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-warning" onclick="UI.editStudent('${student.id}')">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="UI.deleteStudent('${student.id}')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${students.length === 0 ? '<tr><td colspan="6" class="text-center">No students found</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    showStudentModal(student = null) {
        const departments = Storage.get('departments');
        const modalHtml = `
            <div class="modal fade" id="studentModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${student ? 'Edit Student' : 'Add New Student'}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="studentForm">
                                <input type="hidden" id="studentId" value="${student?.id || ''}">
                                <div class="mb-3">
                                    <label>Full Name</label>
                                    <input type="text" class="form-control" id="studentName" value="${student?.name || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label>Matric Number</label>
                                    <input type="text" class="form-control" id="matricNumber" value="${student?.matricNumber || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label>Email</label>
                                    <input type="email" class="form-control" id="studentEmail" value="${student?.email || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label>Department</label>
                                    <select class="form-control" id="studentDepartment" required>
                                        <option value="">Select Department</option>
                                        ${departments.map(dept => `<option value="${dept}" ${student?.department === dept ? 'selected' : ''}>${dept}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label>Level</label>
                                    <select class="form-control" id="studentLevel" required>
                                        ${[100,200,300,400,500].map(level => `<option value="${level}" ${student?.level == level ? 'selected' : ''}>${level} Level</option>`).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label>Phone</label>
                                    <input type="tel" class="form-control" id="studentPhone" value="${student?.phone || ''}">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="UI.saveStudent()">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        const modal = new bootstrap.Modal(document.getElementById('studentModal'));
        modal.show();
        
        document.getElementById('studentModal').addEventListener('hidden.bs.modal', () => {
            modalContainer.remove();
        });
    },
    
    saveStudent() {
        const id = document.getElementById('studentId').value;
        const studentData = {
            name: document.getElementById('studentName').value,
            matricNumber: document.getElementById('matricNumber').value,
            email: document.getElementById('studentEmail').value,
            department: document.getElementById('studentDepartment').value,
            level: document.getElementById('studentLevel').value,
            phone: document.getElementById('studentPhone').value
        };
        
        if (id) {
            Storage.update('students', id, studentData);
            Auth.showToast('Student updated successfully!', 'success');
        } else {
            Storage.add('students', studentData);
            Auth.showToast('Student added successfully!', 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        this.loadPage('students');
    },
    
    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            Storage.delete('students', id);
            Auth.showToast('Student deleted successfully!', 'success');
            this.loadPage('students');
        }
    },
    
    initializePageComponents(page) {
        if (page === 'dashboard' && window.Chart) {
            this.initDashboardCharts();
        }
    },
    
    initDashboardCharts() {
        const ctx = document.getElementById('activityChart');
        if (ctx && window.Chart) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Results Processed',
                        data: [65, 78, 82, 91, 88, 95],
                        borderColor: '#0d6efd',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
    },
    
    // Additional rendering methods for other pages
    renderLecturersPage() { return '<div class="fade-in"><h2>Lecturer Management</h2><p>Loading...</p></div>'; },
    renderCoursesPage() { return '<div class="fade-in"><h2>Course Management</h2><p>Loading...</p></div>'; },
    renderResultsPage() { return '<div class="fade-in"><h2>Result Entry</h2><p>Loading...</p></div>'; },
    renderTranscriptPage() { return '<div class="fade-in"><h2>Transcript Generation</h2><p>Loading...</p></div>'; },
    renderReportsPage() { return '<div class="fade-in"><h2>Analytics & Reports</h2><p>Loading...</p></div>'; },
    renderSettingsPage() { return '<div class="fade-in"><h2>System Settings</h2><p>Loading...</p></div>'; },
    renderProfilePage() { return '<div class="fade-in"><h2>My Profile</h2><p>Loading...</p></div>'; }
};

// Make UI globally available
window.UI = UI;