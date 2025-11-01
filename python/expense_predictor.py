import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns

# Machine Learning for Expense Prediction

class ExpensePredictor:
    def __init__(self, csv_file):
        """Initialize with exported CSV file from Khazana"""
        self.df = pd.read_csv(csv_file)
        self.prepare_data()
    
    def prepare_data(self):
        """Prepare and clean data"""
        # Convert date to datetime
        self.df['date'] = pd.to_datetime(self.df['date'])
        
        # Extract features
        self.df['day'] = self.df['date'].dt.day
        self.df['month'] = self.df['date'].dt.month
        self.df['year'] = self.df['date'].dt.year
        self.df['day_of_week'] = self.df['date'].dt.dayofweek
        self.df['is_weekend'] = self.df['day_of_week'].isin([5, 6]).astype(int)
        
        print("✅ Data loaded successfully!")
        print(f"Total transactions: {len(self.df)}")
    
    def analyze_spending_patterns(self):
        """Analyze spending patterns"""
        print("\n" + "="*60)
        print("SPENDING PATTERN ANALYSIS")
        print("="*60)
        
        # Filter expenses only
        expenses = self.df[self.df['type'].isin(['withdrawal', 'transfer'])]
        
        # Monthly average
        monthly_avg = expenses.groupby('month')['amount'].mean()
        print("\n📅 Average Expense by Month:")
        for month, avg in monthly_avg.items():
            month_name = datetime(2000, month, 1).strftime('%B')
            print(f"   {month_name}: ₹{avg:.2f}")
        
        # Day of week analysis
        dow_avg = expenses.groupby('day_of_week')['amount'].mean()
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        print("\n📊 Average Expense by Day:")
        for dow, avg in dow_avg.items():
            print(f"   {days[dow]}: ₹{avg:.2f}")
        
        # Category analysis
        if 'category' in expenses.columns:
            cat_total = expenses.groupby('category')['amount'].sum().sort_values(ascending=False)
            print("\n🗂️ Total Spending by Category:")
            for cat, total in cat_total.head(5).items():
                print(f"   {cat}: ₹{total:.2f}")
    
    def predict_next_month(self):
        """Simple prediction for next month"""
        expenses = self.df[self.df['type'].isin(['withdrawal', 'transfer'])]
        
        # Get last 3 months average
        recent = expenses.tail(90)  # Approximate last 3 months
        avg_daily = recent['amount'].mean()
        
        # Predict next month (30 days)
        predicted_total = avg_daily * 30
        
        print("\n" + "="*60)
        print("NEXT MONTH PREDICTION")
        print("="*60)
        print(f"\n🔮 Predicted Total Expense: ₹{predicted_total:.2f}")
        print(f"📊 Daily Average: ₹{avg_daily:.2f}")
        print(f"🎯 Recommended Budget: ₹{predicted_total * 1.1:.2f} (with 10% buffer)")
        
        return predicted_total
    
    def generate_insights(self):
        """Generate AI insights"""
        print("\n" + "="*60)
        print("🤖 AI-POWERED INSIGHTS")
        print("="*60)
        
        expenses = self.df[self.df['type'].isin(['withdrawal', 'transfer'])]
        income = self.df[self.df['type'].isin(['deposit', 'received'])]
        
        total_expense = expenses['amount'].sum()
        total_income = income['amount'].sum()
        savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0
        
        # Insight 1: Savings rate
        print(f"\n💰 Savings Rate: {savings_rate:.1f}%")
        if savings_rate > 30:
            print("   ✅ Excellent! You're saving well.")
        elif savings_rate > 10:
            print("   👍 Good! Try to increase to 30% for better financial health.")
        else:
            print("   ⚠️  Low savings. Consider reducing expenses.")
        
        # Insight 2: Weekend vs Weekday
        weekend_exp = expenses[expenses['is_weekend'] == 1]['amount'].sum()
        weekday_exp = expenses[expenses['is_weekend'] == 0]['amount'].sum()
        
        if weekend_exp > weekday_exp:
            print(f"\n🎉 Weekend Spending: {(weekend_exp / total_expense * 100):.1f}% of total")
            print("   💡 Tip: Plan weekend activities within budget to save more!")
        
        # Insight 3: Highest spending category
        if 'category' in expenses.columns:
            top_cat = expenses.groupby('category')['amount'].sum().idxmax()
            top_cat_amount = expenses.groupby('category')['amount'].sum().max()
            print(f"\n📊 Top Spending Category: {top_cat}")
            print(f"   Amount: ₹{top_cat_amount:.2f} ({(top_cat_amount / total_expense * 100):.1f}%)")
    
    def visualize_trends(self):
        """Create visualizations"""
        print("\n📈 Generating visualization...")
        
        expenses = self.df[self.df['type'].isin(['withdrawal', 'transfer'])]
        income = self.df[self.df['type'].isin(['deposit', 'received'])]
        
        # Set style
        sns.set_style("whitegrid")
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('Khazana Financial Analysis', fontsize=16, fontweight='bold')
        
        # 1. Monthly trend
        monthly_expense = expenses.groupby(expenses['date'].dt.to_period('M'))['amount'].sum()
        monthly_income = income.groupby(income['date'].dt.to_period('M'))['amount'].sum()
        
        ax1 = axes[0, 0]
        monthly_expense.plot(kind='line', ax=ax1, label='Expense', color='red', marker='o')
        monthly_income.plot(kind='line', ax=ax1, label='Income', color='green', marker='o')
        ax1.set_title('Monthly Income vs Expense Trend')
        ax1.set_xlabel('Month')
        ax1.set_ylabel('Amount (₹)')
        ax1.legend()
        ax1.grid(True)
        
        # 2. Category pie chart
        if 'category' in expenses.columns:
            ax2 = axes[0, 1]
            cat_data = expenses.groupby('category')['amount'].sum()
            ax2.pie(cat_data, labels=cat_data.index, autopct='%1.1f%%', startangle=90)
            ax2.set_title('Expense Distribution by Category')
        
        # 3. Day of week bar chart
        ax3 = axes[1, 0]
        dow_data = expenses.groupby('day_of_week')['amount'].sum()
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        ax3.bar(range(7), [dow_data.get(i, 0) for i in range(7)], color='steelblue')
        ax3.set_xticks(range(7))
        ax3.set_xticklabels(days)
        ax3.set_title('Spending by Day of Week')
        ax3.set_xlabel('Day')
        ax3.set_ylabel('Amount (₹)')
        
        # 4. Daily spending trend
        ax4 = axes[1, 1]
        daily_expense = expenses.groupby('date')['amount'].sum()
        daily_expense.plot(kind='area', ax=ax4, color='coral', alpha=0.6)
        ax4.set_title('Daily Spending Trend')
        ax4.set_xlabel('Date')
        ax4.set_ylabel('Amount (₹)')
        ax4.grid(True)
        
        plt.tight_layout()
        plt.savefig('khazana_analysis.png', dpi=300, bbox_inches='tight')
        print("✅ Visualization saved as 'khazana_analysis.png'")
        plt.show()

def main():
    print("╔════════════════════════════════════════════════════════╗")
    print("║         KHAZANA ML EXPENSE ANALYZER (Python)          ║")
    print("╚════════════════════════════════════════════════════════╝")
    
    csv_file = input("\nEnter CSV file path (exported from Khazana): ").strip()
    
    try:
        predictor = ExpensePredictor(csv_file)
        
        while True:
            print("\n" + "="*60)
            print("MENU")
            print("="*60)
            print("1. Analyze Spending Patterns")
            print("2. Predict Next Month Expense")
            print("3. Generate AI Insights")
            print("4. Visualize Trends")
            print("5. Full Analysis (All Above)")
            print("6. Exit")
            
            choice = input("\nEnter choice: ").strip()
            
            if choice == '1':
                predictor.analyze_spending_patterns()
            elif choice == '2':
                predictor.predict_next_month()
            elif choice == '3':
                predictor.generate_insights()
            elif choice == '4':
                predictor.visualize_trends()
            elif choice == '5':
                predictor.analyze_spending_patterns()
                predictor.predict_next_month()
                predictor.generate_insights()
                predictor.visualize_trends()
            elif choice == '6':
                print("\n✅ Thank you for using Khazana ML Analyzer!")
                break
            else:
                print("❌ Invalid choice!")
            
            input("\nPress Enter to continue...")
    
    except FileNotFoundError:
        print(f"❌ Error: File '{csv_file}' not found!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()