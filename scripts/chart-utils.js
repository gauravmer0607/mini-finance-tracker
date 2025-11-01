// Chart.js Utility Functions for Khazana
// Reusable chart creation functions

class ChartUtils {
    /**
     * Create a line chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} labels - X-axis labels
     * @param {Array} datasets - Data arrays
     * @returns {Chart} Chart instance
     */
    static createLineChart(canvasId, labels, datasets) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: dataset.color || '#4caf50',
                    backgroundColor: dataset.bgColor || 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 12,
                                family: "'Segoe UI', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ₹' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create a bar chart
     */
    static createBarChart(canvasId, labels, datasets) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: dataset.color || '#4caf50'
                }))
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create a pie chart
     */
    static createPieChart(canvasId, labels, data, colors = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors || defaultColors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create a doughnut chart
     */
    static createDoughnutChart(canvasId, labels, data, colors = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultColors = ['#4caf50', '#f44336', '#2196f3', '#ff9800'];

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors || defaultColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ₹${context.parsed.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Destroy a chart instance
     */
    static destroyChart(chartInstance) {
        if (chartInstance) {
            chartInstance.destroy();
        }
    }

    /**
     * Format currency for display
     */
    static formatCurrency(amount) {
        return '₹' + parseFloat(amount).toFixed(2).toLocaleString('en-IN');
    }

    /**
     * Generate random colors for charts
     */
    static generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360 / count);
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    }
}

// Make it globally available
window.ChartUtils = ChartUtils;