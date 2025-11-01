class BudgetPlanner {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.budgets = this.loadBudgets();
        this.transactions = this.loadTransactions();
        
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

    loadBudgets() {
        const key = `budgets_${this.currentUser}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    saveBudgets() {
        const key = `budgets_${this.currentUser}`;
        localStorage.setItem(key, JSON.stringify(this.budgets));
    }

    loadTransactions() {
        const key = `transactions_${this.currentUser}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    init() {
        this.displayOverview();
        this.displayBudgets();
    }

    calculateMonthlySpending(category) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let total = 0;
        this.transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate.getMonth() === currentMonth && 
                tDate.getFullYear() === currentYear &&
                (t.type === 'withdrawal' || t.type === 'transfer')) {
                
                if (category) {
                    if (t.category === category) {
                        total += t.amount;
                    }
                } else {
                    total += t.amount;
                }
            }
        });

        return total;
    }

    setBudget() {
        const category = document.getElementById('budgetCategory').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);

        if (!category) {
            alert('Please select a category!');
            return;
        }

        if (!amount || amount <= 0) {
            alert('Please enter a valid budget amount!');
            return;
        }

        // Check if budget already exists for this category
        const existingIndex = this.budgets.findIndex(b => b.category === category);

        if (existingIndex >= 0) {
            // Update existing budget
            this.budgets[existingIndex].amount = amount;
            this.budgets[existingIndex].updatedAt = new Date().toISOString();
        } else {
            // Add new budget
            this.budgets.push({
                id: Date.now(),
                category: category,
                amount: amount,
                createdAt: new Date().toISOString()
            });
        }

        this.saveBudgets();

        // Clear form
        document.getElementById('budgetCategory').value = '';
        document.getElementById('budgetAmount').value = '';

        alert('✅ Budget set successfully!');

        // Refresh display
        this.displayOverview();
        this.displayBudgets();
    }

    displayOverview() {
        const totalBudget = this.budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = this.calculateMonthlySpending();
        const totalRemaining = totalBudget - totalSpent;

        document.getElementById('totalBudget').textContent = `₹${totalBudget.toFixed(0)}`;
        document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(0)}`;
        document.getElementById('totalRemaining').textContent = `₹${totalRemaining.toFixed(0)}`;
    }

    displayBudgets() {
        const container = document.getElementById('budgetsContainer');

        if (this.budgets.length === 0) {
            container.innerHTML = `
                <div class="no-budgets">
                    <span class="icon">🎯</span>
                    <p>No budgets set yet. Start by setting a budget above!</p>
                </div>
            `;
            return;
        }

        let html = '';

        this.budgets.forEach(budget => {
            const spent = this.calculateMonthlySpending(budget.category);
            const remaining = budget.amount - spent;
            const percentage = Math.min((spent / budget.amount) * 100, 100);

            let progressClass = '';
            if (percentage >= 90) {
                progressClass = 'danger';
            } else if (percentage >= 70) {
                progressClass = 'warning';
            }

            let statusText = '';
            if (percentage >= 100) {
                statusText = '⚠️ Budget exceeded!';
            } else if (percentage >= 90) {
                statusText = '⚠️ Almost at limit!';
            } else {
                statusText = '✅ On track';
            }

            html += `
                <div class="budget-item">
                    <div class="budget-header">
                        <span class="budget-category">${this.getCategoryIcon(budget.category)} ${budget.category}</span>
                        <div class="budget-amounts">
                            <div class="budget-amount-item">
                                <span class="label">Budget</span>
                                <span class="value">₹${budget.amount.toFixed(0)}</span>
                            </div>
                            <div class="budget-amount-item">
                                <span class="label">Spent</span>
                                <span class="value">₹${spent.toFixed(0)}</span>
                            </div>
                            <div class="budget-amount-item">
                                <span class="label">Remaining</span>
                                <span class="value">₹${remaining.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${progressClass}" style="width: ${percentage}%"></div>
                        </div>
                        <div class="budget-status">
                            <span>${statusText}</span>
                            <span>${percentage.toFixed(1)}% used</span>
                        </div>
                    </div>
                    <div class="budget-actions">
                        <button class="edit-btn" onclick="editBudget(${budget.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteBudget(${budget.id})">Delete</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    getCategoryIcon(category) {
        const icons = {
            'Food': '🍕',
            'Transport': '🚌',
            'Shopping': '🛍️',
            'Entertainment': '🎬',
            'Education': '📚',
            'Health': '🏥',
            'Bills': '📄',
            'Rent': '🏠',
            'Other': '📌'
        };
        return icons[category] || '📌';
    }

    editBudget(id) {
        const budget = this.budgets.find(b => b.id === id);
        if (!budget) return;

        const newAmount = prompt(`Edit budget for ${budget.category}:`, budget.amount);
        if (newAmount && parseFloat(newAmount) > 0) {
            budget.amount = parseFloat(newAmount);
            budget.updatedAt = new Date().toISOString();
            this.saveBudgets();
            this.displayOverview();
            this.displayBudgets();
        }
    }

    deleteBudget(id) {
        if (confirm('Are you sure you want to delete this budget?')) {
            this.budgets = this.budgets.filter(b => b.id !== id);
            this.saveBudgets();
            this.displayOverview();
            this.displayBudgets();
        }
    }
}

let budgetPlanner;

window.addEventListener('load', () => {
    budgetPlanner = new BudgetPlanner();
});

function setBudget() {
    budgetPlanner.setBudget();
}

function editBudget(id) {
    budgetPlanner.editBudget(id);
}

function deleteBudget(id) {
    budgetPlanner.deleteBudget(id);
}