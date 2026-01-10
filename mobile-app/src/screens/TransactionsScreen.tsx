import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Typography } from '../components/Typography';
import { Icon, IconName } from '../components/Icon';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { Skeleton } from '../components/Skeleton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { theme } from '../theme';
import { getMonthlyStats, getCategorySpendingData, formatCurrency } from '../utils/analytics';

interface Transaction {
  id: string;
  amount: string | number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  note?: string;
  from_account_id?: string;
  to_account_id?: string;
  categories: {
    name: string;
    type: 'expense' | 'income';
  };
}

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = async () => {
    try {
      const [txsRes, accountsRes] = await Promise.all([
        apiService.transactions.getAll(),
        apiService.accounts.getAll(),
      ]);
      setTransactions(txsRes.data);
      setAccounts(accountsRes.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await apiService.transactions.delete(id);
        loadData();
      }},
    ]);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      const isMonthMatch = tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
      const isTypeMatch = selectedType === 'all' || t.type === selectedType;
      return isMonthMatch && isTypeMatch;
    });
  }, [transactions, currentDate, selectedType]);

  const monthlyStats = useMemo(() => getMonthlyStats(transactions, currentDate.getMonth(), currentDate.getFullYear()), [transactions, currentDate]);
  const chartData = useMemo(() => getCategorySpendingData(transactions, currentDate.getMonth(), currentDate.getFullYear()), [transactions, currentDate]);

  const changeMonth = (delta: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + delta);
    setCurrentDate(next);
  };

  const getCategoryIcon = (name: string): IconName => {
    const n = name.toLowerCase();
    if (n.includes('food')) return 'Utensils';
    if (n.includes('salary')) return 'Briefcase';
    if (n.includes('rent')) return 'Home';
    if (n.includes('bus')) return 'TrendingUp';
    return 'Tag';
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.monthPicker}>
        <TouchableOpacity onPress={() => changeMonth(-1)}><Icon name="ChevronLeft" color={theme.colors.primary} /></TouchableOpacity>
        <Typography variant="h3">{currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</Typography>
        <TouchableOpacity onPress={() => changeMonth(1)}><Icon name="ChevronRight" color={theme.colors.primary} /></TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Typography variant="caption" color={theme.colors.textSecondary}>Income</Typography>
          <Typography variant="h4" color={theme.colors.success}>{formatCurrency(monthlyStats.income)}</Typography>
        </View>
        <View style={styles.summaryItem}>
          <Typography variant="caption" color={theme.colors.textSecondary}>Spent</Typography>
          <Typography variant="h4" color={theme.colors.error}>{formatCurrency(monthlyStats.expense)}</Typography>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense', 'transfer'] as const).map(t => (
          <TouchableOpacity 
            key={t} 
            style={[styles.filterChip, selectedType === t && styles.filterChipActive]}
            onPress={() => setSelectedType(t)}
          >
            <Typography variant="caption" color={selectedType === t ? '#fff' : theme.colors.textSecondary}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {chartData.labels.length > 0 && selectedType === 'all' && (
        <Card style={styles.chartCard} variant="outlined">
           <CategoryBarChart data={chartData} title="Spending by Category" />
        </Card>
      )}
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('TransactionForm', { transactionId: item.id })}
            onLongPress={() => handleDelete(item.id)}
          >
            <Card style={styles.transactionCard} variant="flat">
              <View style={styles.cardContent}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? theme.colors.success + '15' : theme.colors.primary + '15' }]}>
                  <Icon name={item.type === 'transfer' ? 'ArrowLeftRight' : getCategoryIcon(item.categories?.name || '')} size={20} color={item.type === 'income' ? theme.colors.success : theme.colors.primary} />
                </View>
                <View style={styles.txInfo}>
                  <Typography variant="h4">{item.note || item.categories?.name || 'Transfer'}</Typography>
                  <Typography variant="caption" color={theme.colors.textTertiary}>
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Typography>
                </View>
                <Typography variant="h4" color={item.type === 'income' ? theme.colors.success : item.type === 'expense' ? theme.colors.error : theme.colors.text}>
                  {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : ''}{formatCurrency(item.amount)}
                </Typography>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="No transactions for this period" />}
        contentContainerStyle={{ padding: theme.spacing.lg }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: { marginBottom: theme.spacing.xl },
  monthPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  summaryRow: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  summaryItem: { flex: 1, alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.lg },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chartCard: { marginBottom: theme.spacing.lg, padding: theme.spacing.md },
  transactionCard: { marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  txInfo: { flex: 1 }
});
