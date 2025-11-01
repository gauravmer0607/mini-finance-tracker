#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <ctime>

using namespace std;

struct Transaction {
    long long id;
    string type;
    string date;
    double amount;
    string category;
    string details;
    string timestamp;
    Transaction* next;
    
    Transaction() : next(nullptr) {}
    
    Transaction(long long _id, string _type, string _date, double _amount, 
                string _category, string _details, string _timestamp) 
        : id(_id), type(_type), date(_date), amount(_amount), category(_category),
          details(_details), timestamp(_timestamp), next(nullptr) {}
};

class TransactionAnalyzer {
private:
    Transaction* head;
    string username;
    string filename;
    
public:
    TransactionAnalyzer(string user) : head(nullptr), username(user) {
        filename = "transactions_" + username + ".txt";
    }
    
    ~TransactionAnalyzer() {
        clearList();
    }
    
    void clearList() {
        while (head) {
            Transaction* temp = head;
            head = head->next;
            delete temp;
        }
    }
    
    bool loadFromFile() {
        ifstream file(filename);
        if (!file.is_open()) {
            cout << "\n❌ Error: File not found: " << filename << endl;
            cout << "Please export from web UI first!" << endl;
            return false;
        }
        
        clearList();
        
        string line;
        int count = 0;
        
        while (getline(file, line)) {
            if (line.empty()) continue;
            
            vector<string> parts;
            stringstream ss(line);
            string part;
            
            while (getline(ss, part, '|')) {
                parts.push_back(part);
            }
            
            if (parts.size() >= 7) {
                Transaction* newTrans = new Transaction(
                    stoll(parts[0]), parts[1], parts[2], stod(parts[3]),
                    parts[4], parts[5], parts[6]
                );
                
                if (!head) {
                    head = newTrans;
                } else {
                    Transaction* temp = head;
                    while (temp->next) {
                        temp = temp->next;
                    }
                    temp->next = newTrans;
                }
                count++;
            }
        }
        
        file.close();
        cout << "\n✅ Loaded " << count << " transactions from " << filename << endl;
        return true;
    }
    
    void analyzeByMonth() {
        if (!head) {
            cout << "No transactions to analyze!" << endl;
            return;
        }
        
        map<string, vector<Transaction*>> monthMap;
        
        Transaction* current = head;
        while (current) {
            string monthKey = current->date.substr(0, 7);
            monthMap[monthKey].push_back(current);
            current = current->next;
        }
        
        cout << "\n╔════════════════════════════════════════════════════════╗" << endl;
        cout << "║         MONTH-WISE TRANSACTION ANALYSIS               ║" << endl;
        cout << "╚════════════════════════════════════════════════════════╝" << endl;
        
        for (auto& pair : monthMap) {
            string month = pair.first;
            vector<Transaction*>& transactions = pair.second;
            
            double monthIncome = 0.0;
            double monthExpense = 0.0;
            
            for (Transaction* t : transactions) {
                if (t->type == "deposit" || t->type == "received") {
                    monthIncome += t->amount;
                } else {
                    monthExpense += t->amount;
                }
            }
            
            cout << "\n📅 Month: " << month << " (" << transactions.size() << " transactions)" << endl;
            cout << "   Income:  ₹" << fixed << setprecision(2) << monthIncome << endl;
            cout << "   Expense: ₹" << monthExpense << endl;
            cout << "   Net:     ₹" << (monthIncome - monthExpense) << endl;
            cout << "   ────────────────────────────────────────" << endl;
            
            cout << "   Top Transactions:" << endl;
            int shown = 0;
            for (Transaction* t : transactions) {
                if (shown >= 5) break;
                string sign = (t->type == "deposit" || t->type == "received") ? "+" : "-";
                cout << "   " << t->date << " | " << sign << "₹" << t->amount 
                     << " | " << t->details << endl;
                shown++;
            }
        }
    }
    
    void analyzeByCategory() {
        if (!head) {
            cout << "No transactions!" << endl;
            return;
        }
        
        map<string, double> categoryExpense;
        map<string, int> categoryCount;
        
        Transaction* current = head;
        while (current) {
            if (current->type == "withdrawal" || current->type == "transfer") {
                categoryExpense[current->category] += current->amount;
                categoryCount[current->category]++;
            }
            current = current->next;
        }
        
        cout << "\n╔════════════════════════════════════════════════════════╗" << endl;
        cout << "║         EXPENSE CATEGORY ANALYSIS                     ║" << endl;
        cout << "╚════════════════════════════════════════════════════════╝" << endl;
        
        vector<pair<string, double>> categories(categoryExpense.begin(), categoryExpense.end());
        sort(categories.begin(), categories.end(), [](auto& a, auto& b) {
            return a.second > b.second;
        });
        
        for (auto& cat : categories) {
            cout << "\n📁 Category: " << cat.first << endl;
            cout << "   Total: ₹" << fixed << setprecision(2) << cat.second << endl;
            cout << "   Transactions: " << categoryCount[cat.first] << endl;
            cout << "   Average: ₹" << (cat.second / categoryCount[cat.first]) << endl;
        }
    }
    
    void showTopExpenses(int limit = 5) {
        vector<Transaction*> expenses;
        Transaction* current = head;
        
        while (current) {
            if (current->type == "withdrawal" || current->type == "transfer") {
                expenses.push_back(current);
            }
            current = current->next;
        }
        
        sort(expenses.begin(), expenses.end(), [](Transaction* a, Transaction* b) {
            return a->amount > b->amount;
        });
        
        cout << "\n╔════════════════════════════════════════════════════════╗" << endl;
        cout << "║         TOP " << limit << " HIGHEST EXPENSES                        ║" << endl;
        cout << "╚════════════════════════════════════════════════════════╝" << endl;
        
        int shown = min(limit, (int)expenses.size());
        for (int i = 0; i < shown; i++) {
            Transaction* t = expenses[i];
            cout << "\n" << (i+1) << ". ₹" << fixed << setprecision(2) << t->amount << endl;
            cout << "   Date: " << t->date << endl;
            cout << "   Category: " << t->category << endl;
            cout << "   Details: " << t->details << endl;
        }
    }
    
    void displayStatistics() {
        if (!head) {
            cout << "No transactions!" << endl;
            return;
        }
        
        double totalIncome = 0;
        double totalExpense = 0;
        int incomeCount = 0;
        int expenseCount = 0;
        
        Transaction* current = head;
        while (current) {
            if (current->type == "deposit" || current->type == "received") {
                totalIncome += current->amount;
                incomeCount++;
            } else {
                totalExpense += current->amount;
                expenseCount++;
            }
            current = current->next;
        }
        
        cout << "\n╔════════════════════════════════════════════════════════╗" << endl;
        cout << "║         FINANCIAL STATISTICS                          ║" << endl;
        cout << "╚════════════════════════════════════════════════════════╝" << endl;
        
        cout << "\n💰 Total Income:  ₹" << fixed << setprecision(2) << totalIncome << endl;
        cout << "💸 Total Expense: ₹" << totalExpense << endl;
        cout << "💵 Net Balance:   ₹" << (totalIncome - totalExpense) << endl;
        cout << "\n📊 Income Transactions:  " << incomeCount << endl;
        cout << "📉 Expense Transactions: " << expenseCount << endl;
        cout << "📈 Total Transactions:   " << (incomeCount + expenseCount) << endl;
        
        if (incomeCount > 0) {
            cout << "\n🎯 Average Income:  ₹" << (totalIncome / incomeCount) << endl;
        }
        if (expenseCount > 0) {
            cout << "🎯 Average Expense: ₹" << (totalExpense / expenseCount) << endl;
        }
        
        double savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
        cout << "\n💎 Savings Rate: " << savingsRate << "%" << endl;
    }
};

void displayMenu() {
    cout << "\n╔════════════════════════════════════════════════════════╗" << endl;
    cout << "║    KHAZANA - TRANSACTION ANALYZER (C++)               ║" << endl;
    cout << "╚════════════════════════════════════════════════════════╝" << endl;
    cout << "\n1. 📂 Load Transactions from Web UI Export" << endl;
    cout << "2. 📊 Month-wise Analysis" << endl;
    cout << "3. 📁 Category-wise Analysis" << endl;
    cout << "4. 💰 Top Expenses" << endl;
    cout << "5. 📈 Financial Statistics" << endl;
    cout << "6. 🚪 Exit" << endl;
    cout << "\nEnter choice: ";
}

int main() {
    string username;
    
    cout << "\n╔════════════════════════════════════════════════════════╗" << endl;
    cout << "║         WELCOME TO KHAZANA C++ ANALYZER               ║" << endl;
    cout << "╚════════════════════════════════════════════════════════╝" << endl;
    
    cout << "\nEnter username/email: ";
    getline(cin, username);
    
    TransactionAnalyzer analyzer(username);
    
    int choice;
    bool dataLoaded = false;
    
    while (true) {
        displayMenu();
        cin >> choice;
        cin.ignore();
        
        switch (choice) {
            case 1:
                dataLoaded = analyzer.loadFromFile();
                break;
            
            case 2:
                if (!dataLoaded) {
                    cout << "⚠️  Please load data first (Option 1)!" << endl;
                } else {
                    analyzer.analyzeByMonth();
                }
                break;
            
            case 3:
                if (!dataLoaded) {
                    cout << "⚠️  Please load data first (Option 1)!" << endl;
                } else {
                    analyzer.analyzeByCategory();
                }
                break;
            
            case 4:
                if (!dataLoaded) {
                    cout << "⚠️  Please load data first (Option 1)!" << endl;
                } else {
                    int limit;
                    cout << "How many top expenses to show? ";
                    cin >> limit;
                    analyzer.showTopExpenses(limit);
                }
                break;
            
            case 5:
                if (!dataLoaded) {
                    cout << "⚠️  Please load data first (Option 1)!" << endl;
                } else {
                    analyzer.displayStatistics();
                }
                break;
            
            case 6:
                cout << "\n✅ Thank you for using Khazana C++ Analyzer!" << endl;
                return 0;
            
            default:
                cout << "❌ Invalid choice!" << endl;
                break;
        }
        
        cout << "\nPress Enter to continue...";
        cin.get();
    }
    
    return 0;
}