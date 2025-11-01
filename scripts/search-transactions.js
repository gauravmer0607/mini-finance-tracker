class TransactionSearchManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.transactions = this.loadTransactions();
        this.allCategories = this.extractCategories();
        this.currentFilter = 'all';
        
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

    extractCategories() {
        const categories = new Set();
        this.transactions.forEach(t => {
            if (t.category) {
                categories.add(t.category);
            }
        });
        return Array.from(categories).sort();
    }

    init() {
        this.populateCategoryFilter();
        this.displayResults(this.transactions);
        
        // Set first filter chip as active
        document.querySelector('[data-filter="all"]').classList.add('active');
    }

    populateCategoryFilter() {
        const select = document.getElementById('categoryFilter');
        this.allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    performSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        
        let results = this.transactions;
        
        // Apply type filter
        if (this.currentFilter !== 'all') {
            results = results.filter(t => t.type === this.currentFilter);
        }
        
        // Apply search query
        if (query) {
            results = results.filter(t => {
                return (
                    t.amount.toString().includes(query) ||
                    t.details.toLowerCase().includes(query) ||
                    (t.category && t.category.toLowerCase().includes(query)) ||
                    t.type.toLowerCase().includes(query) ||
                    t.date.includes(query)
                );
            });
        }
        
        this.displayResults(results, query);
    }

    quickFilter(type) {
        // Update active chip
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        document.querySelector(`[data-filter="${type}"]`).classList.add('active');
        
        this.currentFilter = type;
        this.performSearch();
    }

    applyAdvancedFilters() {
        const minAmount = parseFloat(document.getElementById('minAmount').value) || 0;
        const maxAmount = parseFloat(document.getElementById('maxAmount').value) || Infinity;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const category = document.getElementById('categoryFilter').value;
        
        let results = this.transactions;
        
        // Type filter
        if (this.currentFilter !== 'all') {
            results = results.filter(t => t.type === this.currentFilter);
        }
        
        // Amount range
        results = results.filter(t => t.amount >= minAmount && t.amount <= maxAmount);
        
        // Date range
        if (startDate) {
            results = results.filter(t => t.date >= startDate);
        }
        if (endDate) {
            results = results.filter(t => t.date <= endDate);
        }
        
        // Category
        if (category) {
            results = results.filter(t => t.category === category);
        }
        
        this.displayResults(results);
    }

    displayResults(results, searchQuery = '') {
        const resultsCount = document.getElementById('resultsCount');
        const resultsList = document.getElementById('resultsList');
        
        resultsCount.textContent = `${results.length} transaction${results.length !== 1 ? 's' : ''} found`;
        
        if (results.length === 0) {
            resultsList.innerHTML = `
                <div class="no-results">
                    <span class="search-icon">🔍</span>
                    <p>No transactions found matching your search.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        results.forEach(t => {
            const isIncome = (t.type === 'deposit' || t.type === 'received');
            const amountClass = isIncome ? 'income' : 'expense';
            const amountSign = isIncome ? '+' : '-';
            
            // Highlight search query
            let details = t.details;
            if (searchQuery) {
                const regex = new RegExp(`(${searchQuery})`, 'gi');
                details = details.replace(regex, '<span class="highlight">$1</span>');
            }
            
            html += `
                <div class="result-item">
                    <div class="result-info">
                        <div class="result-date">${this.formatDate(t.date)} • ${t.timestamp}</div>
                        <div class="result-description">${details}</div>
                        <div class="result-meta">
                            <span class="result-type">${t.type}</span>
                            <span class="result-category">${t.category || 'Uncategorized'}</span>
                        </div>
                    </div>
                    <div class="result-amount ${amountClass}">
                        ${amountSign}₹${t.amount.toFixed(2)}
                    </div>
                </div>
            `;
        });
        
        resultsList.innerHTML = html;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    toggleAdvanced() {
        const advanced = document.getElementById('advancedFilters');
        const btn = document.querySelector('.toggle-advanced');
        
        advanced.classList.toggle('show');
        
        if (advanced.classList.contains('show')) {
            btn.textContent = 'Advanced Filters ▲';
        } else {
            btn.textContent = 'Advanced Filters ▼';
        }
    }
}

let searchManager;

window.addEventListener('load', () => {
    searchManager = new TransactionSearchManager();
});

function performSearch() {
    searchManager.performSearch();
}

function quickFilter(type) {
    searchManager.quickFilter(type);
}

function applyAdvancedFilters() {
    searchManager.applyAdvancedFilters();
}

function toggleAdvanced() {
    searchManager.toggleAdvanced();
}

// Real-time search with debouncing
let searchTimeout;
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch();
        }, 300);
    });
});