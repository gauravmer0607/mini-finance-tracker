class TransactionHistoryManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.transactions = this.loadTransactions();
        this.filteredTransactions = [...this.transactions];
        
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
        
        if (!data) {
            console.log('No transactions found for user:', this.currentUser);
            return [];
        }
        
        const transactions = JSON.parse(data);
        console.log(`Loaded ${transactions.length} transactions from localStorage`);
        
        return transactions;
    }
    
    init() {
        this.displaySummary();
        this.displayTransactions(this.transactions);
        this.setupDateDefaults();
    }
    
    displaySummary() {
        let totalIncome = 0;
        let totalExpense = 0;
        let incomeCount = 0;
        let expenseCount = 0;
        
        this.transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
                incomeCount++;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                totalExpense += t.amount;
                expenseCount++;
            }
        });
        
        const netBalance = totalIncome - totalExpense;
        
        document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `₹${totalExpense.toFixed(2)}`;
        document.getElementById('netBalance').textContent = `₹${netBalance.toFixed(2)}`;
        document.getElementById('incomeCount').textContent = `${incomeCount} transactions`;
        document.getElementById('expenseCount').textContent = `${expenseCount} transactions`;
        document.getElementById('totalCount').textContent = `${this.transactions.length} total transactions`;
    }
    
    displayTransactions(transactions) {
        const listContainer = document.getElementById('transactionList');
        
        if (transactions.length === 0) {
            listContainer.innerHTML = '<div class="no-data">No transactions found</div>';
            return;
        }
        
        const grouped = this.groupByMonth(transactions);
        
        let html = '';
        
        const sortedMonths = Object.keys(grouped).sort((a, b) => {
            return new Date(b) - new Date(a);
        });
        
        sortedMonths.forEach(monthKey => {
            const monthTransactions = grouped[monthKey];
            const monthDate = new Date(monthKey);
            const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            let monthIncome = 0;
            let monthExpense = 0;
            
            monthTransactions.forEach(t => {
                if (t.type === 'deposit' || t.type === 'received') {
                    monthIncome += t.amount;
                } else {
                    monthExpense += t.amount;
                }
            });
            
            html += `
                <div class="month-group">
                    <div class="month-header">
                        <div>
                            <strong>${monthName}</strong>
                            <span style="margin-left: 1rem; opacity: 0.9; font-size: 0.9rem;">
                                ${monthTransactions.length} transactions
                            </span>
                        </div>
                        <div class="month-stats">
                            <span>Income: <strong>₹${monthIncome.toFixed(2)}</strong></span>
                            <span>Expense: <strong>₹${monthExpense.toFixed(2)}</strong></span>
                        </div>
                    </div>
            `;
            
            monthTransactions.forEach(t => {
                const isIncome = (t.type === 'deposit' || t.type === 'received');
                const amountClass = isIncome ? 'income' : 'expense';
                const amountSign = isIncome ? '+' : '-';
                
                html += `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-date">${this.formatDate(t.date)} • ${t.timestamp}</div>
                            <div class="transaction-details">${t.details}</div>
                            <div>
                                <span class="transaction-type">${t.type}</span>
                                <span class="transaction-category">${t.category || 'Uncategorized'}</span>
                            </div>
                        </div>
                        <div class="transaction-amount ${amountClass}">
                            ${amountSign}₹${t.amount.toFixed(2)}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        });
        
        listContainer.innerHTML = html;
    }
    
    groupByMonth(transactions) {
        const grouped = {};
        
        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            
            grouped[monthKey].push(t);
        });
        
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => new Date(b.date) - new Date(a.date));
        });
        
        return grouped;
    }
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }
    
    setupDateDefaults() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('filterFromDate').value = firstDayOfMonth.toISOString().split('T')[0];
        document.getElementById('filterToDate').value = today.toISOString().split('T')[0];
    }
    
    applyFilters() {
        const filterType = document.getElementById('filterType').value;
        const filterFromDate = document.getElementById('filterFromDate').value;
        const filterToDate = document.getElementById('filterToDate').value;
        
        let filtered = [...this.transactions];
        
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }
        
        if (filterFromDate) {
            filtered = filtered.filter(t => t.date >= filterFromDate);
        }
        
        if (filterToDate) {
            filtered = filtered.filter(t => t.date <= filterToDate);
        }
        
        console.log(`Filtered: ${filtered.length} transactions`);
        
        this.filteredTransactions = filtered;
        this.displayTransactions(filtered);
        this.displayFilteredSummary(filtered);
    }
    
    displayFilteredSummary(transactions) {
        let totalIncome = 0;
        let totalExpense = 0;
        let incomeCount = 0;
        let expenseCount = 0;
        
        transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
                incomeCount++;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                totalExpense += t.amount;
                expenseCount++;
            }
        });
        
        const netBalance = totalIncome - totalExpense;
        
        document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `₹${totalExpense.toFixed(2)}`;
        document.getElementById('netBalance').textContent = `₹${netBalance.toFixed(2)}`;
        document.getElementById('incomeCount').textContent = `${incomeCount} transactions`;
        document.getElementById('expenseCount').textContent = `${expenseCount} transactions`;
        document.getElementById('totalCount').textContent = `${transactions.length} total transactions`;
    }

    resetFilters() {
        document.getElementById('filterType').value = 'all';
        this.setupDateDefaults();
        this.filteredTransactions = [...this.transactions];
        this.displayTransactions(this.transactions);
        this.displaySummary();
    }

    exportForCPP() {
        const filename = `transactions_${this.currentUser}.txt`;
        let fileContent = '';
        
        this.transactions.forEach(t => {
            fileContent += `${t.id}|${t.type}|${t.date}|${t.amount.toFixed(2)}|${t.category || 'Uncategorized'}|${t.details}|${t.timestamp}\n`;
        });
        
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('✅ File exported successfully!\nCopy it to C++ project folder and run the analyzer.');
    }

    exportToCSV() {
        const headers = ['Date', 'Type', 'Category', 'Details', 'Amount', 'Timestamp'];
        let csv = headers.join(',') + '\n';

        this.transactions.forEach(t => {
            const row = [
                t.date,
                t.type,
                t.category || 'Uncategorized',
                `"${t.details}"`,
                t.amount.toFixed(2),
                t.timestamp
            ];
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khazana_transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ CSV exported successfully!');
    }

    importFromCPP(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split('\n').filter(line => line.trim());
            
            const newTransactions = [];
            
            lines.forEach(line => {
                const parts = line.split('|');
                if (parts.length >= 7) {
                    newTransactions.push({
                        id: parts[0],
                        type: parts[1],
                        date: parts[2],
                        amount: parseFloat(parts[3]),
                        category: parts[4],
                        details: parts[5],
                        timestamp: parts[6]
                    });
                }
            });
            
            const key = `transactions_${this.currentUser}`;
            localStorage.setItem(key, JSON.stringify(newTransactions));
            
            alert('✅ Data imported from C++ successfully!');
            location.reload();
        };
        
        reader.readAsText(file);
    }
}

let historyManager;

window.addEventListener('load', () => {
    historyManager = new TransactionHistoryManager();
});

function applyFilters() {
    historyManager.applyFilters();
}

function resetFilters() {
    historyManager.resetFilters();
}

function exportForCPP() {
    historyManager.exportForCPP();
}

function exportToCSV() {
    historyManager.exportToCSV();
}

function handleCPPImport(event) {
    const file = event.target.files[0];
    if (file) {
        historyManager.importFromCPP(file);
    }
}