class ExportManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
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

    loadTransactions() {
        const key = `transactions_${this.currentUser}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    init() {
        this.displayStats();
    }

    displayStats() {
        let totalIncome = 0;
        let totalExpense = 0;

        this.transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                totalExpense += t.amount;
            }
        });

        // Date range
        if (this.transactions.length > 0) {
            const dates = this.transactions.map(t => new Date(t.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            
            const dateRange = `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
            document.getElementById('dateRange').textContent = dateRange;
        }

        document.getElementById('totalTransactions').textContent = this.transactions.length;
        document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `₹${totalExpense.toFixed(2)}`;
    }

    exportCSV() {
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

        this.downloadFile(csv, 'khazana_transactions.csv', 'text/csv');
        alert('✅ CSV file downloaded successfully!');
    }

    exportJSON() {
        const userData = JSON.parse(localStorage.getItem('khazanaUser'));
        
        const backup = {
            user: userData,
            exportDate: new Date().toISOString(),
            transactions: this.transactions,
            budgets: JSON.parse(localStorage.getItem(`budgets_${this.currentUser}`) || '[]'),
            customCategories: JSON.parse(localStorage.getItem(`customCategories_${this.currentUser}`) || '[]'),
            balance: localStorage.getItem(`balance_${this.currentUser}`)
        };

        const json = JSON.stringify(backup, null, 2);
        this.downloadFile(json, `khazana_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        alert('✅ Backup created successfully!');
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(46, 125, 50);
        doc.text('Khazana Financial Report', 20, 20);

        // User info
        const userData = JSON.parse(localStorage.getItem('khazanaUser'));
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`User: ${userData.name}`, 20, 35);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 42);

        // Summary
        let totalIncome = 0;
        let totalExpense = 0;
        this.transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        doc.setFontSize(14);
        doc.text('Summary', 20, 55);
        doc.setFontSize(11);
        doc.text(`Total Transactions: ${this.transactions.length}`, 20, 65);
        doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 20, 72);
        doc.text(`Total Expense: ₹${totalExpense.toFixed(2)}`, 20, 79);
        doc.text(`Net Balance: ₹${(totalIncome - totalExpense).toFixed(2)}`, 20, 86);

        // Recent transactions
        doc.setFontSize(14);
        doc.text('Recent Transactions', 20, 100);
        
        doc.setFontSize(9);
        let y = 110;
        this.transactions.slice(0, 20).forEach((t, i) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            const sign = (t.type === 'deposit' || t.type === 'received') ? '+' : '-';
            doc.text(`${t.date} | ${t.type} | ${sign}₹${t.amount.toFixed(2)} | ${t.details}`, 20, y);
            y += 7;
        });

        doc.save(`khazana_report_${new Date().toISOString().split('T')[0]}.pdf`);
        alert('✅ PDF report generated successfully!');
    }

    exportForCPP() {
        let content = '';
        
        this.transactions.forEach(t => {
            content += `${t.id}|${t.type}|${t.date}|${t.amount.toFixed(2)}|${t.category || 'Uncategorized'}|${t.details}|${t.timestamp}\n`;
        });

        this.downloadFile(content, `transactions_${this.currentUser}.txt`, 'text/plain');
        alert('✅ File exported for C++ analysis!\n\nCopy the downloaded file to your C++ project folder.');
    }

    exportForPython() {
        let csv = 'date,type,category,amount,day_of_week,month,year\n';

        this.transactions.forEach(t => {
            const date = new Date(t.date);
            csv += `${t.date},${t.type},${t.category || 'Uncategorized'},${t.amount},${date.getDay()},${date.getMonth() + 1},${date.getFullYear()}\n`;
        });

        this.downloadFile(csv, 'khazana_ml_data.csv', 'text/csv');
        alert('✅ Data exported for Python ML analysis!\n\nUse the provided Python script to analyze this data.');
    }

    exportMonthlyReport() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = this.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        let totalIncome = 0;
        let totalExpense = 0;

        monthlyTransactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

        let report = `KHAZANA MONTHLY REPORT - ${monthName}\n`;
        report += `${'='.repeat(50)}\n\n`;
        report += `Total Transactions: ${monthlyTransactions.length}\n`;
        report += `Total Income: ₹${totalIncome.toFixed(2)}\n`;
        report += `Total Expense: ₹${totalExpense.toFixed(2)}\n`;
        report += `Net Savings: ₹${(totalIncome - totalExpense).toFixed(2)}\n\n`;
        report += `TRANSACTIONS:\n`;
        report += `${'-'.repeat(50)}\n`;

        monthlyTransactions.forEach(t => {
            const sign = (t.type === 'deposit' || t.type === 'received') ? '+' : '-';
            report += `${t.date} | ${t.type.padEnd(12)} | ${sign}₹${t.amount.toFixed(2).padStart(10)} | ${t.details}\n`;
        });

        this.downloadFile(report, `monthly_report_${monthName.replace(' ', '_')}.txt`, 'text/plain');
        alert('✅ Monthly report generated!');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('This will replace your current data. Continue?')) {
                    // Restore transactions
                    localStorage.setItem(`transactions_${this.currentUser}`, JSON.stringify(data.transactions));
                    
                    // Restore budgets if available
                    if (data.budgets) {
                        localStorage.setItem(`budgets_${this.currentUser}`, JSON.stringify(data.budgets));
                    }
                    
                    // Restore custom categories if available
                    if (data.customCategories) {
                        localStorage.setItem(`customCategories_${this.currentUser}`, JSON.stringify(data.customCategories));
                    }
                    
                    alert('✅ Data restored successfully!');
                    location.reload();
                }
            } catch (error) {
                alert('❌ Invalid backup file!');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

let exportManager;

window.addEventListener('load', () => {
    exportManager = new ExportManager();
});

function exportCSV() {
    exportManager.exportCSV();
}

function exportPDF() {
    exportManager.exportPDF();
}

function exportJSON() {
    exportManager.exportJSON();
}

function exportForCPP() {
    exportManager.exportForCPP();
}

function exportForPython() {
    exportManager.exportForPython();
}

function exportMonthlyReport() {
    exportManager.exportMonthlyReport();
}

function importData(event) {
    exportManager.importData(event);
}