class CategoryManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.transactions = this.loadTransactions();
        this.customCategories = this.loadCustomCategories();
        this.chart = null;
        
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

    loadCustomCategories() {
        const key = `customCategories_${this.currentUser}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    saveCustomCategories() {
        const key = `customCategories_${this.currentUser}`;
        localStorage.setItem(key, JSON.stringify(this.customCategories));
    }

    init() {
        this.displayCategories();
        this.displayBreakdown();
        this.renderChart();
    }

    analyzeCategorySpending() {
        const categoryData = {};

        this.transactions.forEach(t => {
            if (t.type === 'withdrawal' || t.type === 'transfer') {
                const category = t.category || 'Uncategorized';
                if (!categoryData[category]) {
                    categoryData[category] = {
                        total: 0,
                        count: 0,
                        transactions: []
                    };
                }
                categoryData[category].total += t.amount;
                categoryData[category].count++;
                categoryData[category].transactions.push(t);
            }
        });

        return categoryData;
    }

    displayCategories() {
        const categoryData = this.analyzeCategorySpending();
        const categoriesList = document.getElementById('categoriesList');
        
        const totalExpense = Object.values(categoryData).reduce((sum, cat) => sum + cat.total, 0);
        
        if (totalExpense === 0) {
            categoriesList.innerHTML = '<p style="color: #999; text-align: center;">No expense categories yet. Start adding transactions!</p>';
            return;
        }

        // Sort by total spending
        const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total);

        let html = '';
        sortedCategories.forEach(([category, data]) => {
            const percentage = ((data.total / totalExpense) * 100).toFixed(1);
            const icon = this.getCategoryIcon(category);
            
            html += `
                <div class="category-item">
                    <div class="category-name">
                        <span class="category-icon">${icon}</span>
                        <span>${category}</span>
                    </div>
                    <div>
                        <span class="category-amount">₹${data.total.toFixed(2)}</span>
                        <span class="category-percentage">(${percentage}%)</span>
                    </div>
                </div>
            `;
        });

        categoriesList.innerHTML = html;
    }

    getCategoryIcon(category) {
        const icons = {
            'Food': '🍕',
            'Transport': '🚌',
            'Shopping': '🛍️',
            'Bills': '📄',
            'Education': '📚',
            'Health': '🏥',
            'Entertainment': '🎬',
            'Rent': '🏠',
            'Salary': '💰',
            'Freelance': '💼',
            'Business': '📊',
            'Investment': '📈',
            'Gift': '🎁',
            'Other': '📌'
        };
        
        // Check custom categories
        const customCat = this.customCategories.find(c => c.name === category);
        if (customCat) {
            return customCat.icon;
        }
        
        return icons[category] || '📌';
    }

    displayBreakdown() {
        const categoryData = this.analyzeCategorySpending();
        const breakdownList = document.getElementById('breakdownList');
        
        const totalExpense = Object.values(categoryData).reduce((sum, cat) => sum + cat.total, 0);
        
        if (totalExpense === 0) {
            breakdownList.innerHTML = '<p style="color: #999; text-align: center;">No expense data available.</p>';
            return;
        }

        const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total);

        let html = '';
        sortedCategories.forEach(([category, data]) => {
            const percentage = ((data.total / totalExpense) * 100).toFixed(1);
            const icon = this.getCategoryIcon(category);
            
            html += `
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-category">${icon} ${category}</span>
                        <span class="breakdown-total">₹${data.total.toFixed(2)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="transaction-count">
                        ${data.count} transaction${data.count !== 1 ? 's' : ''} • ${percentage}% of total expenses
                    </div>
                </div>
            `;
        });

        breakdownList.innerHTML = html;
    }

    renderChart() {
        const categoryData = this.analyzeCategorySpending();
        const ctx = document.getElementById('categoryChart');
        
        if (!ctx) return;

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData).map(cat => cat.total);
        const backgroundColors = this.generateColors(labels.length);

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
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

    generateColors(count) {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40',
            '#36A2EB', '#FFCE56', '#9966FF', '#FF6384', '#4BC0C0'
        ];
        return colors.slice(0, count);
    }

    addCustomCategory() {
        const name = document.getElementById('newCategoryName').value.trim();
        const type = document.getElementById('categoryType').value;
        const icon = document.getElementById('categoryIcon').value.trim() || '📌';

        if (!name) {
            alert('Please enter a category name!');
            return;
        }

        // Check if category already exists
        if (this.customCategories.find(c => c.name === name)) {
            alert('Category already exists!');
            return;
        }

        this.customCategories.push({
            name: name,
            type: type,
            icon: icon,
            createdAt: new Date().toISOString()
        });

        this.saveCustomCategories();

        // Clear form
        document.getElementById('newCategoryName').value = '';
        document.getElementById('categoryIcon').value = '';

        alert(`✅ Category "${name}" added successfully!`);
        
        // Refresh display
        this.displayCategories();
        this.displayBreakdown();
        this.renderChart();
    }
}

let categoryManager;

window.addEventListener('load', () => {
    categoryManager = new CategoryManager();
});

function addCustomCategory() {
    categoryManager.addCustomCategory();
}