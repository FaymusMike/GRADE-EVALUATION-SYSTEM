// assets/js/app.js - COMPLETE FIXED VERSION

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');
    
    // Wait a bit for Auth to be ready
    setTimeout(() => {
        // Check if user is authenticated
        if (typeof Auth !== 'undefined' && Auth.currentUser) {
            console.log('User authenticated:', Auth.currentUser.name, 'Role:', Auth.currentUser.role);
            
            // Update UI with user info
            updateUserInterface();
            
            // Initialize UI and load dashboard
            if (typeof UI !== 'undefined') {
                UI.renderSidebar();
                UI.loadPage('dashboard');
            } else {
                console.error('UI not defined');
            }
        } else if (typeof Auth !== 'undefined') {
            // Try to restore session
            Auth.checkSession();
            
            // If still no user after a short delay, redirect to login
            setTimeout(() => {
                if (!Auth.currentUser && !window.location.pathname.includes('login.html')) {
                    console.log('No authenticated user, redirecting to login');
                    window.location.href = 'login.html';
                } else if (Auth.currentUser) {
                    updateUserInterface();
                    if (typeof UI !== 'undefined') {
                        UI.renderSidebar();
                        UI.loadPage('dashboard');
                    }
                }
            }, 500);
        }
    }, 200);
    
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
    
    // Initialize theme
    initTheme();
});

function updateUserInterface() {
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan && Auth.currentUser) {
        userNameSpan.textContent = Auth.currentUser.name || Auth.currentUser.email;
    }
}

function initTheme() {
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

// Helper functions
function showToast(message, type = 'info') {
    if (typeof Auth !== 'undefined' && Auth.showToast) {
        Auth.showToast(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Export completed successfully!', 'success');
}

// Make functions global
window.showToast = showToast;
window.exportToCSV = exportToCSV;