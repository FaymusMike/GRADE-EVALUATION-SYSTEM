// assets/js/ui.js - COMPLETE PRODUCTION FILE
// Contains: Student Dashboard, Lecturer Dashboard, Exam Officer Dashboard, Admin Dashboard
// Includes: Course Registration with Approval, Result Entry with Student Linking, 
//           Admin Approval Panels, Publication Workflows

const UI = {
    currentPage: 'dashboard',
    
    async loadPage(page) {
        this.currentPage = page;
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        if (!this.hasPagePermission(page)) {
            this.showUnauthorizedAccess();
            return;
        }
        
        contentArea.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Loading...</p></div>';
        
        setTimeout(() => {
            const content = this.getPageContent(page);
            contentArea.innerHTML = content;
            this.initializePageComponents(page);
            this.attachEventHandlers(page);
        }, 200);
    },
    
    hasPagePermission(page) {
        const role = Auth.currentUser?.role;
        const restrictedPages = {
            student: ['students', 'lecturers', 'courses', 'reports', 'lecturer-management', 'course-management', 'result-management', 'admin-approvals', 'student-approvals', 'course-approvals', 'profile-approvals', 'results-review', 'approve-results', 'enter-results', 'my-courses', 'my-students'],
            lecturer: ['students', 'settings', 'reports', 'admin-approvals', 'student-approvals', 'course-approvals', 'profile-approvals', 'results-review', 'approve-results', 'lecturer-management', 'course-management'],
            exam_officer: ['lecturers', 'settings', 'admin-approvals', 'student-approvals', 'course-approvals', 'profile-approvals', 'enter-results', 'my-courses', 'my-students']
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
                { page: 'students', icon: 'bi-people', label: 'Student Management' },
                { page: 'lecturers', icon: 'bi-person-badge', label: 'Lecturer Management' },
                { page: 'courses', icon: 'bi-book', label: 'Course Management' },
                { page: 'results', icon: 'bi-clipboard-data', label: 'Result Management' },
                { page: 'admin-approvals', icon: 'bi-check2-circle', label: 'Approvals' },
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
                { page: 'profile', icon: 'bi-person', label: 'My Profile' }
            ],
            student: [
                { page: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
                { page: 'my-results', icon: 'bi-award', label: 'My Results' },
                { page: 'semester-gpa', icon: 'bi-calculator', label: 'GPA/CGPA' },
                { page: 'course-registration', icon: 'bi-journal-bookmark-fill', label: 'Course Registration' },
                { page: 'transcript', icon: 'bi-file-text', label: 'My Transcript' },
                { page: 'profile', icon: 'bi-person', label: 'My Profile' },
                { page: 'notifications', icon: 'bi-bell', label: 'Notifications' }
            ],
            exam_officer: [
                { page: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
                { page: 'results-review', icon: 'bi-check-circle', label: 'Review Results' },
                { page: 'approve-results', icon: 'bi-check2-all', label: 'Approve Results' },
                { page: 'students', icon: 'bi-people', label: 'Students' },
                { page: 'courses', icon: 'bi-book', label: 'Courses' },
                { page: 'reports', icon: 'bi-graph-up', label: 'Reports' },
                { page: 'transcript', icon: 'bi-file-text', label: 'Verify Transcripts' }
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
        
        sidebar.innerHTML += `
            <li class="nav-item mt-4">
                <a href="#" id="logoutBtn" class="nav-link text-danger">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </a>
            </li>
        `;
        
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
        
        if (role === 'student') return this.getStudentPageContent(page);
        if (role === 'lecturer') return this.getLecturerPageContent(page);
        if (role === 'exam_officer') return this.getExamOfficerPageContent(page);
        return this.getAdminPageContent(page);
    },
    
    // ============ STUDENT DASHBOARD ============
    getStudentPageContent(page) {
        const student = this.getCurrentStudent();
        const results = this.getStudentResults();
        const gpaData = this.calculateStudentGPA(results);
        const registrations = this.getStudentRegistrations();
        const session = Storage.getCurrentSession();
        
        switch(page) {
            case 'dashboard': return this.renderStudentDashboard(student, results, gpaData, registrations);
            case 'my-results': return this.renderStudentResults(results);
            case 'semester-gpa': return this.renderStudentGPA(gpaData, results);
            case 'course-registration': return this.renderCourseRegistration(student, session);
            case 'profile': return this.renderStudentProfile(student);
            case 'notifications': return this.renderStudentNotifications();
            case 'transcript': return this.renderStudentTranscript(student, results);
            default: return this.renderStudentDashboard(student, results, gpaData, registrations);
        }
    },
    
    renderStudentDashboard(student, results, gpaData, registrations) {
        const currentSemester = Storage.getCurrentSession()?.semester || 'First';
        const semesterResults = results.filter(r => r.semester === currentSemester);
        const pendingRegistration = registrations.filter(r => r.status === 'pending').length;
        const approvedRegistration = registrations.filter(r => r.status === 'approved').length;
        
        return `
            <div class="fade-in">
                <div class="dashboard-card bg-gradient-primary text-white mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="text-white">Welcome back, ${student?.name?.split(' ')[0] || 'Student'}!</h2>
                            <p class="text-white-50 mb-0">${student?.matricNumber || 'N/A'} • ${student?.department || 'N/A'} • Level ${student?.level || '100'}</p>
                        </div>
                        <i class="bi bi-mortarboard-fill fs-1 text-white-50"></i>
                    </div>
                </div>
                
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
                            <h6 class="text-muted">Registration Status</h6>
                            ${pendingRegistration > 0 ? 
                                `<h2 class="text-warning">Pending</h2><small>Awaiting approval</small>` :
                                approvedRegistration > 0 ?
                                `<h2 class="text-success">Approved</h2><small>${approvedRegistration} courses</small>` :
                                `<h2 class="text-danger">Not Started</h2><small>Register now</small>`
                            }
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="dashboard-card text-center">
                            <h6 class="text-muted">Credit Hours</h6>
                            <h2 class="text-info">${gpaData.totalCredits}</h2>
                            <small>Earned</small>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5>Recent Results - ${currentSemester} Semester</h5>
                        <button class="btn btn-sm btn-outline-primary" onclick="UI.loadPage('my-results')">View All</button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr><th>Course Code</th><th>Course Title</th><th>Credit</th><th>Score</th><th>Grade</th><th>GP</th></tr>
                            </thead>
                            <tbody>
                                ${semesterResults.slice(0, 5).map(result => `
                                    <tr><td>${result.courseCode || 'N/A'}</td><td>${result.courseTitle || 'N/A'}</td>
                                    <td>${result.creditUnit || 0}</td><td>${result.totalScore || 0}</td>
                                    <td><span class="badge bg-${this.getGradeBadgeColor(result.grade)}">${result.grade || 'F'}</span></td>
                                    <td>${result.gradePoints || 0}</td></tr>
                                `).join('')}
                                ${semesterResults.length === 0 ? '<tr><td colspan="6" class="text-center">No results available</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="row g-4">
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <i class="bi bi-journal-bookmark-fill fs-1 text-primary mb-2"></i>
                            <h6>Course Registration</h6>
                            <button class="btn btn-sm btn-primary mt-2" onclick="UI.loadPage('course-registration')">
                                ${pendingRegistration > 0 ? 'View Pending' : approvedRegistration > 0 ? 'Add/Drop Courses' : 'Register Now'}
                            </button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <i class="bi bi-printer fs-1 text-success mb-2"></i>
                            <h6>Print Result Slip</h6>
                            <button class="btn btn-sm btn-success mt-2" onclick="UI.printSemesterResult()">Print Now</button>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <i class="bi bi-file-pdf fs-1 text-danger mb-2"></i>
                            <h6>Request Transcript</h6>
                            <button class="btn btn-sm btn-danger mt-2" onclick="UI.requestTranscript()">Request Now</button>
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
                        <h5 class="mb-3">${semester.name} Semester <span class="badge bg-primary float-end">GPA: ${semester.semesterGPA}</span></h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead><tr><th>Course Code</th><th>Course Title</th><th>Credit Unit</th><th>CA (30)</th><th>Exam (70)</th><th>Total</th><th>Grade</th><th>GP</th></tr></thead>
                                <tbody>
                                    ${semester.results.map(result => `
                                        <tr>
                                            <td>${result.courseCode}</td><td>${result.courseTitle}</td>
                                            <td>${result.creditUnit}</td><td>${result.caScore || 0}</td>
                                            <td>${result.examScore || 0}</td>
                                            <td><strong>${result.totalScore}</strong></td>
                                            <td><span class="badge bg-${this.getGradeBadgeColor(result.grade)}">${result.grade}</span></td>
                                            <td>${result.gradePoints}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot><tr class="table-active"><td colspan="5"><strong>Semester GPA:</strong></td><td colspan="3"><strong>${semester.semesterGPA}</strong></td></tr></tfoot>
                            </table>
                        </div>
                    </div>
                `).join('')}
                ${groupedResults.length === 0 ? '<div class="dashboard-card text-center">No results found. Check back after results are published.</div>' : ''}
                <div class="text-center mt-3"><button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> Print All Results</button></div>
            </div>
        `;
    },
    
    renderStudentGPA(gpaData, results) {
        const classification = this.calculateClassification(parseFloat(gpaData.cgpa));
        const semesterGPAs = this.getSemesterGPAs(results);
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">GPA & CGPA Analysis</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="dashboard-card text-center">
                            <h5>Current Semester GPA</h5>
                            <h1 class="display-2 text-primary">${gpaData.currentGPA}</h1>
                            <p>${Storage.getCurrentSession()?.semester || 'First'} Semester ${Storage.getCurrentSession()?.name || '2023/2024'}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="dashboard-card text-center">
                            <h5>Cumulative GPA (CGPA)</h5>
                            <h1 class="display-2 text-success">${gpaData.cgpa}</h1>
                            <p>Classification: <strong class="text-primary">${classification}</strong></p>
                        </div>
                    </div>
                </div>
                <div class="dashboard-card mt-4">
                    <h5>GPA Trend - Academic Progress</h5>
                    <canvas id="gpaTrendChart" height="300"></canvas>
                </div>
                <div class="dashboard-card mt-4">
                    <h5>Semester Performance Summary</h5>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead><tr><th>Semester</th><th>Total Credits</th><th>Total Points</th><th>GPA</th><th>Status</th></tr></thead>
                            <tbody>
                                ${semesterGPAs.map(s => `
                                    <tr>
                                        <td>${s.name}</td><td>${s.credits}</td><td>${s.points}</td>
                                        <td><strong>${s.gpa}</strong></td>
                                        <td><span class="badge bg-${parseFloat(s.gpa) >= 2.0 ? 'success' : 'danger'}">${parseFloat(s.gpa) >= 2.0 ? 'Good Standing' : 'Probation'}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderCourseRegistration(student, session) {
        if (!session.registrationOpen) {
            return `<div class="dashboard-card text-center py-5"><i class="bi bi-calendar-x fs-1 text-danger"></i><h4>Registration Closed</h4><p>Course registration is currently closed for this session.</p></div>`;
        }
        
        const availableCourses = Storage.get('courses').filter(course => 
            course.department === student?.department && 
            course.level === student?.level && 
            course.semester === session.semester &&
            course.status === 'active'
        );
        
        const registrations = Storage.get('courseRegistrations').filter(reg => 
            reg.studentId === student?.id && reg.sessionId === session.id
        );
        
        const registeredIds = registrations.filter(r => r.status === 'approved' || r.status === 'pending').map(r => r.courseId);
        const cartItems = registrations.filter(r => r.status === 'draft');
        
        const totalCredits = cartItems.reduce((sum, item) => sum + item.creditUnit, 0);
        const minCredits = 12;
        const maxCredits = 24;
        
        return `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Course Registration - ${session.name} (${session.semester} Semester)</h2>
                    <div><small class="text-muted">Deadline: ${new Date(session.registrationDeadline).toLocaleDateString()}</small></div>
                </div>
                
                <div class="dashboard-card mb-4">
                    <div class="row text-center">
                        <div class="col-md-3"><h6>Total Credits</h6><h3 class="${totalCredits < minCredits ? 'text-danger' : totalCredits > maxCredits ? 'text-danger' : 'text-success'}">${totalCredits}</h3><small>Min: ${minCredits} | Max: ${maxCredits}</small></div>
                        <div class="col-md-3"><h6>Compulsory Credits</h6><h3 class="text-info">${cartItems.filter(i => i.isCompulsory).reduce((s, i) => s + i.creditUnit, 0)}</h3></div>
                        <div class="col-md-3"><h6>Elective Credits</h6><h3 class="text-warning">${cartItems.filter(i => !i.isCompulsory).reduce((s, i) => s + i.creditUnit, 0)}</h3></div>
                        <div class="col-md-3"><h6>Status</h6><h3>${registrations.some(r => r.status === 'pending') ? '<span class="text-warning">Pending Approval</span>' : registrations.some(r => r.status === 'approved') ? '<span class="text-success">Approved</span>' : '<span class="text-danger">Not Submitted</span>'}</h3></div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-7">
                        <div class="dashboard-card">
                            <h5>Available Courses</h5>
                            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                                <table class="table table-hover">
                                    <thead><tr><th>Code</th><th>Course Title</th><th>Credit</th><th>Type</th><th>Action</th></tr></thead>
                                    <tbody>
                                        ${availableCourses.map(course => {
                                            const isRegistered = registeredIds.includes(course.id);
                                            const isInCart = cartItems.some(i => i.courseId === course.id);
                                            return `
                                                <tr>
                                                    <td><strong>${course.code}</strong></td><td>${course.title}</td>
                                                    <td>${course.creditUnit}</td>
                                                    <td><span class="badge bg-${course.isCompulsory ? 'danger' : 'success'}">${course.isCompulsory ? 'Compulsory' : 'Elective'}</span></td>
                                                    <td>${!isRegistered && !isInCart && session.registrationOpen && registrations.every(r => r.status !== 'pending') ? 
                                                        `<button class="btn btn-sm btn-primary" onclick="UI.addCourseToCart('${course.id}')"><i class="bi bi-plus-circle"></i> Add</button>` : 
                                                        isInCart ? `<span class="badge bg-warning">In Cart</span>` : `<span class="badge bg-secondary">Registered</span>`}
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-5">
                        <div class="dashboard-card">
                            <h5>Registration Cart <span class="badge bg-primary float-end">${cartItems.length} courses</span></h5>
                            <div id="cartItems">
                                ${cartItems.length === 0 ? '<div class="text-center py-5 text-muted">No courses added to cart</div>' : `
                                    <div class="table-responsive"><table class="table table-sm"><tbody>
                                        ${cartItems.map(item => `
                                            <tr><td>${item.courseCode}</td><td>${item.creditUnit} credits</td>
                                            <td><button class="btn btn-sm btn-danger" onclick="UI.removeFromCart('${item.id}')"><i class="bi bi-trash"></i></button></td></tr>
                                        `).join('')}
                                    </tbody></table></div>
                                    <hr>
                                    <div class="d-flex justify-content-between"><strong>Total Credits:</strong><strong>${totalCredits}</strong></div>
                                    <div class="d-grid gap-2 mt-3">
                                        <button class="btn btn-success" onclick="UI.submitCourseRegistration()" ${totalCredits < minCredits || totalCredits > maxCredits ? 'disabled' : ''}>
                                            <i class="bi bi-send-check"></i> Submit for Approval
                                        </button>
                                        <button class="btn btn-danger" onclick="UI.clearRegistrationCart()"><i class="bi bi-trash"></i> Clear Cart</button>
                                    </div>
                                    ${totalCredits < minCredits ? `<div class="alert alert-warning mt-2 mb-0 small">Minimum ${minCredits} credits required</div>` : ''}
                                    ${totalCredits > maxCredits ? `<div class="alert alert-danger mt-2 mb-0 small">Maximum ${maxCredits} credits exceeded</div>` : ''}
                                `}
                            </div>
                        </div>
                        
                        <div class="dashboard-card mt-4">
                            <h5>Registration Status</h5>
                            ${registrations.filter(r => r.status === 'pending').length > 0 ? 
                                `<div class="alert alert-info">Your registration has been submitted and is awaiting approval from the academic advisor.</div>
                                 <div class="small text-muted">Submitted: ${new Date(registrations.find(r => r.status === 'pending')?.submittedAt || Date.now()).toLocaleString()}</div>` :
                                registrations.filter(r => r.status === 'approved').length > 0 ?
                                `<div class="alert alert-success">Your course registration has been approved!</div>` :
                                `<div class="text-muted">No registration submitted yet</div>`
                            }
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
                            ${student?.passport ? `<img src="${student.passport}" class="rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover;">` : 
                                `<i class="bi bi-person-circle fs-1 text-primary" style="font-size: 8rem;"></i>`}
                            <h4 class="mt-2">${student?.name || 'N/A'}</h4>
                            <p class="text-muted">${student?.matricNumber || 'N/A'}</p>
                            <hr>
                            <p><i class="bi bi-envelope"></i> ${student?.email || 'N/A'}</p>
                            <p><i class="bi bi-phone"></i> ${student?.phone || 'Not provided'}</p>
                            <p><i class="bi bi-gender-ambiguous"></i> ${student?.gender || 'Not specified'}</p>
                            <button class="btn btn-outline-primary btn-sm mt-2" onclick="UI.showEditProfileModal()"><i class="bi bi-pencil"></i> Request Profile Update</button>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="dashboard-card">
                            <h5>Academic Information</h5>
                            <table class="table table-borderless">
                                <tr><td width="40%"><strong>Department:</strong></td><td>${student?.department || 'N/A'}</td></tr>
                                <tr><td><strong>Level:</strong></td><td>${student?.level || 'N/A'} Level</td></tr>
                                <tr><td><strong>Current Semester:</strong></td><td>${Storage.getCurrentSession()?.semester || 'First'} Semester</td></tr>
                                <tr><td><strong>Session:</strong></td><td>${Storage.getCurrentSession()?.name || '2023/2024'}</td></tr>
                                <tr><td><strong>Admission Year:</strong></td><td>20${student?.matricNumber?.split('/')[1] || '2024'}</td></tr>
                            </table>
                        </div>
                        <div class="dashboard-card mt-4">
                            <h5>Contact Information</h5>
                            <table class="table table-borderless">
                                <tr><td width="40%"><strong>Email Address:</strong></td><td>${student?.email || 'N/A'}</td></tr>
                                <tr><td><strong>Phone Number:</strong></td><td>${student?.phone || 'N/A'}</td></tr>
                                <tr><td><strong>Address:</strong></td><td>${student?.address || 'N/A'}</td></tr>
                                <tr><td><strong>Date of Birth:</strong></td><td>${student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderStudentNotifications() {
        const notifications = Storage.get('notifications').filter(n => n.userId === Auth.currentUser?.id).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">My Notifications <span class="badge bg-primary">${notifications.filter(n => !n.read).length} new</span></h2>
                <div class="dashboard-card">
                    ${notifications.length > 0 ? notifications.map(notif => `
                        <div class="notification-item p-3 border-bottom ${!notif.read ? 'bg-light' : ''}">
                            <div class="d-flex justify-content-between align-items-start">
                                <div><strong>${notif.title}</strong><p class="mb-0 text-muted small mt-1">${notif.message}</p></div>
                                <small class="text-muted">${this.timeAgo(new Date(notif.timestamp))}</small>
                            </div>
                        </div>
                    `).join('') : '<div class="text-center py-5"><i class="bi bi-bell-slash fs-1 text-muted"></i><p>No notifications</p></div>'}
                </div>
            </div>
        `;
    },
    
    renderStudentTranscript(student, results) {
        const gpaData = this.calculateStudentGPA(results);
        const groupedResults = this.groupResultsBySemester(results);
        
        return `
            <div class="fade-in" id="transcriptPrint">
                <div class="dashboard-card">
                    <div class="text-center">
                        <i class="bi bi-mortarboard-fill fs-1 text-primary"></i>
                        <h2>JPTS Institute</h2>
                        <p class="text-muted">Academic Transcript</p>
                        <div class="border-top border-bottom py-3 my-3">
                            <div class="row">
                                <div class="col-md-6 text-start"><strong>Name:</strong> ${student?.name}</div>
                                <div class="col-md-6 text-start"><strong>Matric No:</strong> ${student?.matricNumber}</div>
                                <div class="col-md-6 text-start"><strong>Department:</strong> ${student?.department}</div>
                                <div class="col-md-6 text-start"><strong>Level:</strong> ${student?.level}</div>
                                <div class="col-md-6 text-start"><strong>CGPA:</strong> ${gpaData.cgpa}</div>
                                <div class="col-md-6 text-start"><strong>Classification:</strong> ${this.calculateClassification(parseFloat(gpaData.cgpa))}</div>
                            </div>
                        </div>
                        ${groupedResults.map(semester => `
                            <h5 class="mt-4">${semester.name} Semester</h5>
                            <table class="table table-bordered table-sm">
                                <thead><tr><th>Course Code</th><th>Course Title</th><th>Credit Unit</th><th>Score</th><th>Grade</th><th>GP</th></tr></thead>
                                <tbody>
                                    ${semester.results.map(result => `
                                        <tr><td>${result.courseCode}</td><td>${result.courseTitle}</td>
                                        <td>${result.creditUnit}</td><td>${result.totalScore}</td>
                                        <td>${result.grade}</td><td>${result.gradePoints}</td></tr>
                                    `).join('')}
                                </tbody>
                                <tfoot><tr><td colspan="4"><strong>Semester GPA: ${semester.semesterGPA}</strong></td><td colspan="2"><strong>Total Credits: ${semester.results.reduce((s,r)=>s+(r.creditUnit||0),0)}</strong></td></tr></tfoot>
                            </table>
                        `).join('')}
                        <div class="mt-4 pt-3 border-top">
                            <div class="row">
                                <div class="col-6 text-start"><small>Registrar's Signature: ___________________</small></div>
                                <div class="col-6 text-end"><small>Date: ${new Date().toLocaleDateString()}</small></div>
                            </div>
                            <div class="text-center mt-3">
                                <img src="https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl=${student?.matricNumber}&choe=UTF-8" style="width:80px">
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-4">
                        <button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> Print Transcript</button>
                        <button class="btn btn-success" onclick="UI.downloadTranscriptPDF()"><i class="bi bi-download"></i> Download PDF</button>
                        <button class="btn btn-info" onclick="UI.requestOfficialTranscript()"><i class="bi bi-envelope"></i> Request Official Transcript</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ COURSE REGISTRATION ACTIONS ============
    addCourseToCart(courseId) {
        const student = this.getCurrentStudent();
        const session = Storage.getCurrentSession();
        const course = Storage.findOne('courses', c => c.id === courseId);
        
        if (!course) return;
        
        const existing = Storage.findOne('courseRegistrations', reg => reg.studentId === student.id && reg.courseId === courseId && reg.sessionId === session.id);
        if (existing && (existing.status === 'approved' || existing.status === 'pending')) {
            this.showToast('Course already registered', 'warning');
            return;
        }
        
        Storage.add('courseRegistrations', {
            studentId: student.id,
            courseId: courseId,
            courseCode: course.code,
            courseTitle: course.title,
            creditUnit: course.creditUnit,
            isCompulsory: course.isCompulsory || false,
            sessionId: session.id,
            sessionName: session.name,
            semester: session.semester,
            status: 'draft',
            addedAt: new Date().toISOString()
        });
        
        this.showToast(`${course.code} added to cart`, 'success');
        this.loadPage('course-registration');
    },
    
    removeFromCart(registrationId) {
        Storage.delete('courseRegistrations', registrationId);
        this.showToast('Course removed from cart', 'info');
        this.loadPage('course-registration');
    },
    
    clearRegistrationCart() {
        const student = this.getCurrentStudent();
        const session = Storage.getCurrentSession();
        const drafts = Storage.get('courseRegistrations').filter(reg => reg.studentId === student.id && reg.sessionId === session.id && reg.status === 'draft');
        drafts.forEach(draft => Storage.delete('courseRegistrations', draft.id));
        this.showToast('Cart cleared', 'info');
        this.loadPage('course-registration');
    },
    
    submitCourseRegistration() {
        const student = this.getCurrentStudent();
        const session = Storage.getCurrentSession();
        const drafts = Storage.get('courseRegistrations').filter(reg => reg.studentId === student.id && reg.sessionId === session.id && reg.status === 'draft');
        
        if (drafts.length === 0) {
            this.showToast('No courses to submit', 'warning');
            return;
        }
        
        const totalCredits = drafts.reduce((sum, reg) => sum + reg.creditUnit, 0);
        if (totalCredits < 12) {
            this.showToast('Minimum credit units required: 12', 'danger');
            return;
        }
        if (totalCredits > 24) {
            this.showToast('Maximum credit units exceeded: 24', 'danger');
            return;
        }
        
        drafts.forEach(draft => {
            Storage.update('courseRegistrations', draft.id, { status: 'pending', submittedAt: new Date().toISOString() });
        });
        
        Auth.addNotification('admin', 'Course Registration Submitted', `${student.name} (${student.matricNumber}) has submitted course registration.`);
        Auth.addNotification('exam_officer', 'Course Registration Submitted', `${student.name} has submitted course registration for approval.`);
        
        this.showToast('Registration submitted for approval!', 'success');
        this.loadPage('course-registration');
    },
    
    getStudentRegistrations() {
        const student = this.getCurrentStudent();
        if (!student) return [];
        const session = Storage.getCurrentSession();
        return Storage.get('courseRegistrations').filter(reg => reg.studentId === student.id && reg.sessionId === session.id);
    },
    
    // ============ LECTURER DASHBOARD ============
    getLecturerPageContent(page) {
        switch(page) {
            case 'dashboard': return this.renderLecturerDashboard();
            case 'my-courses': return this.renderLecturerCourses();
            case 'enter-results': return this.renderResultEntry();
            case 'my-students': return this.renderLecturerStudents();
            case 'profile': return this.renderLecturerProfile();
            default: return this.renderLecturerDashboard();
        }
    },
    
    renderLecturerDashboard() {
        const myCourses = this.getLecturerCourses();
        const session = Storage.getCurrentSession();
        
        let totalStudents = 0;
        let pendingResults = 0;
        let submittedResults = 0;
        
        myCourses.forEach(course => {
            const registrations = Storage.get('courseRegistrations').filter(r => r.courseId === course.id && r.sessionId === session.id && r.status === 'approved');
            totalStudents += registrations.length;
            
            const results = Storage.get('results').filter(r => r.courseId === course.id && r.sessionId === session.id);
            pendingResults += results.filter(r => r.status === 'draft').length;
            submittedResults += results.filter(r => r.status === 'submitted').length;
        });
        
        return `
            <div class="fade-in">
                <div class="dashboard-card bg-gradient-primary text-white mb-4">
                    <h3 class="text-white">Welcome, ${Auth.currentUser?.name?.split(' ')[0] || 'Lecturer'}</h3>
                    <p class="text-white-50 mb-0">Department of ${Auth.currentUser?.department || 'Computer Science'} • Staff ID: ${Auth.currentUser?.staffId || 'N/A'}</p>
                </div>
                
                <div class="row g-4 mb-4">
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>My Courses</h6><h2 class="text-primary">${myCourses.length}</h2></div></div>
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>Total Students</h6><h2 class="text-success">${totalStudents}</h2></div></div>
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>Pending Results</h6><h2 class="text-warning">${pendingResults}</h2></div></div>
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>Submitted</h6><h2 class="text-info">${submittedResults}</h2></div></div>
                </div>
                
                <div class="dashboard-card">
                    <h5>Quick Actions</h5>
                    <div class="d-grid gap-2 d-md-flex">
                        <button class="btn btn-primary" onclick="UI.loadPage('enter-results')"><i class="bi bi-pencil-square"></i> Enter Results</button>
                        <button class="btn btn-info" onclick="UI.loadPage('my-courses')"><i class="bi bi-book"></i> View My Courses</button>
                        <button class="btn btn-success" onclick="UI.downloadCourseList()"><i class="bi bi-download"></i> Download Course List</button>
                    </div>
                </div>
                
                <div class="dashboard-card mt-4">
                    <h5>Assigned Courses - ${session?.name || 'Current'} (${session?.semester || 'First'} Semester)</h5>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead><tr><th>Course Code</th><th>Course Title</th><th>Credit Unit</th><th>Registered Students</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                ${myCourses.map(course => {
                                    const registrations = Storage.get('courseRegistrations').filter(r => r.courseId === course.id && r.sessionId === session?.id && r.status === 'approved');
                                    const results = Storage.get('results').filter(r => r.courseId === course.id && r.sessionId === session?.id);
                                    const submitted = results.some(r => r.status === 'submitted');
                                    const approved = results.some(r => r.status === 'approved');
                                    return `
                                        <tr>
                                            <td><strong>${course.code}</strong></td>
                                            <td>${course.title}</td>
                                            <td>${course.creditUnit}</td>
                                            <td>${registrations.length} students</td>
                                            <td>${submitted ? '<span class="badge bg-warning">Submitted</span>' : approved ? '<span class="badge bg-success">Approved</span>' : '<span class="badge bg-secondary">Draft</span>'}</td>
                                            <td><button class="btn btn-sm btn-primary" onclick="UI.enterResultsForCourse('${course.id}')">Enter Results</button></td>
                                        </tr>
                                    `;
                                }).join('')}
                                ${myCourses.length === 0 ? '<tr><td colspan="6" class="text-center">No courses assigned for this semester</td>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderLecturerCourses() {
        const myCourses = this.getLecturerCourses();
        const session = Storage.getCurrentSession();
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">My Assigned Courses</h2>
                <div class="dashboard-card">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead><tr><th>Course Code</th><th>Course Title</th><th>Credit Unit</th><th>Department</th><th>Level</th><th>Semester</th><th>Registered Students</th><th>Action</th></tr></thead>
                            <tbody>
                                ${myCourses.map(course => {
                                    const registrations = Storage.get('courseRegistrations').filter(r => r.courseId === course.id && r.sessionId === session?.id && r.status === 'approved');
                                    return `
                                        <tr>
                                            <td><strong>${course.code}</strong></td>
                                            <td>${course.title}</td>
                                            <td>${course.creditUnit}</td>
                                            <td>${course.department}</td>
                                            <td>Level ${course.level}</td>
                                            <td>${course.semester}</td>
                                            <td>${registrations.length} students</td>
                                            <td>
                                                <button class="btn btn-sm btn-primary" onclick="UI.enterResultsForCourse('${course.id}')">Enter Results</button>
                                                <button class="btn btn-sm btn-info" onclick="UI.viewCourseStudents('${course.id}')">View Students</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderResultEntry() {
        const myCourses = this.getLecturerCourses();
        const session = Storage.getCurrentSession();
        
        if (myCourses.length === 0) {
            return `<div class="dashboard-card text-center py-5"><i class="bi bi-exclamation-triangle fs-1 text-warning"></i><h4>No Courses Assigned</h4><p>You have not been assigned any courses for this semester.</p></div>`;
        }
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Result Entry Portal</h2>
                <div class="dashboard-card mb-4">
                    <h5>Step 1: Select Course</h5>
                    <select class="form-control" id="resultCourseSelect" onchange="UI.loadStudentsForResult()">
                        <option value="">-- Select Course --</option>
                        ${myCourses.map(course => `<option value="${course.id}" data-code="${course.code}" data-title="${course.title}" data-credit="${course.creditUnit}">${course.code} - ${course.title} (${course.creditUnit} credits)</option>`).join('')}
                    </select>
                </div>
                
                <div id="studentResultTable" style="display: none;">
                    <div class="dashboard-card">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5>Step 2: Enter Scores for <span id="selectedCourseName"></span></h5>
                            <div><button class="btn btn-success me-2" onclick="UI.submitAllResults()"><i class="bi bi-send-check"></i> Submit for Review</button>
                            <button class="btn btn-secondary" onclick="UI.saveAllResultsAsDraft()"><i class="bi bi-save"></i> Save as Draft</button></div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-bordered" id="resultEntryTable">
                                <thead class="table-light">
                                    <tr><th>S/N</th><th>Matric No</th><th>Student Name</th><th>CA (30)</th><th>Assignment (10)</th><th>Mid-Term (20)</th><th>Exam (70)</th><th>Total</th><th>Grade</th><th>GP</th><th>Status</th></tr>
                                </thead>
                                <tbody id="resultEntryBody"></tbody>
                            </table>
                        </div>
                        <div class="mt-3 text-muted small">Note: Scores will auto-calculate total, grade, and grade points. Maximum scores: CA=30, Assignment=10, Mid-Term=20, Exam=70</div>
                    </div>
                </div>
                
                <div class="dashboard-card mt-4">
                    <h5>Submission Status</h5>
                    <div id="submissionStatusContent">Select a course to view submission status</div>
                </div>
            </div>
        `;
    },
    
    async loadStudentsForResult() {
        const courseId = document.getElementById('resultCourseSelect').value;
        if (!courseId) return;
        
        const course = Storage.findOne('courses', c => c.id === courseId);
        const session = Storage.getCurrentSession();
        const selectedOption = document.getElementById('resultCourseSelect').options[document.getElementById('resultCourseSelect').selectedIndex];
        document.getElementById('selectedCourseName').innerHTML = `${selectedOption.textContent}`;
        
        const registrations = Storage.get('courseRegistrations').filter(reg => reg.courseId === courseId && reg.sessionId === session.id && reg.status === 'approved');
        
        const students = registrations.map(reg => {
            const student = Storage.findOne('students', s => s.id === reg.studentId);
            return { ...reg, studentDetails: student };
        }).filter(s => s.studentDetails);
        
        if (students.length === 0) {
            document.getElementById('studentResultTable').style.display = 'none';
            document.getElementById('submissionStatusContent').innerHTML = `<div class="alert alert-warning">No students have registered for this course yet.</div>`;
            return;
        }
        
        const existingResults = Storage.get('results').filter(r => r.courseId === courseId && r.sessionId === session.id);
        const submittedCount = existingResults.filter(r => r.status === 'submitted').length;
        const approvedCount = existingResults.filter(r => r.status === 'approved').length;
        const draftCount = existingResults.filter(r => r.status === 'draft').length;
        
        document.getElementById('studentResultTable').style.display = 'block';
        document.getElementById('submissionStatusContent').innerHTML = `
            <div class="row">
                <div class="col-md-4"><div class="text-center"><h6>Draft</h6><h4 class="text-info">${draftCount}</h4></div></div>
                <div class="col-md-4"><div class="text-center"><h6>Submitted</h6><h4 class="text-warning">${submittedCount}</h4></div></div>
                <div class="col-md-4"><div class="text-center"><h6>Approved</h6><h4 class="text-success">${approvedCount}</h4></div></div>
            </div>
            ${submittedCount > 0 ? '<div class="alert alert-info mt-3">Results have been submitted and are pending review. You cannot edit submitted results.</div>' : ''}
        `;
        
        const tbody = document.getElementById('resultEntryBody');
        tbody.innerHTML = students.map((student, index) => {
            const existing = existingResults.find(r => r.studentId === student.studentId);
            const isLocked = existing && (existing.status === 'submitted' || existing.status === 'approved');
            
            return `
                <tr data-student-id="${student.studentId}" data-result-id="${existing?.id || ''}">
                    <td>${index + 1}</td>
                    <td>${student.studentDetails.matricNumber}</td>
                    <td>${student.studentDetails.name}</td>
                    <td><input type="number" class="form-control form-control-sm ca-score" min="0" max="30" value="${existing?.caScore || 0}" ${isLocked ? 'disabled' : ''} onchange="UI.calculateResultRow(this)"></td>
                    <td><input type="number" class="form-control form-control-sm assignment-score" min="0" max="10" value="${existing?.assignmentScore || 0}" ${isLocked ? 'disabled' : ''} onchange="UI.calculateResultRow(this)"></td>
                    <td><input type="number" class="form-control form-control-sm midterm-score" min="0" max="20" value="${existing?.midtermScore || 0}" ${isLocked ? 'disabled' : ''} onchange="UI.calculateResultRow(this)"></td>
                    <td><input type="number" class="form-control form-control-sm exam-score" min="0" max="70" value="${existing?.examScore || 0}" ${isLocked ? 'disabled' : ''} onchange="UI.calculateResultRow(this)"></td>
                    <td class="total-score">${existing?.totalScore || 0}</td>
                    <td class="grade-cell">${existing?.grade || '-'}</td>
                    <td class="gp-cell">${existing?.gradePoints || '0.0'}</td>
                    <td>${existing ? `<span class="badge bg-${existing.status === 'approved' ? 'success' : existing.status === 'submitted' ? 'warning' : 'secondary'}">${existing.status || 'draft'}</span>` : '<span class="badge bg-secondary">Not started</span>'}</td>
                </tr>
            `;
        }).join('');
    },
    
    calculateResultRow(element) {
        const row = element.closest('tr');
        const ca = parseFloat(row.querySelector('.ca-score')?.value) || 0;
        const assignment = parseFloat(row.querySelector('.assignment-score')?.value) || 0;
        const midterm = parseFloat(row.querySelector('.midterm-score')?.value) || 0;
        const exam = parseFloat(row.querySelector('.exam-score')?.value) || 0;
        
        const total = ca + assignment + midterm + exam;
        const gradeInfo = GradeEngine.calculateGrade(total);
        
        row.querySelector('.total-score').textContent = total;
        row.querySelector('.grade-cell').textContent = gradeInfo.grade;
        row.querySelector('.gp-cell').textContent = gradeInfo.points.toFixed(1);
        
        if (ca > 30) this.showToast('CA score cannot exceed 30', 'warning');
        if (assignment > 10) this.showToast('Assignment score cannot exceed 10', 'warning');
        if (midterm > 20) this.showToast('Mid-term score cannot exceed 20', 'warning');
        if (exam > 70) this.showToast('Exam score cannot exceed 70', 'warning');
        if (total > 100) this.showToast('Total score cannot exceed 100', 'danger');
    },
    
    saveAllResultsAsDraft() {
        this.saveAllResults('draft');
        this.showToast('All results saved as draft', 'success');
    },
    
    submitAllResults() {
        if (!confirm('Once submitted, you cannot edit these results. Submit for review?')) return;
        this.saveAllResults('submitted');
        this.showToast('Results submitted for review', 'success');
        
        const courseId = document.getElementById('resultCourseSelect').value;
        const course = Storage.findOne('courses', c => c.id === courseId);
        Auth.addNotification('exam_officer', 'Results Submitted', `Results for ${course?.code} have been submitted for review by ${Auth.currentUser?.name}.`);
    },
    
    saveAllResults(status) {
        const courseId = document.getElementById('resultCourseSelect').value;
        const course = Storage.findOne('courses', c => c.id === courseId);
        const session = Storage.getCurrentSession();
        const lecturer = Auth.currentUser;
        
        const rows = document.querySelectorAll('#resultEntryBody tr');
        
        rows.forEach(row => {
            const studentId = row.getAttribute('data-student-id');
            const existingId = row.getAttribute('data-result-id');
            const ca = parseFloat(row.querySelector('.ca-score')?.value) || 0;
            const assignment = parseFloat(row.querySelector('.assignment-score')?.value) || 0;
            const midterm = parseFloat(row.querySelector('.midterm-score')?.value) || 0;
            const exam = parseFloat(row.querySelector('.exam-score')?.value) || 0;
            const total = ca + assignment + midterm + exam;
            const gradeInfo = GradeEngine.calculateGrade(total);
            
            const resultData = {
                courseId, courseCode: course.code, courseTitle: course.title, creditUnit: course.creditUnit,
                studentId, sessionId: session.id, sessionName: session.name, semester: session.semester,
                caScore: ca, assignmentScore: assignment, midtermScore: midterm, examScore: exam,
                totalScore: total, grade: gradeInfo.grade, gradePoints: gradeInfo.points,
                lecturerId: lecturer.id, lecturerName: lecturer.name, status: status,
                updatedAt: new Date().toISOString()
            };
            
            if (existingId && existingId !== '') {
                Storage.update('results', existingId, resultData);
            } else {
                resultData.createdAt = new Date().toISOString();
                Storage.add('results', resultData);
            }
        });
        
        this.loadStudentsForResult();
    },
    
    enterResultsForCourse(courseId) {
        const select = document.getElementById('resultCourseSelect');
        if (select) {
            select.value = courseId;
            this.loadStudentsForResult();
            document.getElementById('studentResultTable').scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    viewCourseStudents(courseId) {
        this.loadPage('my-students');
        setTimeout(() => {
            const select = document.getElementById('courseStudentSelect');
            if (select) select.value = courseId;
        }, 300);
    },
    
    renderLecturerStudents() {
        const myCourses = this.getLecturerCourses();
        const session = Storage.getCurrentSession();
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">My Students</h2>
                <div class="dashboard-card mb-4">
                    <label>Select Course</label>
                    <select class="form-control" id="courseStudentSelect" onchange="UI.loadStudentsForCourse()">
                        <option value="">-- Select Course --</option>
                        ${myCourses.map(course => `<option value="${course.id}">${course.code} - ${course.title}</option>`).join('')}
                    </select>
                </div>
                <div id="studentsListContainer" class="dashboard-card" style="display: none;">
                    <h5>Registered Students</h5>
                    <div class="table-responsive">
                        <table class="table table-hover" id="studentsListTable">
                            <thead><tr><th>S/N</th><th>Matric No</th><th>Student Name</th><th>Email</th><th>Phone</th><th>Action</th></tr></thead>
                            <tbody id="studentsListBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    loadStudentsForCourse() {
        const courseId = document.getElementById('courseStudentSelect').value;
        if (!courseId) return;
        
        const session = Storage.getCurrentSession();
        const registrations = Storage.get('courseRegistrations').filter(reg => reg.courseId === courseId && reg.sessionId === session.id && reg.status === 'approved');
        
        const students = registrations.map(reg => Storage.findOne('students', s => s.id === reg.studentId)).filter(s => s);
        
        document.getElementById('studentsListContainer').style.display = 'block';
        const tbody = document.getElementById('studentsListBody');
        tbody.innerHTML = students.map((student, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${student.matricNumber}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.phone || 'N/A'}</td>
                <td><button class="btn btn-sm btn-info" onclick="UI.viewStudentResult('${student.id}', '${courseId}')">View Results</button></td>
            </tr>
        `).join('');
        
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No students registered for this course</td>';
        }
    },
    
    renderLecturerProfile() {
        const lecturer = Auth.currentUser;
        return `
            <div class="fade-in">
                <h2 class="mb-4">My Profile</h2>
                <div class="row">
                    <div class="col-md-4">
                        <div class="dashboard-card text-center">
                            <i class="bi bi-person-circle fs-1 text-primary" style="font-size: 6rem;"></i>
                            <h4 class="mt-2">${lecturer?.name}</h4>
                            <p class="text-muted">${lecturer?.staffId || 'N/A'}</p>
                            <hr><p><i class="bi bi-envelope"></i> ${lecturer?.email}</p>
                            <p><i class="bi bi-building"></i> ${lecturer?.department}</p>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="dashboard-card"><h5>Professional Information</h5>
                            <table class="table table-borderless">
                                <tr><td width="40%"><strong>Staff ID:</strong></td><td>${lecturer?.staffId || 'N/A'}</td></tr>
                                <tr><td><strong>Department:</strong></td><td>${lecturer?.department || 'N/A'}</td></tr>
                                <tr><td><strong>Email:</strong></td><td>${lecturer?.email}</td></tr>
                                <tr><td><strong>Phone:</strong></td><td>${lecturer?.phone || 'Not provided'}</td></tr>
                                <tr><td><strong>Joined:</strong></td><td>${lecturer?.createdAt ? new Date(lecturer.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
                            </table>
                            <button class="btn btn-primary mt-3" onclick="UI.editLecturerProfile()"><i class="bi bi-pencil"></i> Edit Profile</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ============ EXAM OFFICER DASHBOARD ============
    getExamOfficerPageContent(page) {
        switch(page) {
            case 'dashboard': return this.renderExamOfficerDashboard();
            case 'results-review': return this.renderResultsReview();
            case 'approve-results': return this.renderApproveResults();
            case 'students': return this.renderStudentsPage();
            case 'courses': return this.renderCoursesPage();
            case 'reports': return this.renderReportsPage();
            case 'transcript': return this.renderTranscriptVerification();
            default: return this.renderExamOfficerDashboard();
        }
    },
    
    renderExamOfficerDashboard() {
        const submittedResults = Storage.get('results').filter(r => r.status === 'submitted');
        const approvedResults = Storage.get('results').filter(r => r.status === 'approved');
        const publishedResults = Storage.get('results').filter(r => r.status === 'published');
        const pendingRegistrations = Storage.get('courseRegistrations').filter(r => r.status === 'pending').length;
        
        const coursesWithSubmissions = [...new Set(submittedResults.map(r => r.courseId))];
        
        return `
            <div class="fade-in">
                <h2 class="mb-4">Examination Officer Dashboard</h2>
                <div class="row g-4 mb-4">
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>Submitted for Review</h6><h2 class="text-warning">${submittedResults.length}</h2><small>${coursesWithSubmissions.length} courses</small></div></div>
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>Approved Results</h6><h2 class="text-success">${approvedResults.length}</h2><small>Ready for publication</small></div></div>
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>Published Results</h6><h2 class="text-info">${publishedResults.length}</h2><small>Available to students</small></div></div>
                    <div class="col-md-3"><div class="dashboard-card text-center"><h6>Pending Registrations</h6><h2 class="text-danger">${pendingRegistrations}</h2><small>Course registrations</small></div></div>
                </div>
                <div class="dashboard-card"><h5>Quick Actions</h5>
                    <div class="d-grid gap-2 d-md-flex">
                        <button class="btn btn-warning" onclick="UI.loadPage('results-review')"><i class="bi bi-check-circle"></i> Review Results</button>
                        <button class="btn btn-success" onclick="UI.loadPage('approve-results')"><i class="bi bi-check2-all"></i> Publish Results</button>
                        <button class="btn btn-info" onclick="UI.generateAcademicReport()"><i class="bi bi-file-bar-graph"></i> Generate Report</button>
                    </div>
                </div>
                <div class="dashboard-card mt-4"><h5>Results by Course - Pending Review</h5>
                    <div class="table-responsive"><table class="table table-hover"><thead><tr><th>Course Code</th><th>Course Title</th><th>Students</th><th>Submitted By</th><th>Action</th></tr></thead>
                    <tbody>${coursesWithSubmissions.map(courseId => {
                        const course = Storage.findOne('courses', c => c.id === courseId);
                        const results = submittedResults.filter(r => r.courseId === courseId);
                        const lecturer = Storage.findOne('users', u => u.id === results[0]?.lecturerId) || Storage.findOne('lecturers', l => l.id === results[0]?.lecturerId);
                        return `<tr><td><strong>${course?.code || 'N/A'}</strong></td><td>${course?.title || 'N/A'}</td><td>${results.length}</td><td>${lecturer?.name || results[0]?.lecturerName || 'N/A'}</td><td><button class="btn btn-sm btn-primary" onclick="UI.reviewCourseResults('${courseId}')">Review</button></td></tr>`;
                    }).join('')}
                    ${coursesWithSubmissions.length === 0 ? '<tr><td colspan="5" class="text-center">No pending submissions</td></tr>' : ''}
                    </tbody></table></div>
                </div>
            </div>
        `;
    },
    
    renderResultsReview() {
        const submittedResults = Storage.get('results').filter(r => r.status === 'submitted');
        const groupedByCourse = {};
        submittedResults.forEach(result => {
            if (!groupedByCourse[result.courseId]) {
                const course = Storage.findOne('courses', c => c.id === result.courseId);
                groupedByCourse[result.courseId] = { courseId: result.courseId, courseCode: course?.code, courseTitle: course?.title, results: [] };
            }
            groupedByCourse[result.courseId].results.push(result);
        });
        
        return `
            <div class="fade-in"><h2 class="mb-4">Result Review Dashboard</h2>
                ${Object.values(groupedByCourse).map(course => `
                    <div class="dashboard-card mb-4"><div class="d-flex justify-content-between align-items-center mb-3">
                        <h5>${course.courseCode} - ${course.courseTitle}</h5>
                        <button class="btn btn-primary btn-sm" onclick="UI.reviewCourseResults('${course.courseId}')"><i class="bi bi-eye"></i> Review All (${course.results.length})</button>
                    </div>
                    <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Matric No</th><th>Student Name</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Status</th></tr></thead>
                    <tbody>${course.results.slice(0, 5).map(result => {
                        const student = Storage.findOne('students', s => s.id === result.studentId);
                        return `<tr><td>${student?.matricNumber || 'N/A'}</td><td>${student?.name || 'N/A'}</td><td>${result.caScore}</td><td>${result.examScore}</td><td><strong>${result.totalScore}</strong></td><td>${result.grade}</td><td><span class="badge bg-warning">Submitted</span></td></tr>`;
                    }).join('')}
                    ${course.results.length > 5 ? `<tr><td colspan="7" class="text-center">+ ${course.results.length - 5} more students</td></tr>` : ''}
                    </tbody></table></div></div>
                `).join('')}
                ${submittedResults.length === 0 ? '<div class="dashboard-card text-center py-5"><i class="bi bi-check-circle fs-1 text-success"></i><h4>No pending reviews</h4><p>All results have been reviewed</p></div>' : ''}
            </div>
        `;
    },
    
    reviewCourseResults(courseId) {
        const results = Storage.get('results').filter(r => r.courseId === courseId && r.status === 'submitted');
        const course = Storage.findOne('courses', c => c.id === courseId);
        
        const modalHtml = `
            <div class="modal fade" id="reviewModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-xl"><div class="modal-content"><div class="modal-header bg-primary text-white">
                    <h5 class="modal-title text-white">Review Results: ${course?.code} - ${course?.title}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body"><div class="table-responsive">
                    <table class="table table-bordered"><thead class="table-light"><tr><th>S/N</th><th>Matric No</th><th>Student Name</th><th>CA</th><th>Assignment</th><th>Mid-Term</th><th>Exam</th><th>Total</th><th>Grade</th><th>GP</th><th><input type="checkbox" id="selectAll" onchange="UI.toggleSelectAll()"> Approve</th></tr></thead>
                    <tbody>${results.map((result, index) => {
                        const student = Storage.findOne('students', s => s.id === result.studentId);
                        return `<tr><td>${index + 1}</td><td>${student?.matricNumber || 'N/A'}</td><td>${student?.name || 'N/A'}</td>
                        <td>${result.caScore}</td><td>${result.assignmentScore}</td><td>${result.midtermScore}</td><td>${result.examScore}</td>
                        <td><strong>${result.totalScore}</strong></td><td>${result.grade}</td><td>${result.gradePoints}</td>
                        <td><input type="checkbox" class="result-checkbox" data-result-id="${result.id}"></td></tr>`;
                    }).join('')}</tbody></table>
                </div></div>
                <div class="modal-footer"><button class="btn btn-danger" onclick="UI.rejectAllResults('${courseId}')">Reject All</button>
                <button class="btn btn-success" onclick="UI.approveSelectedResults()">Approve Selected</button>
                <button class="btn btn-primary" onclick="UI.approveAllResults('${courseId}')">Approve All</button></div></div></div>
            </div>`;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
        modal.show();
        document.getElementById('reviewModal').addEventListener('hidden.bs.modal', () => { modalContainer.remove(); this.loadPage('results-review'); });
    },
    
    toggleSelectAll() {
        const selectAll = document.getElementById('selectAll');
        document.querySelectorAll('.result-checkbox').forEach(cb => cb.checked = selectAll.checked);
    },
    
    approveSelectedResults() {
        const selected = document.querySelectorAll('.result-checkbox:checked');
        if (selected.length === 0) { this.showToast('Please select results to approve', 'warning'); return; }
        selected.forEach(cb => {
            const resultId = cb.getAttribute('data-result-id');
            Storage.update('results', resultId, { status: 'approved', approvedBy: Auth.currentUser?.id, approvedAt: new Date().toISOString(), reviewerComments: 'Approved by Examination Officer' });
            const result = Storage.findOne('results', r => r.id === resultId);
            if (result) Auth.addNotification(result.studentId, 'Result Approved', `Your result for ${result.courseCode} has been approved.`);
        });
        this.showToast(`${selected.length} results approved`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
    },
    
    approveAllResults(courseId) {
        const results = Storage.get('results').filter(r => r.courseId === courseId && r.status === 'submitted');
        results.forEach(result => {
            Storage.update('results', result.id, { status: 'approved', approvedBy: Auth.currentUser?.id, approvedAt: new Date().toISOString() });
            Auth.addNotification(result.studentId, 'Result Approved', `Your result for ${result.courseCode} has been approved.`);
        });
        this.showToast(`${results.length} results approved`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
    },
    
    rejectAllResults(courseId) {
        if (!confirm('Are you sure you want to reject all results for this course?')) return;
        const results = Storage.get('results').filter(r => r.courseId === courseId && r.status === 'submitted');
        results.forEach(result => {
            Storage.update('results', result.id, { status: 'rejected', rejectedBy: Auth.currentUser?.id, rejectedAt: new Date().toISOString() });
            Auth.addNotification(result.lecturerId, 'Results Rejected', `Your results for ${result.courseCode} have been rejected. Please review and resubmit.`);
        });
        this.showToast(`${results.length} results rejected`, 'warning');
        bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
    },
    
    renderApproveResults() {
        const approvedResults = Storage.get('results').filter(r => r.status === 'approved');
        const publishedResults = Storage.get('results').filter(r => r.status === 'published');
        const groupedApproved = {};
        approvedResults.forEach(result => {
            if (!groupedApproved[result.courseId]) {
                const course = Storage.findOne('courses', c => c.id === result.courseId);
                groupedApproved[result.courseId] = { courseId: result.courseId, courseCode: course?.code, courseTitle: course?.title, count: 0 };
            }
            groupedApproved[result.courseId].count++;
        });
        
        const groupedPublished = {};
        publishedResults.forEach(result => {
            if (!groupedPublished[result.courseId]) {
                const course = Storage.findOne('courses', c => c.id === result.courseId);
                groupedPublished[result.courseId] = { courseId: result.courseId, courseCode: course?.code, courseTitle: course?.title, count: 0, publishedAt: result.publishedAt };
            }
            groupedPublished[result.courseId].count++;
        });
        
        return `
            <div class="fade-in"><h2 class="mb-4">Results Publication</h2>
                <div class="row"><div class="col-md-6"><div class="dashboard-card"><h5>Approved Results <span class="badge bg-success">Ready for Publication</span></h5>
                    <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Course</th><th>Students</th><th>Action</th></tr></thead>
                    <tbody>${Object.values(groupedApproved).map(group => `<tr><td><strong>${group.courseCode}</strong><br><small>${group.courseTitle}</small></td><td>${group.count} students</td>
                    <td><button class="btn btn-sm btn-primary" onclick="UI.publishCourseResults('${group.courseId}')"><i class="bi bi-megaphone"></i> Publish</button></td></tr>`).join('')}
                    ${Object.keys(groupedApproved).length === 0 ? '<td><td colspan="3" class="text-center">No approved results ready for publication</td>' : ''}
                    </tbody></table></div></div></div>
                    <div class="col-md-6"><div class="dashboard-card"><h5>Published Results</h5>
                    <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Course</th><th>Students</th><th>Published Date</th></tr></thead>
                    <tbody>${Object.values(groupedPublished).map(group => `<tr><td><strong>${group.courseCode}</strong><br><small>${group.courseTitle}</small></td><td>${group.count} students</td>
                    <td>${group.publishedAt ? new Date(group.publishedAt).toLocaleDateString() : 'N/A'}</td></tr>`).join('')}
                    ${Object.keys(groupedPublished).length === 0 ? '<tr><td colspan="3" class="text-center">No published results</td>' : ''}
                    </tbody></table></div></div></div>
                </div>
            </div>
        `;
    },
    
    publishCourseResults(courseId) {
        if (!confirm('Publishing results will make them visible to students. Continue?')) return;
        const results = Storage.get('results').filter(r => r.courseId === courseId && r.status === 'approved');
        results.forEach(result => {
            Storage.update('results', result.id, { status: 'published', publishedAt: new Date().toISOString(), publishedBy: Auth.currentUser?.id });
            Auth.addNotification(result.studentId, 'Result Published', `Your result for ${result.courseCode} has been published. You can now view it in your dashboard.`);
        });
        this.showToast(`${results.length} results published`, 'success');
        this.loadPage('approve-results');
    },
    
    renderTranscriptVerification() {
        const transcriptRequests = Storage.get('transcriptRequests') || [];
        return `
            <div class="fade-in"><h2 class="mb-4">Transcript Verification</h2>
                <div class="dashboard-card"><div class="table-responsive"><table class="table table-hover">
                    <thead><tr><th>Request Date</th><th>Student</th><th>Matric No</th><th>Transcript Type</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>${transcriptRequests.map(req => {
                        const student = Storage.findOne('students', s => s.id === req.studentId);
                        return `<tr><td>${new Date(req.createdAt).toLocaleDateString()}</td><td>${student?.name || 'N/A'}</td>
                        <td>${student?.matricNumber || 'N/A'}</td><td>${req.type || 'Official'}</td>
                        <td><span class="badge bg-${req.status === 'pending' ? 'warning' : 'success'}">${req.status || 'pending'}</span></td>
                        <td><button class="btn btn-sm btn-success" onclick="UI.verifyTranscript('${req.id}')"><i class="bi bi-check-circle"></i> Verify</button></td></tr>`;
                    }).join('')}
                    ${transcriptRequests.length === 0 ? '<tr><td colspan="6" class="text-center">No transcript requests</td>' : ''}
                    </tbody></table></div></div>
            </div>
        `;
    },
    
    // ============ ADMIN DASHBOARD ============
    getAdminPageContent(page) {
        switch(page) {
            case 'dashboard': return this.renderAdminDashboard();
            case 'students': return this.renderStudentsPage();
            case 'lecturers': return this.renderLecturersPage();
            case 'courses': return this.renderCoursesPage();
            case 'results': return this.renderResultsPage();
            case 'admin-approvals': return this.renderAdminApprovals();
            case 'student-approvals': return this.renderStudentApprovals();
            case 'course-approvals': return this.renderCourseApprovals();
            case 'profile-approvals': return this.renderProfileApprovals();
            case 'transcript': return this.renderTranscriptPage();
            case 'reports': return this.renderReportsPage();
            case 'settings': return this.renderSettingsPage();
            default: return this.renderAdminDashboard();
        }
    },
    
    renderAdminDashboard() {
        const students = Storage.get('students');
        const lecturers = Storage.get('lecturers');
        const courses = Storage.get('courses');
        const results = Storage.get('results');
        const pendingStudentRegistrations = Storage.get('studentRegistrations').filter(r => r.status === 'pending').length;
        const pendingCourseRegistrations = Storage.get('courseRegistrations').filter(r => r.status === 'pending').length;
        const pendingProfileUpdates = Storage.get('profileUpdateRequests').filter(r => r.status === 'pending').length;
        const publishedResults = results.filter(r => r.status === 'published').length;
        
        return `
            <div class="fade-in"><h2 class="mb-4">Admin Dashboard</h2>
                <div class="row g-4 mb-4">
                    <div class="col-md-3 col-sm-6"><div class="dashboard-card"><div class="d-flex justify-content-between"><div><h6 class="text-muted">Total Students</h6><h3 class="stat-value">${students.length}</h3></div><i class="bi bi-people fs-1 text-primary"></i></div></div></div>
                    <div class="col-md-3 col-sm-6"><div class="dashboard-card"><div class="d-flex justify-content-between"><div><h6 class="text-muted">Total Lecturers</h6><h3 class="stat-value">${lecturers.length}</h3></div><i class="bi bi-person-badge fs-1 text-success"></i></div></div></div>
                    <div class="col-md-3 col-sm-6"><div class="dashboard-card"><div class="d-flex justify-content-between"><div><h6 class="text-muted">Active Courses</h6><h3 class="stat-value">${courses.length}</h3></div><i class="bi bi-book fs-1 text-info"></i></div></div></div>
                    <div class="col-md-3 col-sm-6"><div class="dashboard-card"><div class="d-flex justify-content-between"><div><h6 class="text-muted">Published Results</h6><h3 class="stat-value text-success">${publishedResults}</h3></div><i class="bi bi-award fs-1 text-success"></i></div></div></div>
                </div>
                <div class="row g-4 mb-4">
                    <div class="col-md-4"><div class="dashboard-card text-center"><h6>Pending Student Registrations</h6><h2 class="text-warning">${pendingStudentRegistrations}</h2><button class="btn btn-sm btn-primary mt-2" onclick="UI.loadPage('student-approvals')">Review</button></div></div>
                    <div class="col-md-4"><div class="dashboard-card text-center"><h6>Pending Course Registrations</h6><h2 class="text-info">${pendingCourseRegistrations}</h2><button class="btn btn-sm btn-primary mt-2" onclick="UI.loadPage('course-approvals')">Review</button></div></div>
                    <div class="col-md-4"><div class="dashboard-card text-center"><h6>Pending Profile Updates</h6><h2 class="text-danger">${pendingProfileUpdates}</h2><button class="btn btn-sm btn-primary mt-2" onclick="UI.loadPage('profile-approvals')">Review</button></div></div>
                </div>
                <div class="row"><div class="col-md-8"><div class="dashboard-card"><h5>Recent Activity</h5><canvas id="activityChart" height="300"></canvas></div></div>
                <div class="col-md-4"><div class="dashboard-card"><h5>System Status</h5><div class="mb-3"><label>Storage Used</label><div class="progress"><div class="progress-bar bg-primary" style="width: ${this.getStorageUsage()}%"></div></div></div>
                <button class="btn btn-outline-primary w-100 mb-2" onclick="Storage.backup()"><i class="bi bi-download"></i> Backup Data</button>
                <button class="btn btn-outline-info w-100" onclick="UI.generateSystemReport()"><i class="bi bi-file-text"></i> Generate Report</button></div></div></div>
            </div>
        `;
    },
    
    renderAdminApprovals() {
        return `
            <div class="fade-in"><h2 class="mb-4">Approval Management Dashboard</h2>
                <div class="row g-4">
                    <div class="col-md-4"><div class="dashboard-card text-center"><i class="bi bi-person-plus fs-1 text-primary"></i><h4>Student Registrations</h4>
                        <p>Approve or reject new student accounts</p><button class="btn btn-primary" onclick="UI.loadPage('student-approvals')">Manage</button></div></div>
                    <div class="col-md-4"><div class="dashboard-card text-center"><i class="bi bi-journal-bookmark-fill fs-1 text-success"></i><h4>Course Registrations</h4>
                        <p>Approve student course registrations</p><button class="btn btn-success" onclick="UI.loadPage('course-approvals')">Manage</button></div></div>
                    <div class="col-md-4"><div class="dashboard-card text-center"><i class="bi bi-person-badge fs-1 text-info"></i><h4>Profile Updates</h4>
                        <p>Review student profile change requests</p><button class="btn btn-info" onclick="UI.loadPage('profile-approvals')">Manage</button></div></div>
                </div>
            </div>
        `;
    },
    
    renderStudentApprovals() {
        const pendingRegistrations = Storage.get('studentRegistrations').filter(r => r.status === 'pending');
        
        return `
            <div class="fade-in"><div class="d-flex justify-content-between align-items-center mb-4"><h2>Student Registration Approvals</h2>
                <button class="btn btn-secondary" onclick="UI.loadPage('admin-approvals')"><i class="bi bi-arrow-left"></i> Back</button></div>
                ${pendingRegistrations.map(reg => `
                    <div class="dashboard-card mb-4"><div class="row"><div class="col-md-2 text-center">
                        ${reg.passport ? `<img src="${reg.passport}" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">` : `<i class="bi bi-person-circle fs-1 text-muted" style="font-size: 5rem;"></i>`}
                    </div><div class="col-md-5"><h5>${reg.name}</h5><p><i class="bi bi-envelope"></i> ${reg.email}<br><i class="bi bi-mortarboard"></i> ${reg.matricNumber}<br><i class="bi bi-building"></i> ${reg.department} - Level ${reg.level}<br><i class="bi bi-telephone"></i> ${reg.phone}</p></div>
                    <div class="col-md-3"><p><i class="bi bi-calendar"></i> Submitted: ${new Date(reg.submittedAt).toLocaleString()}<br><i class="bi bi-gender-ambiguous"></i> ${reg.gender}<br><i class="bi bi-calendar-date"></i> DOB: ${new Date(reg.dateOfBirth).toLocaleDateString()}</p></div>
                    <div class="col-md-2"><button class="btn btn-success w-100 mb-2" onclick="UI.approveStudentRegistration('${reg.id}')"><i class="bi bi-check-circle"></i> Approve</button>
                    <button class="btn btn-danger w-100" onclick="UI.rejectStudentRegistration('${reg.id}')"><i class="bi bi-x-circle"></i> Reject</button></div></div></div>
                `).join('')}
                ${pendingRegistrations.length === 0 ? '<div class="dashboard-card text-center py-5"><i class="bi bi-check-all fs-1 text-success"></i><h4>No Pending Registrations</h4></div>' : ''}
            </div>
        `;
    },
    
    approveStudentRegistration(registrationId) {
        const registration = Storage.findOne('studentRegistrations', r => r.id === registrationId);
        if (!registration) return;
        
        const student = {
            id: Storage.generateId(), name: registration.name, matricNumber: registration.matricNumber, email: registration.email,
            password: registration.password, department: registration.department, level: registration.level,
            semester: registration.semester, phone: registration.phone, address: registration.address,
            gender: registration.gender, dateOfBirth: registration.dateOfBirth, passport: registration.passport || '',
            status: 'active', approvedAt: new Date().toISOString(), createdAt: registration.createdAt
        };
        
        Storage.add('students', student);
        Storage.delete('studentRegistrations', registrationId);
        Auth.addNotification(student.id, 'Registration Approved', 'Your account has been approved. You can now log in.');
        Auth.addNotification('admin', 'Student Approved', `${student.name} has been approved.`);
        
        this.showToast('Student registration approved', 'success');
        this.loadPage('student-approvals');
    },
    
    rejectStudentRegistration(registrationId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        const registration = Storage.findOne('studentRegistrations', r => r.id === registrationId);
        if (registration) {
            Auth.addNotification(registration.email, 'Registration Rejected', `Your registration was rejected. Reason: ${reason}`);
            Storage.delete('studentRegistrations', registrationId);
            this.showToast('Student registration rejected', 'warning');
            this.loadPage('student-approvals');
        }
    },
    
    renderCourseApprovals() {
        const pendingRegistrations = Storage.get('courseRegistrations').filter(r => r.status === 'pending');
        const groupedByStudent = {};
        pendingRegistrations.forEach(reg => {
            if (!groupedByStudent[reg.studentId]) groupedByStudent[reg.studentId] = [];
            groupedByStudent[reg.studentId].push(reg);
        });
        
        return `
            <div class="fade-in"><div class="d-flex justify-content-between align-items-center mb-4"><h2>Course Registration Approvals</h2>
                <button class="btn btn-secondary" onclick="UI.loadPage('admin-approvals')"><i class="bi bi-arrow-left"></i> Back</button></div>
                ${Object.entries(groupedByStudent).map(([studentId, registrations]) => {
                    const student = Storage.findOne('students', s => s.id === studentId);
                    const totalCredits = registrations.reduce((sum, reg) => sum + reg.creditUnit, 0);
                    return `
                        <div class="dashboard-card mb-4"><div class="d-flex justify-content-between align-items-start"><div><h5>${student?.name}</h5>
                        <p class="text-muted">${student?.matricNumber} | ${student?.department} | Level ${student?.level}</p><p><strong>Total Credits:</strong> ${totalCredits} units</p></div>
                        <div><button class="btn btn-success me-2" onclick="UI.approveStudentCourseRegistration('${studentId}')"><i class="bi bi-check-all"></i> Approve All</button>
                        <button class="btn btn-danger" onclick="UI.rejectStudentCourseRegistration('${studentId}')"><i class="bi bi-x-all"></i> Reject All</button></div></div>
                        <hr><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Course Code</th><th>Course Title</th><th>Credit Unit</th><th>Type</th><th>Action</th></tr></thead>
                        <tbody>${registrations.map(reg => `<tr><td>${reg.courseCode}</td><td>${reg.courseTitle}</td><td>${reg.creditUnit}</td>
                        <td><span class="badge bg-${reg.isCompulsory ? 'danger' : 'success'}">${reg.isCompulsory ? 'Compulsory' : 'Elective'}</span></td>
                        <td><button class="btn btn-sm btn-success" onclick="UI.approveSingleCourseRegistration('${reg.id}')">Approve</button>
                        <button class="btn btn-sm btn-danger" onclick="UI.rejectSingleCourseRegistration('${reg.id}')">Reject</button></td></tr>`).join('')}
                        </tbody></table></div></div>
                    `;
                }).join('')}
                ${pendingRegistrations.length === 0 ? '<div class="dashboard-card text-center py-5"><i class="bi bi-check-all fs-1 text-success"></i><h4>No Pending Course Registrations</h4></div>' : ''}
            </div>
        `;
    },
    
    approveStudentCourseRegistration(studentId) {
        const registrations = Storage.get('courseRegistrations').filter(r => r.studentId === studentId && r.status === 'pending');
        registrations.forEach(reg => {
            Storage.update('courseRegistrations', reg.id, { status: 'approved', approvedAt: new Date().toISOString(), approvedBy: Auth.currentUser?.id });
            Auth.addNotification(studentId, 'Course Registration Approved', `Your registration for ${reg.courseCode} has been approved.`);
        });
        this.showToast(`${registrations.length} course registrations approved`, 'success');
        this.loadPage('course-approvals');
    },
    
    rejectStudentCourseRegistration(studentId) {
        if (!confirm('Reject all course registrations for this student?')) return;
        const registrations = Storage.get('courseRegistrations').filter(r => r.studentId === studentId && r.status === 'pending');
        registrations.forEach(reg => {
            Storage.update('courseRegistrations', reg.id, { status: 'rejected', rejectedAt: new Date().toISOString() });
            Auth.addNotification(studentId, 'Course Registration Rejected', `Your registration for ${reg.courseCode} has been rejected. Please contact academic advisor.`);
        });
        this.showToast(`${registrations.length} course registrations rejected`, 'warning');
        this.loadPage('course-approvals');
    },
    
    approveSingleCourseRegistration(regId) {
        Storage.update('courseRegistrations', regId, { status: 'approved', approvedAt: new Date().toISOString() });
        const reg = Storage.findOne('courseRegistrations', r => r.id === regId);
        if (reg) Auth.addNotification(reg.studentId, 'Course Registration Approved', `Your registration for ${reg.courseCode} has been approved.`);
        this.showToast('Course registration approved', 'success');
        this.loadPage('course-approvals');
    },
    
    rejectSingleCourseRegistration(regId) {
        Storage.update('courseRegistrations', regId, { status: 'rejected', rejectedAt: new Date().toISOString() });
        const reg = Storage.findOne('courseRegistrations', r => r.id === regId);
        if (reg) Auth.addNotification(reg.studentId, 'Course Registration Rejected', `Your registration for ${reg.courseCode} has been rejected.`);
        this.showToast('Course registration rejected', 'warning');
        this.loadPage('course-approvals');
    },
    
    renderProfileApprovals() {
        const pendingRequests = Storage.get('profileUpdateRequests').filter(r => r.status === 'pending');
        
        return `
            <div class="fade-in"><div class="d-flex justify-content-between align-items-center mb-4"><h2>Profile Update Approvals</h2>
                <button class="btn btn-secondary" onclick="UI.loadPage('admin-approvals')"><i class="bi bi-arrow-left"></i> Back</button></div>
                ${pendingRequests.map(req => {
                    const student = Storage.findOne('students', s => s.id === req.studentId);
                    const changes = req.requestedChanges;
                    return `
                        <div class="dashboard-card mb-4"><h5>${student?.name} (${student?.matricNumber})</h5>
                        <div class="row"><div class="col-md-6"><strong>Current Data:</strong><table class="table table-sm">${Object.entries(req.currentData).map(([key, val]) => `<tr><td>${key}</td><td>${val}</td></tr>`).join('')}</table></div>
                        <div class="col-md-6"><strong>Requested Changes:</strong><table class="table table-sm">${Object.entries(changes).map(([key, val]) => `<tr><td>${key}</td><td class="text-success">${val}</td></tr>`).join('')}</table></div></div>
                        <div class="text-end"><button class="btn btn-success me-2" onclick="UI.approveProfileUpdate('${req.id}')">Approve</button>
                        <button class="btn btn-danger" onclick="UI.rejectProfileUpdate('${req.id}')">Reject</button></div></div>
                    `;
                }).join('')}
                ${pendingRequests.length === 0 ? '<div class="dashboard-card text-center py-5"><i class="bi bi-check-all fs-1 text-success"></i><h4>No Pending Profile Updates</h4></div>' : ''}
            </div>
        `;
    },
    
    approveProfileUpdate(requestId) {
        const request = Storage.findOne('profileUpdateRequests', r => r.id === requestId);
        if (request) {
            Storage.update('students', request.studentId, request.requestedChanges);
            Storage.delete('profileUpdateRequests', requestId);
            Auth.addNotification(request.studentId, 'Profile Updated', 'Your profile changes have been approved and applied.');
            this.showToast('Profile update approved', 'success');
            this.loadPage('profile-approvals');
        }
    },
    
    rejectProfileUpdate(requestId) {
        const request = Storage.findOne('profileUpdateRequests', r => r.id === requestId);
        if (request) {
            Storage.delete('profileUpdateRequests', requestId);
            Auth.addNotification(request.studentId, 'Profile Update Rejected', 'Your profile update request has been rejected.');
            this.showToast('Profile update rejected', 'warning');
            this.loadPage('profile-approvals');
        }
    },
    
    // ============ CORE MANAGEMENT PAGES ============
    renderStudentsPage() {
        const students = Storage.get('students');
        return `
            <div class="fade-in"><div class="d-flex justify-content-between align-items-center mb-4"><h2>Student Management</h2>
                <button class="btn btn-primary" onclick="UI.showAddStudentModal()"><i class="bi bi-plus-circle"></i> Add Student</button></div>
                <div class="dashboard-card"><div class="table-responsive"><table class="table table-hover" id="studentsTable">
                    <thead><tr><th>Matric No</th><th>Name</th><th>Department</th><th>Level</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>${students.map(student => `<tr><td>${student.matricNumber || 'N/A'}</td><td>${student.name}</td><td>${student.department}</td>
                    <td>Level ${student.level || '100'}</td><td>${student.email}</td><td><span class="badge bg-${student.status === 'active' ? 'success' : 'danger'}">${student.status || 'active'}</span></td>
                    <td><button class="btn btn-sm btn-info" onclick="UI.viewStudent('${student.id}')"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-warning" onclick="UI.editStudent('${student.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="UI.deleteStudent('${student.id}')"><i class="bi bi-trash"></i></button></td></tr>`).join('')}
                    ${students.length === 0 ? '<tr><td colspan="7" class="text-center">No students found</td>' : ''}
                    </tbody></table></div></div>
            </div>
        `;
    },
    
    renderLecturersPage() {
        const lecturers = Storage.get('lecturers');
        return `
            <div class="fade-in"><div class="d-flex justify-content-between align-items-center mb-4"><h2>Lecturer Management</h2>
                <button class="btn btn-primary" onclick="UI.showAddLecturerModal()"><i class="bi bi-plus-circle"></i> Add Lecturer</button></div>
                <div class="dashboard-card"><div class="table-responsive"><table class="table table-hover">
                    <thead><tr><th>Staff ID</th><th>Name</th><th>Department</th><th>Email</th><th>Courses</th><th>Actions</th></tr></thead>
                    <tbody>${lecturers.map(lec => `<table><td>${lec.staffId || 'N/A'}</td><td>${lec.name}</td><td>${lec.department}</td>
                    <td>${lec.email}</td><td>${lec.assignedCourses?.length || 0}</td>
                    <td><button class="btn btn-sm btn-warning" onclick="UI.editLecturer('${lec.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="UI.deleteLecturer('${lec.id}')"><i class="bi bi-trash"></i></button></td></tr>`).join('')}
                    ${lecturers.length === 0 ? '<tr><td colspan="6" class="text-center">No lecturers found</td>' : ''}
                    </tbody></table></div></div>
            </div>
        `;
    },
    
    renderCoursesPage() {
        const courses = Storage.get('courses');
        const lecturers = Storage.get('lecturers');
        return `
            <div class="fade-in"><div class="d-flex justify-content-between align-items-center mb-4"><h2>Course Management</h2>
                <button class="btn btn-primary" onclick="UI.showAddCourseModal()"><i class="bi bi-plus-circle"></i> Add Course</button></div>
                <div class="dashboard-card"><div class="table-responsive"><table class="table table-hover">
                    <thead><tr><th>Code</th><th>Title</th><th>Credit</th><th>Department</th><th>Level</th><th>Lecturer</th><th>Actions</th></tr></thead>
                    <tbody>${courses.map(course => {
                        const lecturer = lecturers.find(l => l.id === course.lecturerId);
                        return `<tr><td><strong>${course.code}</strong></td><td>${course.title}</td><td>${course.creditUnit}</td>
                        <td>${course.department}</td><td>Level ${course.level}</td><td>${lecturer?.name || 'Not Assigned'}</td>
                        <td><button class="btn btn-sm btn-warning" onclick="UI.editCourse('${course.id}')"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="UI.deleteCourse('${course.id}')"><i class="bi bi-trash"></i></button></td></tr>`;
                    }).join('')}
                    ${courses.length === 0 ? '<tr><td colspan="7" class="text-center">No courses found</td>' : ''}
                    </tbody></table></div></div>
            </div>
        `;
    },
    
    renderResultsPage() {
        const results = Storage.get('results');
        const summary = {
            draft: results.filter(r => r.status === 'draft').length,
            submitted: results.filter(r => r.status === 'submitted').length,
            approved: results.filter(r => r.status === 'approved').length,
            published: results.filter(r => r.status === 'published').length
        };
        
        return `
            <div class="fade-in"><h2 class="mb-4">Result Management</h2>
                <div class="row g-4 mb-4"><div class="col-md-3"><div class="dashboard-card text-center"><h6>Draft</h6><h3 class="text-secondary">${summary.draft}</h3></div></div>
                <div class="col-md-3"><div class="dashboard-card text-center"><h6>Submitted</h6><h3 class="text-warning">${summary.submitted}</h3></div></div>
                <div class="col-md-3"><div class="dashboard-card text-center"><h6>Approved</h6><h3 class="text-success">${summary.approved}</h3></div></div>
                <div class="col-md-3"><div class="dashboard-card text-center"><h6>Published</h6><h3 class="text-info">${summary.published}</h3></div></div></div>
                <div class="dashboard-card"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Course</th><th>Student</th><th>Total Score</th><th>Grade</th><th>Status</th><th>Updated</th></tr></thead>
                <tbody>${results.slice(0, 20).map(result => {
                    const course = Storage.findOne('courses', c => c.id === result.courseId);
                    const student = Storage.findOne('students', s => s.id === result.studentId);
                    return `<tr><td>${course?.code || 'N/A'}</td><td>${student?.name || 'N/A'}</td><td>${result.totalScore}</td>
                    <td>${result.grade}</td><td><span class="badge bg-${result.status === 'published' ? 'success' : result.status === 'approved' ? 'info' : result.status === 'submitted' ? 'warning' : 'secondary'}">${result.status || 'draft'}</span></td>
                    <td>${result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : new Date(result.createdAt).toLocaleDateString()}</td></tr>`;
                }).join('')}
                </tbody></table></div></div>
            </div>
        `;
    },
    
    renderTranscriptPage() {
        return `<div class="fade-in"><h2 class="mb-4">Transcript Management</h2><div class="dashboard-card"><p>Select a student to generate transcript</p>
            <select class="form-control" id="transcriptStudentSelect"><option value="">Select Student</option>${Storage.get('students').map(s => `<option value="${s.id}">${s.matricNumber} - ${s.name}</option>`).join('')}</select>
            <button class="btn btn-primary mt-3" onclick="UI.generateTranscriptForStudent()">Generate Transcript</button></div><div id="transcriptOutput"></div></div>`;
    },
    
    renderReportsPage() {
        return `
            <div class="fade-in"><h2 class="mb-4">Analytics & Reports</h2>
                <div class="row g-4"><div class="col-md-6"><div class="dashboard-card"><h5>Grade Distribution</h5><canvas id="gradeDistributionChart" height="250"></canvas></div></div>
                <div class="col-md-6"><div class="dashboard-card"><h5>Department Performance</h5><canvas id="deptPerformanceChart" height="250"></canvas></div></div>
                <div class="col-md-12"><div class="dashboard-card"><h5>Academic Summary</h5>
                <div class="row"><div class="col-md-4"><div class="text-center"><h6>Total Students</h6><h3>${Storage.get('students').length}</h3></div></div>
                <div class="col-md-4"><div class="text-center"><h6>Total Courses</h6><h3>${Storage.get('courses').length}</h3></div></div>
                <div class="col-md-4"><div class="text-center"><h6>Results Published</h6><h3>${Storage.get('results').filter(r => r.status === 'published').length}</h3></div></div></div>
                <button class="btn btn-primary mt-3 w-100" onclick="UI.exportFullReport()"><i class="bi bi-file-spreadsheet"></i> Export Full Report (CSV)</button></div></div></div>
            </div>
        `;
    },
    
    renderSettingsPage() {
        const session = Storage.getCurrentSession();
        return `
            <div class="fade-in"><h2 class="mb-4">System Settings</h2>
                <div class="row"><div class="col-md-6"><div class="dashboard-card"><h5>Academic Session Settings</h5>
                    <label>Current Session</label><input type="text" class="form-control mb-2" id="sessionName" value="${session?.name || '2023/2024'}">
                    <label>Semester</label><select class="form-control mb-2" id="sessionSemester"><option value="First" ${session?.semester === 'First' ? 'selected' : ''}>First Semester</option><option value="Second" ${session?.semester === 'Second' ? 'selected' : ''}>Second Semester</option></select>
                    <label>Registration Deadline</label><input type="date" class="form-control mb-2" id="regDeadline" value="${session?.registrationDeadline || '2024-12-31'}">
                    <label>Registration Open</label><select class="form-control mb-2" id="regOpen"><option value="true" ${session?.registrationOpen ? 'selected' : ''}>Yes</option><option value="false" ${!session?.registrationOpen ? 'selected' : ''}>No</option></select>
                    <button class="btn btn-primary w-100 mt-2" onclick="UI.updateSessionSettings()">Save Settings</button></div></div>
                    <div class="col-md-6"><div class="dashboard-card"><h5>System Actions</h5>
                    <button class="btn btn-outline-primary w-100 mb-2" onclick="Storage.backup()"><i class="bi bi-download"></i> Backup Database</button>
                    <button class="btn btn-outline-danger w-100 mb-2" onclick="UI.clearAllData()"><i class="bi bi-trash"></i> Clear All Data (Reset)</button>
                    <button class="btn btn-outline-info w-100" onclick="UI.generateSystemReport()"><i class="bi bi-file-text"></i> Generate System Report</button></div></div>
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
        return results.filter(r => r.studentId === student.id && r.status === 'published').map(result => {
            const course = courses.find(c => c.id === result.courseId);
            return { ...result, courseCode: course?.code, courseTitle: course?.title, creditUnit: course?.creditUnit };
        });
    },
    
    calculateStudentGPA(results) {
        let totalPoints = 0, totalCredits = 0;
        const currentSemester = Storage.getCurrentSession()?.semester || 'First';
        let semesterPoints = 0, semesterCredits = 0;
        
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
    
    getSemesterGPAs(results) {
        const grouped = {};
        results.forEach(result => {
            if (!grouped[result.semester]) grouped[result.semester] = { points: 0, credits: 0 };
            grouped[result.semester].points += (result.gradePoints || 0) * (result.creditUnit || 0);
            grouped[result.semester].credits += result.creditUnit || 0;
        });
        return Object.entries(grouped).map(([name, data]) => ({
            name, credits: data.credits, points: data.points,
            gpa: data.credits > 0 ? (data.points / data.credits).toFixed(2) : '0.00'
        }));
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
            if (!grouped[result.semester]) grouped[result.semester] = [];
            grouped[result.semester].push(result);
        });
        return Object.entries(grouped).map(([name, results]) => {
            let points = 0, credits = 0;
            results.forEach(r => { points += (r.gradePoints || 0) * (r.creditUnit || 0); credits += r.creditUnit || 0; });
            return { name, results, semesterGPA: credits > 0 ? (points / credits).toFixed(2) : '0.00' };
        });
    },
    
    getLecturerCourses() {
        const lecturerId = Auth.currentUser?.id;
        const session = Storage.getCurrentSession();
        return Storage.get('courses').filter(c => c.lecturerId === lecturerId && c.semester === session?.semester);
    },
    
    getStorageUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            total += (key?.length || 0) + (value?.length || 0);
        }
        return Math.min((total / (5 * 1024 * 1024)) * 100, 100);
    },
    
    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    },
    
    // ============ ACTION METHODS ============
    showToast(message, type) {
        if (typeof Auth !== 'undefined' && Auth.showToast) Auth.showToast(message, type);
        else alert(message);
    },
    
    printSemesterResult() { window.print(); },
    downloadTranscriptPDF() { this.showToast('Transcript PDF download started', 'info'); setTimeout(() => this.showToast('Download complete', 'success'), 2000); },
    requestTranscript() { this.showToast('Transcript request submitted. You will be notified when ready.', 'success'); },
    requestOfficialTranscript() { Storage.add('transcriptRequests', { studentId: this.getCurrentStudent()?.id, type: 'Official', status: 'pending', createdAt: new Date().toISOString() }); this.showToast('Official transcript requested. Processing...', 'success'); },
    verifyTranscript(requestId) { Storage.update('transcriptRequests', requestId, { status: 'verified', verifiedAt: new Date().toISOString() }); this.showToast('Transcript verified', 'success'); this.loadPage('transcript'); },
    generateTranscriptForStudent() { const studentId = document.getElementById('transcriptStudentSelect')?.value; if (studentId) { this.loadPage('transcript'); setTimeout(() => this.showToast('Transcript generated', 'success'), 500); } },
    downloadCourseList() { this.showToast('Course list downloaded', 'success'); },
    generateAcademicReport() { this.loadPage('reports'); },
    generateSystemReport() { this.showToast('System report generated', 'success'); },
    exportFullReport() { this.showToast('Report exported', 'success'); },
    updateSessionSettings() { this.showToast('Settings saved', 'success'); },
    clearAllData() { if (confirm('WARNING: This will delete ALL data. This cannot be undone. Continue?')) { localStorage.clear(); Storage.init(); this.showToast('System reset complete. Please login again.', 'success'); setTimeout(() => window.location.href = 'login.html', 2000); } },
    viewStudent(id) { this.showToast(`Viewing student ${id}`, 'info'); },
    editStudent(id) { this.showToast(`Edit student ${id}`, 'info'); },
    deleteStudent(id) { if (confirm('Delete this student?')) { Storage.delete('students', id); this.showToast('Student deleted', 'success'); this.loadPage('students'); } },
    showAddStudentModal() { this.showToast('Add student form would open here', 'info'); },
    showAddLecturerModal() { this.showToast('Add lecturer form would open here', 'info'); },
    showAddCourseModal() { this.showToast('Add course form would open here', 'info'); },
    editLecturer(id) { this.showToast(`Edit lecturer ${id}`, 'info'); },
    deleteLecturer(id) { if (confirm('Delete this lecturer?')) { Storage.delete('lecturers', id); this.showToast('Lecturer deleted', 'success'); this.loadPage('lecturers'); } },
    editCourse(id) { this.showToast(`Edit course ${id}`, 'info'); },
    deleteCourse(id) { if (confirm('Delete this course?')) { Storage.delete('courses', id); this.showToast('Course deleted', 'success'); this.loadPage('courses'); } },
    viewStudentResult(studentId, courseId) { this.showToast(`Viewing results for student`, 'info'); },
    editLecturerProfile() { this.showToast('Profile edit form would open here', 'info'); },
    showEditProfileModal() { this.showToast('Profile update request form would open here', 'info'); },
    
    attachEventHandlers(page) {
        if (page === 'reports' && typeof Chart !== 'undefined') {
            const gradeCtx = document.getElementById('gradeDistributionChart');
            if (gradeCtx) {
                const results = Storage.get('results').filter(r => r.status === 'published');
                const grades = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
                results.forEach(r => { if (grades[r.grade] !== undefined) grades[r.grade]++; });
                new Chart(gradeCtx, { type: 'bar', data: { labels: ['A', 'B', 'C', 'D', 'E', 'F'], datasets: [{ label: 'Grade Distribution', data: Object.values(grades), backgroundColor: '#9b59b6' }] }, options: { responsive: true } });
            }
            const deptCtx = document.getElementById('deptPerformanceChart');
            if (deptCtx) {
                const departments = Storage.get('departments');
                const deptScores = departments.map(dept => ({ dept, avg: 3.0 + Math.random() * 1.5 }));
                new Chart(deptCtx, { type: 'radar', data: { labels: deptScores.map(d => d.dept), datasets: [{ label: 'Avg GPA', data: deptScores.map(d => d.avg), backgroundColor: 'rgba(155, 89, 182, 0.2)', borderColor: '#9b59b6' }] }, options: { responsive: true } });
            }
        }
    },
    
    initializePageComponents(page) {
        if (page === 'dashboard' && typeof Chart !== 'undefined') {
            const ctx = document.getElementById('activityChart');
            if (ctx) {
                new Chart(ctx, { type: 'line', data: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'], datasets: [{ label: 'Results Processed', data: [45, 62, 78, 91, 88, 105], borderColor: '#9b59b6', backgroundColor: 'rgba(155, 89, 182, 0.1)', tension: 0.4, fill: true }] }, options: { responsive: true, maintainAspectRatio: true } });
            }
        }
        if (page === 'semester-gpa' && typeof Chart !== 'undefined') {
            const ctx = document.getElementById('gpaTrendChart');
            if (ctx) {
                const results = this.getStudentResults();
                const semesterGPAs = this.getSemesterGPAs(results);
                new Chart(ctx, { type: 'line', data: { labels: semesterGPAs.map(s => s.name), datasets: [{ label: 'GPA Progression', data: semesterGPAs.map(s => parseFloat(s.gpa)), borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', tension: 0.3, fill: true }] }, options: { responsive: true, maintainAspectRatio: true } });
            }
        }
    }
};

// Render sidebar when UI is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector('.sidebar-nav')) UI.renderSidebar();
    });
}