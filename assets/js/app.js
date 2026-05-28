// assets/js/app.js - COMPLETE FIXED FILE
document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    initApp();
    
    // Set up navigation
    setupNavigation();
    
    // Set up theme toggles
    setupTheme();
    
    // Load initial page
    if (window.location.pathname.includes('dashboard.html')) {
        // Small delay to ensure auth is ready
        setTimeout(() => {
            if (Auth.currentUser) {
                UI.loadPage('dashboard');
            }
        }, 100);
    }
});

function initApp() {
    // Check authentication for protected pages
    const protectedPages = ['dashboard.html', 'transcript.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !Auth.currentUser) {
        // Small delay to allow session check to complete
        setTimeout(() => {
            if (!Auth.currentUser) {
                window.location.href = 'login.html';
            }
        }, 200);
        return;
    }
    
    // Initialize counters on landing page
    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        initCounters();
    }
    
    // Initialize sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
            }
        });
    }
    
    // Mobile sidebar toggle
    const sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
    if (sidebarToggleMobile) {
        sidebarToggleMobile.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
        });
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page && typeof UI !== 'undefined' && UI.loadPage) {
                UI.loadPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile sidebar if open
                const sidebar = document.getElementById('sidebar');
                if (sidebar && window.innerWidth < 768) {
                    sidebar.classList.remove('show');
                }
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
        if (isNaN(target)) return;
        
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
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function showToast(message, type = 'info') {
    if (typeof Auth !== 'undefined' && Auth.showToast) {
        Auth.showToast(message, type);
    } else {
        alert(message);
    }
}

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Export completed successfully!', 'success');
}

// Make functions global
window.showToast = showToast;
window.exportToCSV = exportToCSV;
window.scrollToFeatures = scrollToFeatures;