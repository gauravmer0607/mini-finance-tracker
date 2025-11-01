class BalanceManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.pin = this.getPin();
        this.enteredPin = '';
        this.maxAttempts = 3;
        this.attempts = 0;
        this.balance = this.getBalance();
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

    getPin() {
        let pin = localStorage.getItem(`pin_${this.currentUser}`);
        if (!pin) {
            pin = '123456';
            localStorage.setItem(`pin_${this.currentUser}`, pin);
        }
        return pin;
    }

    getBalance() {
        const balance = localStorage.getItem(`balance_${this.currentUser}`);
        return balance ? parseFloat(balance) : 0;
    }

    getTransactions() {
        const key = `transactions_${this.currentUser}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    calculateBalance() {
        const transactions = this.getTransactions();
        let balance = 0;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'deposit' || transaction.type === 'received') {
                balance += transaction.amount;
            } else if (transaction.type === 'withdrawal' || transaction.type === 'transfer') {
                balance -= transaction.amount;
            }
        });
        
        localStorage.setItem(`balance_${this.currentUser}`, balance.toString());
        return balance;
    }

    addPin(digit) {
        if (this.enteredPin.length < 6) {
            this.enteredPin += digit;
            this.updatePinDisplay();
            
            if (this.enteredPin.length === 6) {
                setTimeout(() => this.verifyPin(), 300);
            }
        }
    }

    clearPin() {
        this.enteredPin = '';
        this.updatePinDisplay();
        document.getElementById('errorMessage').textContent = '';
    }

    backspace() {
        if (this.enteredPin.length > 0) {
            this.enteredPin = this.enteredPin.slice(0, -1);
            this.updatePinDisplay();
        }
    }

    updatePinDisplay() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            if (index < this.enteredPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    verifyPin() {
        if (this.enteredPin === this.pin) {
            this.showBalance();
        } else {
            this.attempts++;
            if (this.attempts >= this.maxAttempts) {
                document.getElementById('errorMessage').textContent = 
                    'Too many failed attempts. Redirecting...';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                document.getElementById('errorMessage').textContent = 
                    `❌ Incorrect PIN. ${this.maxAttempts - this.attempts} attempts remaining.`;
                this.clearPin();
            }
        }
    }

    showBalance() {
        // Recalculate balance
        this.balance = this.calculateBalance();
        
        document.getElementById('pinContainer').style.display = 'none';
        document.getElementById('balanceContainer').classList.add('show');

        // Get user data
        const userData = JSON.parse(localStorage.getItem('khazanaUser'));
        
        // Update user info
        document.getElementById('userName').textContent = `Welcome, ${userData?.name || 'User'}`;
        document.getElementById('lastUpdated').textContent = 
            `Last updated: ${new Date().toLocaleString()}`;

        // Update balance display with animation
        this.animateBalance();

        // Update balance status
        const statusElement = document.getElementById('balanceStatus');
        if (this.balance > 0) {
            statusElement.className = 'balance-status positive';
            statusElement.textContent = '✓ Positive Balance';
        } else if (this.balance < 0) {
            statusElement.className = 'balance-status negative';
            statusElement.textContent = '⚠️ Negative Balance';
        } else {
            statusElement.className = 'balance-status zero';
            statusElement.textContent = 'Zero Balance';
        }

        // Calculate income and expense
        this.updateStats();
    }

    animateBalance() {
        const balanceElement = document.getElementById('balanceAmount');
        const targetBalance = this.balance;
        let currentBalance = 0;
        const increment = targetBalance / 50;
        
        const animation = setInterval(() => {
            currentBalance += increment;
            if ((increment > 0 && currentBalance >= targetBalance) || 
                (increment < 0 && currentBalance <= targetBalance)) {
                currentBalance = targetBalance;
                clearInterval(animation);
            }
            balanceElement.innerHTML = 
                `<span class="balance-currency">₹</span>${currentBalance.toFixed(2)}`;
        }, 20);
    }

    updateStats() {
        const transactions = this.getTransactions();
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'received') {
                totalIncome += t.amount;
            } else if (t.type === 'withdrawal' || t.type === 'transfer') {
                totalExpense += t.amount;
            }
        });

        document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `₹${totalExpense.toFixed(2)}`;
    }

    logout() {
        document.getElementById('balanceContainer').classList.remove('show');
        document.getElementById('pinContainer').style.display = 'block';
        this.clearPin();
        this.attempts = 0;
    }
}

const balanceManager = new BalanceManager();

function addPin(digit) {
    balanceManager.addPin(digit);
}

function clearPin() {
    balanceManager.clearPin();
}

function backspace() {
    balanceManager.backspace();
}

function logout() {
    balanceManager.logout();
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    if (document.getElementById('pinContainer').style.display !== 'none') {
        if (event.key >= '0' && event.key <= '9') {
            addPin(event.key);
        } else if (event.key === 'Backspace') {
            event.preventDefault();
            backspace();
        } else if (event.key === 'Enter') {
            if (balanceManager.enteredPin.length === 6) {
                balanceManager.verifyPin();
            }
        } else if (event.key === 'Escape') {
            clearPin();
        }
    }
});

// Show PIN hint on first visit
window.onload = function() {
    const isFirstTime = !localStorage.getItem(`pin_shown_${balanceManager.currentUser}`);
    if (isFirstTime) {
        setTimeout(() => {
            alert('💡 Your default PIN is: 123456\n\nYou can change it later in settings.');
            localStorage.setItem(`pin_shown_${balanceManager.currentUser}`, 'true');
        }, 500);
    }
};