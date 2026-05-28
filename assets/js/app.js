// assets/js/app.js - Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    initApp();
    
    // Set up navigation
    setupNavigation();
    
    // Set up theme toggles
    setupTheme();
    
    // Load initial page
    if (window.location.pathname.includes('dashboard.html')) {
        UI.loadPage('dashboard');
    }
});

function initApp() {
    // Check authentication for protected pages
    const protectedPages = ['dashboard.html', 'transcript.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !Auth.currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user info if logged in
    if (Auth.currentUser) {
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) {
            userNameSpan.textContent = Auth.currentUser.name;
        }
    }
    
    // Initialize counters on landing page
    if (currentPage === 'index.html' || currentPage === '') {
        initCounters();
    }
    
    // Initialize sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                UI.loadPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const lightIcon = document.getElementById('lightModeIcon');
    const darkIcon = document.getElementById('darkModeIcon');
    
    if (lightIcon && darkIcon) {
        if (savedTheme === 'dark') {
            lightIcon.classList.add('d-none');
            darkIcon.classList.remove('d-none');
        } else {
            lightIcon.classList.remove('d-none');
            darkIcon.classList.add('d-none');
        }
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                if (newTheme === 'dark') {
                    lightIcon.classList.add('d-none');
                    darkIcon.classList.remove('d-none');
                } else {
                    lightIcon.classList.remove('d-none');
                    darkIcon.classList.add('d-none');
                }
            });
        }
    }
}

function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50;
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target;
            }
        };
        updateCounter();
    });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Toast notification system
function showToast(message, type = 'info') {
    Auth.showToast(message, type);
}

// Export functionality
function exportToCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Make functions global
window.showToast = showToast;
window.exportToCSV = exportToCSV;
window.scrollToFeatures = scrollToFeatures;