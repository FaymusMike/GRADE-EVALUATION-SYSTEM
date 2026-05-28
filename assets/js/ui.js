// assets/js/ui.js - COMPLETE FILE with Role-Based Dashboards
const UI = {
    currentPage: 'dashboard',
    
    async loadPage(page) {
        this.currentPage = page;
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        // Check permissions before loading page
        if (!this.hasPagePermission(page)) {
            this.showUnauthorizedAccess();
            return;
        }
        
        // Show loading state
        contentArea.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        
        // Simulate async loading
        setTimeout(() => {
            const content = this.getPageContent(page);
            contentArea.innerHTML = content;
            this.initializePageComponents(page);
        }, 300);
    },
    
    hasPagePermission(page) {
        const role = Auth.currentUser?.role;
        const restrictedPages = {
            student: ['students', 'lecturers', 'courses', 'settings', 'reports'],
            lecturer: ['students', 'settings'],
            exam_officer: [],
            admin: []
        };
        
        if (restrictedPages[role] && restrictedPages[role].includes(page)) {
            return false;
        }
        return true;
    },
    
    showUnauthorizedAccess() {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-shield-lock fs-1 text-danger"></i>
                    <h3 class="mt-3">Access Denied</h3>
                    <p class="text-muted">You don't have permission to access this page.</p>
                    <button class="btn btn-primary" onclick="UI.loadPage('dashboard')">Back to Dashboard</button>
                </div>
            `;
        }
    },
    
    getSidebarMenu() {
        const role = Auth.currentUser?.role;
        
        const menus = {
            admin: [
                { page: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
                { page: 'students', icon: 'bi-people', label: 'Students' },
                { page: 'lecturers', icon: 'bi-person-badge', label: 'Lecturers' },
                { page: 'courses', icon: 'bi-book', label: 'Courses' },
                { page: 'results', icon: 'bi-clipboard-data', label: 'Results' },
                { page: 'transcript', icon: 'bi-file-text', label: 'Transcript' },
                { page: 'reports', icon: 'bi-graph-up', label: 'Analytics' },
                { page: 'settings', icon: 'bi-gear', label: 'Settings' }
            ],
            lecturer: [
                { page: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
                { page: 'my-courses', icon: 'bi-book', label: 'My Courses' },
                { page: 'enter-results', icon: 'bi-pencil-square', label: 'Enter Results' },
                { page: 'my-students', icon: 'bi-people', label: 'My Students' },
                { page: 'transcript', icon: 'bi-file-text', label: 'Transcript' },
                { page: 'profile', icon: 'bi-person', label: 'Profile' }
            ],
            student: [
                { page: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
                { page: 'my-results', icon: 'bi-award', label: 'My Results' },
                { page: 'semester-gpa', icon: 'bi-calculator', label: 'Semester GPA' },
                { page: 'transcript', icon: 'bi-file-text', label: 'My Transcript' },
                { page: 'course-registration', icon: 'bi-journal-bookmark-fill', label: 'Course Registration' },
                { page: 'profile', icon: 'bi-person', label: 'My Profile' },
                { page: 'notifications', icon: 'bi-bell', label: 'Notifications' }
            ],
            exam_officer: [
                { page: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
                { page: 'results-review', icon: 'bi-check-circle', label: 'Review Results' },
                { page: 'approve-results', icon: 'bi-check2-all', label: 'Approve Results' },
                { page: 'students', icon: 'bi-people', label: 'Students' },
                { page: 'courses', icon: 'bi-book', label: 'Courses' },
                { page: 'reports', icon: 'bi-graph-up', label: 'Reports' }
            ]
        };
        
        return menus[role] || menus.student;
    },
    
    renderSidebar() {
        const sidebar = document.querySelector('.sidebar-nav');
        if (!sidebar) return;
        
        const menus = this.getSidebarMenu();
        sidebar.innerHTML = menus.map(menu => `
            <li class="nav-item">
                <a href="#" data-page="${menu.page}" class="nav-link ${this.currentPage === menu.page ? 'active' : ''}">
                    <i class="bi ${menu.icon}"></i>
                    <span>${menu.label}</span>
                </a>
            </li>
        `).join('');
        
        // Add logout at the bottom
        sidebar.innerHTML += `
            <li class="nav-item mt-4">
                <a href="#" id="logoutBtn" class="nav-link text-danger">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </a>
            </li>
        `;
        
        // Re-attach event listeners
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
        }
    },
    
    getPageContent(page) {
        const role = Auth.currentUser?.role;
        
        // Role-specific page content
        if (role === 'student') {
            return this.getStudentPageContent(page);
        } else if (role === 'lecturer') {
            return this.getLecturerPageContent(page);
        } else if (role === 'exam_officer') {
            return this.getExamOfficerPageContent(page);
        }
        return this.getAdminPageContent(page);
    },
    
    // ============ STUDENT DASHBOARD ============
    getStudentPageContent(page) {
        const student = this.getCurrentStudent();
        const results = this.getStudentResults();
        const gpaData = this.calculateStudentGPA(results);
        
        switch(page) {
            case 'dashboard':
                return this.renderStudentDashboard(student, results, gpaData);
            case 'my-results':
                return this.renderStudentResults(results);
            case 'semester-gpa':
                return this.renderStudentGPA(gpaData);
            case 'course-registration':
                return this.renderCourseRegistration();
            case 'profile':
                return this.renderStudentProfile(student);
            case 'notifications':
                return this.renderStudentNotifications();
            case 'transcript':
                return this.renderStudentTranscript(student, results);
            default:
                return this.renderStudentDashboard(student, results, gpaData);
        }
    },
    
    renderStudentDashboard(student, results, gpaData) {
        const currentSemester = this.getCurrentSemester();
        const semesterResults = results.filter(r => r.semester === currentSemester);
        
        return `
            <div class="fade-in">
                <!-- Welcome Banner -->
                <div class="dashboard-card bg-gradient-primary text-white mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="text-white">Welcome back, ${student?.name?.split(' ')[0] || 'Student'}!</h2>
                            <p class="text-white-50 mb-0">${student?.matricNumber || 'N/A'} • ${student?.department || 'N/A'} • Level ${student?.level || '100'}</p>
                        </div>
                        <i class="bi bi-mortarboard-fill fs-1 text-white-50"></i>
                    </div>
                </div>
                
                <!-- Stats Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-md-3 col-6">
                        <div class="dashboard-card text-center">
                            <h6 class="text-muted">Current GPA</h6>
                            <h2 class="text-primary">${gpaData.currentGPA}</h2>
                            <small>${currentSemester} Semester</small>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="dashboard-card text-center">
                            <h6 class="text-muted">CGPA</h6>
                            <h2 class="text-success">${gpaData.cgpa}</h2>
                            <small>Cumulative</small>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="dashboard-card text-center">
                            <h6 class="text-muted">Courses Taken</h6>
                            <h2 class="text-info">${results.length}</h2>
                            <small>Total</small>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="dashboard-card text-center">
                            <h6 class="text-muted">Credit Hours</h6>
                            <h2 class="text-warning">${gpaData.totalCredits}</h2>
                            <small>Earned</small>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Results -->
                <div class="dashboard-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5>Recent Results - ${currentSemester} Semester</h5>
                        <button class="btn btn-sm btn-outline-primary" onclick="UI.loadPage('my-results')">View All</button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Credit Unit</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>GP</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${semesterResults.slice(0, 5).map(result => `
                                    <tr>
                                        <td>${result.courseCode || 'N/A'}</td>
                                        <td>${result.courseTitle || 'N/A'}</td>
                                        <td>${result.creditUnit || 0}</td>
                                        <td>${result.totalScore || 0}</td>
                                        <td><span class="badge bg-${this.getGradeBadgeColor(result.grade)}">${result.grade || 'F'}</span></td>
                                        <td>${result.gradePoints || 0}</td>
                                    </tr>
                                `).join('')}
                                ${semesterResults.length === 0 ? '<tr><td colspan="6" class="text-center">No results available</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="dashboard-card text-center">
                            <i class="bi bi-printer fs-1 text-primary mb-2"></i>
                            <h6>Print Result Slip</h6>
                            <button class="btn btn-sm btn-primary mt-2" onclick="UI.printResult()">Print Now</button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="dashboard-card text-center">
                            <i class="bi bi-file-pdf fs-1 text-danger mb-2"></i>
                            <h6>Download Transcript</h6>
                            <button class="btn btn-sm btn-danger mt-2" onclick="UI.downloadTranscript()">Download</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderStudentResults(results) {
        const groupedResults = this.groupResultsBySemester(results);
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">My Academic Results</h2>
                ${groupedResults.map(semester => `
                    <div class="dashboard-card mb-4">
                        <h5 class="mb-3">${semester.name} Semester</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Title</th>
                                        <th>Credit Unit</th>
                                        <th>CA (30)</th>
                                        <th>Exam (70)</th>
                                        <th>Total</th>
                                        <th>Grade</th>
                                        <th>GP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${semester.results.map(result => `
                                        <tr>
                                            <td>${result.courseCode}</td>
                                            <td>${result.courseTitle}</td>
                                            <td>${result.creditUnit}</td>
                                            <td>${result.caScore || 0}</td>
                                            <td>${result.examScore || 0}</td>
                                            <td><strong>${result.totalScore}</strong></td>
                                            <td><span class="badge bg-${this.getGradeBadgeColor(result.grade)}">${result.grade}</span></td>
                                            <td>${result.gradePoints}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr class="table-active">
                                        <td colspan="5"><strong>Semester GPA:</strong></td>
                                        <td colspan="3"><strong>${semester.semesterGPA}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                `).join('')}
                ${groupedResults.length === 0 ? '<div class="dashboard-card text-center">No results found. Check back after results are published.</div>' : ''}
                <div class="text-center mt-3">
                    <button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> Print All Results</button>
                </div>
            </div>
        `;
    },
    
    renderStudentGPA(gpaData) {
        return `
            <div class="fade-in">
                <h2 class="mb-4">GPA Analysis</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="dashboard-card text-center">
                            <h5>Current Semester GPA</h5>
                            <h1 class="display-2 text-primary">${gpaData.currentGPA}</h1>
                            <p>${this.getCurrentSemester()} Semester</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="dashboard-card text-center">
                            <h5>Cumulative GPA (CGPA)</h5>
                            <h1 class="display-2 text-success">${gpaData.cgpa}</h1>
                            <p>Classification: <strong>${this.calculateClassification(parseFloat(gpaData.cgpa))}</strong></p>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card mt-4">
                    <h5>GPA Trend</h5>
                    <canvas id="gpaTrendChart" height="300"></canvas>
                </div>
            </div>
        `;
    },
    
    renderCourseRegistration() {
        const availableCourses = Storage.get('courses').filter(c => c.status !== 'registered');
        const registeredCourses = Storage.get('courses').filter(c => c.status === 'registered');
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Course Registration</h2>
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Registration deadline: ${this.getRegistrationDeadline()}
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="dashboard-card">
                            <h5>Available Courses</h5>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Title</th>
                                            <th>Credit</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${availableCourses.map(course => `
                                            <tr>
                                                <td>${course.code}</td>
                                                <td>${course.title}</td>
                                                <td>${course.creditUnit}</td>
                                                <td><button class="btn btn-sm btn-primary" onclick="UI.registerCourse('${course.id}')">Register</button></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="dashboard-card">
                            <h5>Registered Courses</h5>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Title</th>
                                            <th>Credit</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${registeredCourses.map(course => `
                                            <tr>
                                                <td>${course.code}</td>
                                                <td>${course.title}</td>
                                                <td>${course.creditUnit}</td>
                                                <td><button class="btn btn-sm btn-danger" onclick="UI.dropCourse('${course.id}')">Drop</button></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between">
                                <strong>Total Credits:</strong>
                                <strong>${registeredCourses.reduce((sum, c) => sum + (c.creditUnit || 0), 0)}</strong>
                            </div>
                            <button class="btn btn-success w-100 mt-3" onclick="UI.submitRegistration()">Submit Registration</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderStudentProfile(student) {
        return `
            <div class="fade-in">
                <h2 class="mb-4">My Profile</h2>
                <div class="row">
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <i class="bi bi-person-circle fs-1 text-primary"></i>
                            <h4 class="mt-2">${student?.name || 'N/A'}</h4>
                            <p class="text-muted">${student?.matricNumber || 'N/A'}</p>
                            <hr>
                            <p><i class="bi bi-envelope"></i> ${student?.email || 'N/A'}</p>
                            <p><i class="bi bi-phone"></i> ${student?.phone || 'Not provided'}</p>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="dashboard-card">
                            <h5>Personal Information</h5>
                            <form id="profileForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label>Full Name</label>
                                        <input type="text" class="form-control" value="${student?.name || ''}" disabled>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label>Matric Number</label>
                                        <input type="text" class="form-control" value="${student?.matricNumber || ''}" disabled>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label>Department</label>
                                        <input type="text" class="form-control" value="${student?.department || ''}" disabled>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label>Level</label>
                                        <input type="text" class="form-control" value="${student?.level || '100'}" disabled>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label>Email</label>
                                        <input type="email" class="form-control" value="${student?.email || ''}" id="studentEmail">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label>Phone Number</label>
                                        <input type="tel" class="form-control" value="${student?.phone || ''}" id="studentPhone">
                                    </div>
                                    <div class="col-12 mb-3">
                                        <label>Address</label>
                                        <textarea class="form-control" rows="2" id="studentAddress">${student?.address || ''}</textarea>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-primary" onclick="UI.updateStudentProfile()">Update Profile</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderStudentNotifications() {
        const notifications = Storage.get('notifications').filter(n => n.userId === Auth.currentUser?.id);
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">My Notifications</h2>
                <div class="dashboard-card">
                    ${notifications.length > 0 ? notifications.map(notif => `
                        <div class="notification-item p-3 border-bottom">
                            <div class="d-flex justify-content-between">
                                <strong>${notif.title}</strong>
                                <small class="text-muted">${new Date(notif.timestamp).toLocaleDateString()}</small>
                            </div>
                            <p class="mb-0 text-muted">${notif.message}</p>
                        </div>
                    `).join('') : '<div class="text-center py-5"><i class="bi bi-bell-slash fs-1 text-muted"></i><p>No notifications</p></div>'}
                </div>
            </div>
        `;
    },
    
    renderStudentTranscript(student, results) {
        const gpaData = this.calculateStudentGPA(results);
        
        return `
            <div class="fade-in" id="transcriptPrint">
                <div class="dashboard-card text-center">
                    <i class="bi bi-mortarboard-fill fs-1 text-primary"></i>
                    <h2>JPTS Institute</h2>
                    <p>Academic Transcript</p>
                    <hr>
                    <div class="row">
                        <div class="col-md-6 text-start">
                            <p><strong>Name:</strong> ${student?.name}</p>
                            <p><strong>Matric No:</strong> ${student?.matricNumber}</p>
                            <p><strong>Department:</strong> ${student?.department}</p>
                        </div>
                        <div class="col-md-6 text-start">
                            <p><strong>Level:</strong> ${student?.level}</p>
                            <p><strong>CGPA:</strong> ${gpaData.cgpa}</p>
                            <p><strong>Classification:</strong> ${this.calculateClassification(parseFloat(gpaData.cgpa))}</p>
                        </div>
                    </div>
                    <hr>
                    <div class="text-center mt-3">
                        <button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> Print Transcript</button>
                        <button class="btn btn-success" onclick="UI.downloadTranscriptPDF()"><i class="bi bi-download"></i> Download PDF</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ LECTURER DASHBOARD ============
    getLecturerPageContent(page) {
        switch(page) {
            case 'dashboard':
                return this.renderLecturerDashboard();
            case 'my-courses':
                return this.renderLecturerCourses();
            case 'enter-results':
                return this.renderResultEntry();
            case 'my-students':
                return this.renderLecturerStudents();
            case 'profile':
                return this.renderLecturerProfile();
            default:
                return this.renderLecturerDashboard();
        }
    },
    
    renderLecturerDashboard() {
        const myCourses = this.getLecturerCourses();
        const pendingResults = Storage.get('results').filter(r => r.status === 'draft' && r.lecturerId === Auth.currentUser?.id);
        
        return `
            <div class="fade-in">
                <div class="dashboard-card bg-primary text-white mb-4">
                    <h3 class="text-white">Welcome, Dr. ${Auth.currentUser?.name?.split(' ')[0] || 'Lecturer'}</h3>
                    <p class="text-white-50 mb-0">Department of ${Auth.currentUser?.department || 'Computer Science'}</p>
                </div>
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <h6>My Courses</h6>
                            <h2 class="text-primary">${myCourses.length}</h2>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <h6>Pending Results</h6>
                            <h2 class="text-warning">${pendingResults.length}</h2>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <h6>Total Students</h6>
                            <h2 class="text-success">${this.getTotalStudentsForLecturer()}</h2>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <h5>Quick Actions</h5>
                    <div class="d-grid gap-2 d-md-flex">
                        <button class="btn btn-primary" onclick="UI.loadPage('enter-results')"><i class="bi bi-pencil-square"></i> Enter Results</button>
                        <button class="btn btn-info" onclick="UI.loadPage('my-courses')"><i class="bi bi-book"></i> View Courses</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderResultEntry() {
        const myCourses = this.getLecturerCourses();
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Result Entry</h2>
                <div class="dashboard-card">
                    <form id="resultEntryForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label>Select Course</label>
                                <select class="form-control" id="resultCourse" required>
                                    <option value="">Choose Course</option>
                                    ${myCourses.map(course => `<option value="${course.id}">${course.code} - ${course.title}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label>Select Student</label>
                                <select class="form-control" id="resultStudent" required>
                                    <option value="">Choose Student</option>
                                    ${this.getAllStudents().map(student => `<option value="${student.id}">${student.matricNumber} - ${student.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label>CA (0-30)</label>
                                <input type="number" class="form-control" id="caScore" min="0" max="30" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label>Assignment (0-10)</label>
                                <input type="number" class="form-control" id="assignmentScore" min="0" max="10" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label>Mid-Term (0-20)</label>
                                <input type="number" class="form-control" id="midtermScore" min="0" max="20" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label>Exam (0-70)</label>
                                <input type="number" class="form-control" id="examScore" min="0" max="70" required>
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="UI.saveResult()">Save Result</button>
                        <button type="button" class="btn btn-success" onclick="UI.submitForApproval()">Submit for Approval</button>
                    </form>
                </div>
                <div class="dashboard-card mt-4">
                    <h5>Recent Entries</h5>
                    <div class="table-responsive">
                        <table class="table table-hover" id="recentResultsTable">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Total</th>
                                    <th>Grade</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="recentResultsBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ EXAM OFFICER DASHBOARD ============
    getExamOfficerPageContent(page) {
        switch(page) {
            case 'dashboard':
                return this.renderExamOfficerDashboard();
            case 'results-review':
                return this.renderResultsReview();
            case 'approve-results':
                return this.renderApproveResults();
            case 'students':
                return this.renderStudentsPage();
            case 'courses':
                return this.renderCoursesPage();
            case 'reports':
                return this.renderReportsPage();
            default:
                return this.renderExamOfficerDashboard();
        }
    },
    
    renderExamOfficerDashboard() {
        const pendingResults = Storage.get('results').filter(r => r.status === 'pending');
        const approvedResults = Storage.get('results').filter(r => r.status === 'approved');
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Examination Officer Dashboard</h2>
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="dashboard-card text-center">
                            <h6>Pending Review</h6>
                            <h2 class="text-warning">${pendingResults.length}</h2>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="dashboard-card text-center">
                            <h6>Approved</h6>
                            <h2 class="text-success">${approvedResults.length}</h2>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="dashboard-card text-center">
                            <h6>Total Students</h6>
                            <h2 class="text-primary">${Storage.get('students').length}</h2>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="dashboard-card text-center">
                            <h6>Active Courses</h6>
                            <h2 class="text-info">${Storage.get('courses').length}</h2>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <h5>Quick Actions</h5>
                    <div class="d-grid gap-2 d-md-flex">
                        <button class="btn btn-warning" onclick="UI.loadPage('results-review')"><i class="bi bi-check-circle"></i> Review Results</button>
                        <button class="btn btn-success" onclick="UI.loadPage('approve-results')"><i class="bi bi-check2-all"></i> Approve Results</button>
                        <button class="btn btn-info" onclick="UI.generateReports()"><i class="bi bi-file-bar-graph"></i> Generate Reports</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderResultsReview() {
        const pendingResults = Storage.get('results').filter(r => r.status === 'pending');
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Results Pending Review</h2>
                <div class="dashboard-card">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Total Score</th>
                                    <th>Grade</th>
                                    <th>Lecturer</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pendingResults.map(result => {
                                    const student = Storage.findOne('students', s => s.id === result.studentId);
                                    const course = Storage.findOne('courses', c => c.id === result.courseId);
                                    return `
                                        <tr>
                                            <td>${student?.name || 'N/A'}</td>
                                            <td>${course?.code || 'N/A'}</td>
                                            <td>${result.totalScore}</td>
                                            <td>${result.grade}</td>
                                            <td>${result.lecturerName || 'N/A'}</td>
                                            <td>
                                                <button class="btn btn-sm btn-success" onclick="UI.approveResult('${result.id}')">Approve</button>
                                                <button class="btn btn-sm btn-danger" onclick="UI.rejectResult('${result.id}')">Reject</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                                ${pendingResults.length === 0 ? '<tr><td colspan="6" class="text-center">No pending results</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderApproveResults() {
        const approvedResults = Storage.get('results').filter(r => r.status === 'approved');
        const publishedResults = Storage.get('results').filter(r => r.status === 'published');
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Results Approval & Publication</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="dashboard-card">
                            <h5>Approved Results (Ready for Publication)</h5>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Student Count</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.groupResultsByCourse(approvedResults).map(group => `
                                            <tr>
                                                <td>${group.courseCode}</td>
                                                <td>${group.count}</td>
                                                <td><button class="btn btn-sm btn-primary" onclick="UI.publishResults('${group.courseId}')">Publish</button></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="dashboard-card">
                            <h5>Published Results</h5>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Students</th>
                                            <th>Published Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.groupResultsByCourse(publishedResults).map(group => `
                                            <tr>
                                                <td>${group.courseCode}</td>
                                                <td>${group.count}</td>
                                                <td>${new Date().toLocaleDateString()}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ ADMIN DASHBOARD (Full Access) ============
    getAdminPageContent(page) {
        switch(page) {
            case 'dashboard':
                return this.renderAdminDashboard();
            case 'students':
                return this.renderStudentsPage();
            case 'lecturers':
                return this.renderLecturersPage();
            case 'courses':
                return this.renderCoursesPage();
            case 'results':
                return this.renderResultsPage();
            case 'transcript':
                return this.renderTranscriptPage();
            case 'reports':
                return this.renderReportsPage();
            case 'settings':
                return this.renderSettingsPage();
            default:
                return this.renderAdminDashboard();
        }
    },
    
    renderAdminDashboard() {
        const students = Storage.get('students');
        const lecturers = Storage.get('lecturers');
        const courses = Storage.get('courses');
        const results = Storage.get('results');
        const pendingResults = results.filter(r => r.status === 'pending');
        const publishedResults = results.filter(r => r.status === 'published');
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Admin Dashboard</h2>
                <div class="row g-4 mb-4">
                    <div class="col-md-3 col-sm-6">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-muted">Total Students</h6>
                                    <h3 class="stat-value">${students.length}</h3>
                                </div>
                                <i class="bi bi-people fs-1 text-primary"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-muted">Total Lecturers</h6>
                                    <h3 class="stat-value">${lecturers.length}</h3>
                                </div>
                                <i class="bi bi-person-badge fs-1 text-success"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-muted">Active Courses</h6>
                                    <h3 class="stat-value">${courses.length}</h3>
                                </div>
                                <i class="bi bi-book fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="dashboard-card">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-muted">Pending Results</h6>
                                    <h3 class="stat-value text-warning">${pendingResults.length}</h3>
                                </div>
                                <i class="bi bi-clock-history fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row g-4">
                    <div class="col-md-8">
                        <div class="dashboard-card">
                            <h5>Recent Activity</h5>
                            <canvas id="activityChart" height="300"></canvas>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-card">
                            <h5>System Status</h5>
                            <div class="mb-3">
                                <label>Storage Used</label>
                                <div class="progress">
                                    <div class="progress-bar bg-primary" style="width: ${this.getStorageUsage()}%"></div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label>Published Results</label>
                                <h4>${publishedResults.length}</h4>
                            </div>
                            <button class="btn btn-outline-primary w-100 mb-2" onclick="Storage.backup()">
                                <i class="bi bi-download"></i> Backup Data
                            </button>
                            <button class="btn btn-outline-info w-100" onclick="UI.generateSystemReport()">
                                <i class="bi bi-file-text"></i> Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ HELPER FUNCTIONS ============
    getCurrentStudent() {
        const email = Auth.currentUser?.email;
        return Storage.findOne('students', s => s.email === email);
    },
    
    getStudentResults() {
        const student = this.getCurrentStudent();
        if (!student) return [];
        
        const results = Storage.get('results');
        const courses = Storage.get('courses');
        
        return results
            .filter(r => r.studentId === student.id && r.status === 'published')
            .map(result => {
                const course = courses.find(c => c.id === result.courseId);
                return {
                    ...result,
                    courseCode: course?.code,
                    courseTitle: course?.title,
                    creditUnit: course?.creditUnit
                };
            });
    },
    
    calculateStudentGPA(results) {
        let totalPoints = 0;
        let totalCredits = 0;
        const currentSemester = this.getCurrentSemester();
        let semesterPoints = 0;
        let semesterCredits = 0;
        
        results.forEach(result => {
            const points = (result.gradePoints || 0) * (result.creditUnit || 0);
            totalPoints += points;
            totalCredits += result.creditUnit || 0;
            
            if (result.semester === currentSemester) {
                semesterPoints += points;
                semesterCredits += result.creditUnit || 0;
            }
        });
        
        return {
            currentGPA: semesterCredits > 0 ? (semesterPoints / semesterCredits).toFixed(2) : '0.00',
            cgpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00',
            totalCredits: totalCredits
        };
    },
    
    getCurrentSemester() {
        const sessions = Storage.get('sessions');
        const current = sessions.find(s => s.current);
        return current?.semester || 'First';
    },
    
    getRegistrationDeadline() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
    },
    
    getGradeBadgeColor(grade) {
        const colors = { A: 'success', B: 'info', C: 'warning', D: 'secondary', E: 'danger', F: 'dark' };
        return colors[grade] || 'secondary';
    },
    
    calculateClassification(cgpa) {
        if (cgpa >= 4.5) return 'First Class Honours';
        if (cgpa >= 3.5) return 'Second Class Honours (Upper)';
        if (cgpa >= 2.5) return 'Second Class Honours (Lower)';
        if (cgpa >= 1.5) return 'Third Class Honours';
        return 'Pass';
    },
    
    groupResultsBySemester(results) {
        const grouped = {};
        results.forEach(result => {
            if (!grouped[result.semester]) {
                grouped[result.semester] = [];
            }
            grouped[result.semester].push(result);
        });
        
        return Object.entries(grouped).map(([name, results]) => {
            let semesterPoints = 0;
            let semesterCredits = 0;
            results.forEach(r => {
                semesterPoints += (r.gradePoints || 0) * (r.creditUnit || 0);
                semesterCredits += r.creditUnit || 0;
            });
            return {
                name,
                results,
                semesterGPA: semesterCredits > 0 ? (semesterPoints / semesterCredits).toFixed(2) : '0.00'
            };
        });
    },
    
    groupResultsByCourse(results) {
        const grouped = {};
        results.forEach(result => {
            const courseId = result.courseId;
            if (!grouped[courseId]) {
                const course = Storage.findOne('courses', c => c.id === courseId);
                grouped[courseId] = {
                    courseId,
                    courseCode: course?.code || 'N/A',
                    count: 0
                };
            }
            grouped[courseId].count++;
        });
        return Object.values(grouped);
    },
    
    getLecturerCourses() {
        const lecturerId = Auth.currentUser?.id;
        return Storage.get('courses').filter(c => c.lecturerId === lecturerId);
    },
    
    getAllStudents() {
        return Storage.get('students');
    },
    
    getTotalStudentsForLecturer() {
        // In a real system, this would filter by department
        return Storage.get('students').length;
    },
    
    getStorageUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            total += (key?.length || 0) + (value?.length || 0);
        }
        const maxStorage = 5 * 1024 * 1024; // 5MB
        return Math.min((total / maxStorage) * 100, 100);
    },
    
    // ============ ACTION METHODS ============
    registerCourse(courseId) {
        const course = Storage.findOne('courses', c => c.id === courseId);
        if (course) {
            course.status = 'registered';
            Storage.update('courses', courseId, course);
            this.showToast('Course registered successfully!', 'success');
            this.loadPage('course-registration');
        }
    },
    
    dropCourse(courseId) {
        const course = Storage.findOne('courses', c => c.id === courseId);
        if (course) {
            delete course.status;
            Storage.update('courses', courseId, course);
            this.showToast('Course dropped successfully!', 'success');
            this.loadPage('course-registration');
        }
    },
    
    submitRegistration() {
        this.showToast('Registration submitted successfully!', 'success');
    },
    
    updateStudentProfile() {
        const student = this.getCurrentStudent();
        if (student) {
            student.email = document.getElementById('studentEmail')?.value || student.email;
            student.phone = document.getElementById('studentPhone')?.value || student.phone;
            student.address = document.getElementById('studentAddress')?.value || student.address;
            Storage.update('students', student.id, student);
            this.showToast('Profile updated successfully!', 'success');
        }
    },
    
    saveResult() {
        const courseId = document.getElementById('resultCourse')?.value;
        const studentId = document.getElementById('resultStudent')?.value;
        const ca = parseInt(document.getElementById('caScore')?.value) || 0;
        const assignment = parseInt(document.getElementById('assignmentScore')?.value) || 0;
        const midterm = parseInt(document.getElementById('midtermScore')?.value) || 0;
        const exam = parseInt(document.getElementById('examScore')?.value) || 0;
        
        const total = ca + assignment + midterm + exam;
        const gradeInfo = GradeEngine.calculateGrade(total);
        
        const result = {
            id: Storage.generateId(),
            courseId,
            studentId,
            caScore: ca,
            assignmentScore: assignment,
            midtermScore: midterm,
            examScore: exam,
            totalScore: total,
            grade: gradeInfo.grade,
            gradePoints: gradeInfo.points,
            semester: this.getCurrentSemester(),
            lecturerId: Auth.currentUser?.id,
            lecturerName: Auth.currentUser?.name,
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        Storage.add('results', result);
        this.showToast('Result saved as draft!', 'success');
        this.loadPage('enter-results');
    },
    
    submitForApproval() {
        const results = Storage.get('results').filter(r => r.lecturerId === Auth.currentUser?.id && r.status === 'draft');
        results.forEach(result => {
            result.status = 'pending';
            Storage.update('results', result.id, result);
        });
        this.showToast(`${results.length} results submitted for approval!`, 'success');
        this.loadPage('enter-results');
    },
    
    approveResult(resultId) {
        Storage.update('results', resultId, { status: 'approved', approvedAt: new Date().toISOString() });
        this.showToast('Result approved!', 'success');
        this.loadPage('results-review');
    },
    
    rejectResult(resultId) {
        Storage.update('results', resultId, { status: 'rejected' });
        this.showToast('Result rejected!', 'warning');
        this.loadPage('results-review');
    },
    
    publishResults(courseId) {
        const results = Storage.get('results').filter(r => r.courseId === courseId && r.status === 'approved');
        results.forEach(result => {
            result.status = 'published';
            result.publishedAt = new Date().toISOString();
            Storage.update('results', result.id, result);
            
            // Create notification for students
            const student = Storage.findOne('students', s => s.id === result.studentId);
            if (student) {
                Storage.add('notifications', {
                    userId: student.id,
                    title: 'Result Published',
                    message: `Your result for ${result.courseCode || 'course'} has been published.`,
                    timestamp: new Date().toISOString()
                });
            }
        });
        this.showToast(`${results.length} results published!`, 'success');
        this.loadPage('approve-results');
    },
    
    printResult() {
        window.print();
    },
    
    downloadTranscript() {
        this.showToast('Transcript download started...', 'info');
        // In production, this would generate a PDF
        setTimeout(() => {
            this.showToast('Transcript downloaded!', 'success');
        }, 1500);
    },
    
    downloadTranscriptPDF() {
        this.downloadTranscript();
    },
    
    generateSystemReport() {
        this.showToast('System report generated!', 'success');
    },
    
    generateReports() {
        this.loadPage('reports');
    },
    
    showToast(message, type) {
        if (typeof Auth !== 'undefined' && Auth.showToast) {
            Auth.showToast(message, type);
        }
    },
    
    initializePageComponents(page) {
        if (page === 'dashboard' && typeof Chart !== 'undefined') {
            const ctx = document.getElementById('activityChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                        datasets: [{
                            label: 'Results Processed',
                            data: [45, 62, 78, 91, 88, 105],
                            borderColor: '#9b59b6',
                            backgroundColor: 'rgba(155, 89, 182, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
        }
        
        if (page === 'semester-gpa' && typeof Chart !== 'undefined') {
            const ctx = document.getElementById('gpaTrendChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
                        datasets: [{
                            label: 'GPA Progression',
                            data: [3.2, 3.4, 3.5, 3.7, 3.8, 3.9],
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true
                    }
                });
            }
        }
    }
};

// Render sidebar when UI is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector('.sidebar-nav')) {
            UI.renderSidebar();
        }
    });
}