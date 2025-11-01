class TransactionManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.transactions = this.loadTransactions();
        this.balance = this.calculateBalance();
        this.updateQuickStats();
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

    saveTransactions() {
        const key = `transactions_${this.currentUser}`;
        this.transactions = this.mergeSort(this.transactions);
        localStorage.setItem(key, JSON.stringify(this.transactions));
        this.saveToFileFormat();
    }

    mergeSort(arr) {
        if (arr.length <= 1) return arr;
        const middle = Math.floor(arr.length / 2);
        const left = arr.slice(0, middle);
        const right = arr.slice(middle);
        return this.merge(this.mergeSort(left), this.mergeSort(right));
    }

    merge(left, right) {
        let result = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            if (new Date(left[leftIndex].date) >= new Date(right[rightIndex].date)) {
                result.push(left[leftIndex]);
                leftIndex++;
            } else {
                result.push(right[rightIndex]);
                rightIndex++;
            }
        }

        return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
    }

    saveToFileFormat() {
        const filename = `transactions_${this.currentUser}.txt`;
        let fileContent = '';
        
        this.transactions.forEach(transaction => {
            const line = [
                transaction.id,
                transaction.type,
                transaction.date,
                transaction.amount.toFixed(2),
                transaction.category || 'Uncategorized',
                transaction.details,
                transaction.timestamp
            ].join('|');
            fileContent += line + '\n';
        });

        localStorage.setItem(`file_${this.currentUser}`, fileContent);
    }

    addTransaction(type, data) {
        const transaction = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            type: type,
            date: data.date,
            amount: parseFloat(data.amount),
            category: data.category || 'Uncategorized',
            details: this.getDetails(type, data),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.balance = this.calculateBalance();
        this.updateQuickStats();
        
        return transaction;
    }

    getDetails(type, data) {
        switch(type) {
            case 'deposit': return data.source;
            case 'withdrawal': return data.reason;
            case 'transfer': return data.transferTo;
            case 'received': return data.receivedFrom;
            default: return '';
        }
    }

    calculateBalance() {
        let balance = 0;
        this.transactions.forEach(transaction => {
            if (transaction.type === 'deposit' || transaction.type === 'received') {
                balance += transaction.amount;
            } else if (transaction.type === 'withdrawal' || transaction.type === 'transfer') {
                balance -= transaction.amount;
            }
        });
        
        localStorage.setItem(`balance_${this.currentUser}`, balance.toString());
        return balance;
    }

    hasEnoughBalance(amount) {
        return this.balance >= amount;
    }

    updateQuickStats() {
        // Update current balance
        document.getElementById('currentBalance').textContent = `₹${this.balance.toFixed(2)}`;
        
        // Calculate this month's total
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let monthTotal = 0;
        this.transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                if (t.type === 'withdrawal' || t.type === 'transfer') {
                    monthTotal += t.amount;
                }
            }
        });
        
        document.getElementById('monthTotal').textContent = `₹${monthTotal.toFixed(2)}`;
    }

    exportForCPP() {
        const filename = `transactions_${this.currentUser}.txt`;
        let fileContent = '';
        
        this.transactions.forEach(t => {
            fileContent += `${t.id}|${t.type}|${t.date}|${t.amount.toFixed(2)}|${t.category}|${t.details}|${t.timestamp}\n`;
        });
        
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Exported for C++ processing');
    }
}

const transactionManager = new TransactionManager();
let currentTransactionType = null;

window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = today;
    });
};

function selectTransactionType(type) {
    document.querySelectorAll('.type-card').forEach(card => {
        card.classList.remove('active');
    });

    document.querySelectorAll('.transaction-form').forEach(form => {
        form.classList.remove('active');
    });

    document.getElementById('statusContainer').classList.remove('show');

    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    document.getElementById(`${type}Form`).classList.add('active');

    currentTransactionType = type;
}

function handleSubmit(event, type) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const amount = parseFloat(data.amount);
    
    // Check for sufficient balance for withdrawals and transfers
    if ((type === 'withdrawal' || type === 'transfer') && !transactionManager.hasEnoughBalance(amount)) {
        showError('Insufficient balance! Current balance: ₹' + transactionManager.balance.toFixed(2));
        return;
    }
    
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    form.parentElement.classList.remove('active');
    const statusContainer = document.getElementById('statusContainer');
    statusContainer.classList.add('show');
    
    showLoader();
    
    setTimeout(() => {
        const transaction = transactionManager.addTransaction(type, data);
        showSuccess(type, data);
        
        setTimeout(() => {
            form.reset();
            const today = new Date().toISOString().split('T')[0];
            form.querySelector('input[type="date"]').value = today;
            submitBtn.disabled = false;
            submitBtn.textContent = getOriginalButtonText(type);
            
            statusContainer.classList.remove('show');
            form.parentElement.classList.add('active');
        }, 4000);
        
    }, 2000);
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('successIcon').style.display = 'none';
    document.getElementById('errorIcon').style.display = 'none';
    document.getElementById('successDetails').style.display = 'none';
    document.getElementById('errorDetails').style.display = 'none';
}

function showSuccess(type, data) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('successIcon').style.display = 'flex';
    document.getElementById('successDetails').style.display = 'block';
    
    const amountDisplay = document.getElementById('amountDisplay');
    const successMessage = document.getElementById('successMessage');
    const newBalanceDiv = document.getElementById('newBalance');
    const amount = parseFloat(data.amount);
    
    switch(type) {
        case 'deposit':
            amountDisplay.innerHTML = `+₹${amount.toFixed(2)}`;
            amountDisplay.className = 'amount-display positive';
            successMessage.textContent = 'Deposited Successfully!';
            break;
        case 'withdrawal':
            amountDisplay.innerHTML = `-₹${amount.toFixed(2)}`;
            amountDisplay.className = 'amount-display negative';
            successMessage.textContent = 'Withdrawn Successfully!';
            break;
        case 'transfer':
            amountDisplay.innerHTML = `-₹${amount.toFixed(2)}`;
            amountDisplay.className = 'amount-display negative';
            successMessage.textContent = 'Transferred Successfully!';
            break;
        case 'received':
            amountDisplay.innerHTML = `+₹${amount.toFixed(2)}`;
            amountDisplay.className = 'amount-display positive';
            successMessage.textContent = 'Received Successfully!';
            break;
    }
    
    newBalanceDiv.innerHTML = `New Balance: <strong>₹${transactionManager.balance.toFixed(2)}</strong>`;
}

function showError(message) {
    const statusContainer = document.getElementById('statusContainer');
    statusContainer.classList.add('show');
    
    document.getElementById('loader').style.display = 'none';
    document.getElementById('successIcon').style.display = 'none';
    document.getElementById('errorIcon').style.display = 'flex';
    document.getElementById('successDetails').style.display = 'none';
    document.getElementById('errorDetails').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;

    setTimeout(() => {
        statusContainer.classList.remove('show');
        if (currentTransactionType) {
            document.getElementById(`${currentTransactionType}Form`).classList.add('active');
        }
    }, 3000);
}

function getOriginalButtonText(type) {
    switch(type) {
        case 'deposit': return 'Add Deposit';
        case 'withdrawal': return 'Withdraw';
        case 'transfer': return 'Transfer';
        case 'received': return 'Add Receipt';
        default: return 'Submit';
    }
}