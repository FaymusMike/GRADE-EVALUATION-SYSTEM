// assets/js/charts.js - Chart Management
const ChartManager = {
    initPerformanceChart(elementId, data) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || ['A', 'B', 'C', 'D', 'E', 'F'],
                datasets: [{
                    label: 'Grade Distribution',
                    data: data.grades || [12, 19, 15, 8, 5, 2],
                    backgroundColor: 'rgba(13, 110, 253, 0.5)',
                    borderColor: '#0d6efd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },
    
    initGPATrendChart(elementId, data) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.semesters || ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [{
                    label: 'GPA Trend',
                    data: data.gpas || [3.2, 3.5, 3.7, 3.8],
                    borderColor: '#20c997',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(32, 201, 151, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: { callbacks: { label: (ctx) => `GPA: ${ctx.raw}` } }
                }
            }
        });
    },
    
    initDepartmentComparison(elementId, data) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.departments || ['CS', 'ENG', 'BUS', 'MED'],
                datasets: [{
                    label: 'Performance Score',
                    data: data.scores || [85, 78, 82, 90],
                    backgroundColor: 'rgba(102, 16, 242, 0.2)',
                    borderColor: '#6610f2'
                }]
            },
            options: { responsive: true }
        });
    }
};

window.ChartManager = ChartManager;