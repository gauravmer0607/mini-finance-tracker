class InsightsAnalyzer {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.transactions = this.loadTransactions();
        this.charts = {};
        
        this.init();
    }

    getCurrentUser() {
        let user = localStorage.getItem('currentUser');
        if (!user) {
            alert('Please login first!');
            window.location.href = 'login.html';
            return null;
        }
        return user;
    }

    loadTransactions() {
        const key = `transactions_${this.currentUser}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    init() {
        this.calculateMetrics();
        this.renderCharts();
        this.generateInsights();
        this.analyzePatterns();
        this.predictNextMonth();
    }

    calculateMetrics() {
        let totalIncome = 0;
        let totalExpense = 0;
        let highestExpense = 0;

        this.transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                totalExpense += t.amount;
                if (t.amount > highestExpense) {
                    highestExpense = t.amount;
                }
            }
        });

        // Calculate date range
        const dates = this.transactions.map(t => new Date(t.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;

        const avgDaily = totalExpense / daysDiff;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

        // Update UI
        document.getElementById('avgDaily').textContent = `₹${avgDaily.toFixed(0)}`;
        document.getElementById('highestExpense').textContent = `₹${highestExpense.toFixed(0)}`;
        document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;
        document.getElementById('totalTrans').textContent = this.transactions.length;
    }

    renderCharts() {
        this.renderTrendChart();
        this.renderIncomeExpenseChart();
    }

    renderTrendChart() {
        const monthlyData = this.getMonthlyData();
        const ctx = document.getElementById('trendChart');

        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthlyData.income,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Expense',
                        data: monthlyData.expense,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderIncomeExpenseChart() {
        let totalIncome = 0;
        let totalExpense = 0;

        this.transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                totalExpense += t.amount;
            }
        });

        const ctx = document.getElementById('incomeExpenseChart');

        if (this.charts.incomeExpense) {
            this.charts.incomeExpense.destroy();
        }

        this.charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total'],
                datasets: [
                    {
                        label: 'Income',
                        data: [totalIncome],
                        backgroundColor: '#4caf50'
                    },
                    {
                        label: 'Expense',
                        data: [totalExpense],
                        backgroundColor: '#f44336'
                    },
                    {
                        label: 'Savings',
                        data: [totalIncome - totalExpense],
                        backgroundColor: '#2196f3'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    getMonthlyData() {
        const monthlyData = {};

        this.transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
            }

            if (t.type === 'deposit' || t.type === 'received') {
                monthlyData[monthKey].income += t.amount;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                monthlyData[monthKey].expense += t.amount;
            }
        });

        const sortedMonths = Object.keys(monthlyData).sort();

        return {
            labels: sortedMonths.map(m => {
                const [year, month] = m.split('-');
                return new Date(year, month - 1).toLocaleDateString('en', { month: 'short', year: 'numeric' });
            }),
            income: sortedMonths.map(m => monthlyData[m].income),
            expense: sortedMonths.map(m => monthlyData[m].expense)
        };
    }

    generateInsights() {
        const insights = [];

        // Calculate stats
        let totalIncome = 0;
        let totalExpense = 0;
        const categorySpending = {};

        this.transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                totalExpense += t.amount;
                const category = t.category || 'Uncategorized';
                categorySpending[category] = (categorySpending[category] || 0) + t.amount;
            }
        });

        // Insight 1: Savings rate
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
        if (savingsRate > 30) {
            insights.push({
                icon: '🎉',
                title: 'Excellent Savings!',
                description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the great work!`
            });
        } else if (savingsRate > 10) {
            insights.push({
                icon: '👍',
                title: 'Good Savings Habit',
                description: `You're saving ${savingsRate.toFixed(1)}% of your income. Try to increase it to 30% for better financial health.`
            });
        } else {
            insights.push({
                icon: '⚠️',
                title: 'Low Savings',
                description: `You're only saving ${savingsRate.toFixed(1)}% of your income. Consider reducing expenses to save more.`
            });
        }

        // Insight 2: Top spending category
        const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            const percentage = ((topCategory[1] / totalExpense) * 100).toFixed(1);
            insights.push({
                icon: '📊',
                title: 'Top Spending Category',
                description: `${topCategory[0]} accounts for ${percentage}% of your expenses (₹${topCategory[1].toFixed(0)}). Consider if this aligns with your priorities.`
            });
        }

        // Insight 3: Transaction frequency
        const avgTransPerDay = this.transactions.length / 30; // Approximate
        if (avgTransPerDay > 3) {
            insights.push({
                icon: '💳',
                title: 'High Transaction Frequency',
                description: `You're making ${avgTransPerDay.toFixed(1)} transactions per day on average. Consider consolidating purchases to reduce impulse spending.`
            });
        }

        // Render insights
        const container = document.getElementById('insightsList');
        let html = '';

        insights.forEach(insight => {
            html += `
                <div class="insight-item">
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-content">
                        <div class="insight-title">${insight.title}</div>
                        <div class="insight-description">${insight.description}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p style="color: #999;">Not enough data to generate insights yet.</p>';
    }

    analyzePatterns() {
        const patterns = [];

        // Pattern 1: Weekend spending
        let weekendSpending = 0;
        let weekdaySpending = 0;

        this.transactions.forEach(t => {
            if (t.type === 'withdrawal' || t.type === 'transfer') {
                const date = new Date(t.date);
                const day = date.getDay();
                if (day === 0 || day === 6) {
                    weekendSpending += t.amount;
                } else {
                    weekdaySpending += t.amount;
                }
            }
        });

        if (weekendSpending > weekdaySpending) {
            patterns.push({
                title: '🎉 Weekend Spender',
                details: `You spend ${((weekendSpending / (weekendSpending + weekdaySpending)) * 100).toFixed(1)}% of your money on weekends. Consider planning weekend activities within budget.`
            });
        }

        // Pattern 2: Recent spending trend
        const recentTransactions = this.transactions.slice(0, 10);
        const recentExpense = recentTransactions.filter(t => t.type === 'withdrawal' || t.type === 'transfer')
            .reduce((sum, t) => sum + t.amount, 0);
        const avgRecent = recentExpense / Math.min(10, this.transactions.length);

        const olderTransactions = this.transactions.slice(10, 20);
        const olderExpense = olderTransactions.filter(t => t.type === 'withdrawal' || t.type === 'transfer')
            .reduce((sum, t) => sum + t.amount, 0);
        const avgOlder = olderExpense / Math.min(10, olderTransactions.length);

        if (avgRecent > avgOlder * 1.2) {
            patterns.push({
                title: '📈 Spending Increasing',
                details: `Your recent spending is 20% higher than before. Review your expenses to avoid overspending.`
            });
        } else if (avgRecent < avgOlder * 0.8) {
            patterns.push({
                title: '📉 Spending Decreasing',
                details: `Great! Your spending has decreased by 20% recently. Keep maintaining this discipline.`
            });
        }

        // Render patterns
        const container = document.getElementById('patternsGrid');
        let html = '';

        patterns.forEach(pattern => {
            html += `
                <div class="pattern-card">
                    <div class="pattern-title">${pattern.title}</div>
                    <div class="pattern-details">${pattern.details}</div>
                </div>
            `;
        });

        container.innerHTML = html || '<p style="color: #999;">Not enough data to identify patterns yet.</p>';
    }

    predictNextMonth() {
        // Simple linear regression-like prediction
        const monthlyData = this.getMonthlyData();
        const expenses = monthlyData.expense;

        if (expenses.length < 2) {
            document.getElementById('predictedExpense').textContent = 'N/A';
            document.getElementById('recommendedBudget').textContent = 'N/A';
            document.getElementById('savingsGoal').textContent = 'N/A';
            return;
        }

        // Average of last 3 months
        const recentExpenses = expenses.slice(-3);
        const avgExpense = recentExpenses.reduce((a, b) => a + b, 0) / recentExpenses.length;

        // Add 10% buffer
        const predictedExpense = avgExpense;
        const recommendedBudget = avgExpense * 1.1;
        const savingsGoal = avgExpense * 0.2;

        document.getElementById('predictedExpense').textContent = `₹${predictedExpense.toFixed(0)}`;
        document.getElementById('recommendedBudget').textContent = `₹${recommendedBudget.toFixed(0)}`;
        document.getElementById('savingsGoal').textContent = `₹${savingsGoal.toFixed(0)}`;
    }

    exportPythonData() {
        // Export data in CSV format for Python ML analysis
        let csv = 'date,type,category,amount,day_of_week,month\n';

        this.transactions.forEach(t => {
            const date = new Date(t.date);
            const dayOfWeek = date.getDay();
            const month = date.getMonth() + 1;

            csv += `${t.date},${t.type},${t.category || 'Uncategorized'},${t.amount},${dayOfWeek},${month}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khazana_ml_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ Data exported for Python ML analysis!\n\nUse the provided Python script to analyze this data.');
    }
}

let insightsAnalyzer;

window.addEventListener('load', () => {
    insightsAnalyzer = new InsightsAnalyzer();
});

function exportPythonData() {
    insightsAnalyzer.exportPythonData();
}