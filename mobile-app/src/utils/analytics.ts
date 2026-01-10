export interface Transaction {
  id: string;
  amount: number | string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  from_account_id?: string;
  to_account_id?: string;
  categories?: {
    name: string;
    type: 'expense' | 'income';
  };
}

export const aggregateBalanceByType = (accounts: any[]) => {
  const cash = accounts
    .filter((a) => a.type === 'cash')
    .reduce((sum, a) => sum + parseFloat(a.current_balance || 0), 0);
  const bank = accounts
    .filter((a) => a.type === 'bank')
    .reduce((sum, a) => sum + parseFloat(a.current_balance || 0), 0);

  return [
    { name: 'Cash', population: cash, color: '#3b82f6', legendFontColor: '#64748b' },
    { name: 'Bank', population: bank, color: '#10b981', legendFontColor: '#64748b' },
  ];
};

export const getMonthlyStats = (transactions: Transaction[], month?: number, year?: number) => {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  return transactions.reduce(
    (acc, t) => {
      const date = new Date(t.date);
      if (date.getMonth() === targetMonth && date.getFullYear() === targetYear) {
        const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
        if (t.type === 'income') {
          acc.income += amount;
        } else if (t.type === 'expense') {
          acc.expense += amount;
        }
        // Transfers are typically neutral to net worth but we could track them if needed
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
};

export const getCategorySpendingData = (transactions: Transaction[], month?: number, year?: number) => {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  const spendingMap: Record<string, number> = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    if (
      date.getMonth() === targetMonth &&
      date.getFullYear() === targetYear &&
      t.type === 'expense' &&
      t.categories
    ) {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      const catName = t.categories.name;
      spendingMap[catName] = (spendingMap[catName] || 0) + amount;
    }
  });

  const labels = Object.keys(spendingMap);
  const data = Object.values(spendingMap);

  return {
    labels,
    datasets: [{ data }],
  };
};

export const formatCurrency = (amount: number | string, currency = 'INR') => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === null || num === undefined) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
