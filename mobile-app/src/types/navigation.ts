/**
 * Navigation type definitions
 */
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  Wallet: undefined;
  Transactions: { filterType?: 'all' | 'income' | 'expense' };
  Zakat: undefined;
  Reminders: undefined;
  Accounts: undefined;
  Stocks: undefined;
  Categories: undefined;
  AccountForm: { accountId: string | null };
  StockForm: { stockId: string | null };
  TransactionForm: { transactionId: string | null };
  CategoryForm: { categoryId: string | null };
  AccountTransactions: { accountId: string; accountName: string };
};
