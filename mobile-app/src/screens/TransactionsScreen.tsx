import React, { useState, useCallback, useMemo, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Typography } from '../components/Typography';
import { Icon, IconName } from '../components/Icon';
import { Skeleton } from '../components/Skeleton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useFAB } from '../context/FABContext';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { getMonthlyStats, formatCurrency } from '../utils/analytics';

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
  const { theme, mode } = useTheme();
  const styles = getStyles(theme);
  const { showFAB, hideFAB } = useFAB();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCarryOn, setShowCarryOn] = useState(false);
  const lastScrollY = React.useRef(0);

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
      showFAB();
      return () => hideFAB();
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

  const carryOnStats = useMemo(() => {
    // Total balance up to current month (inclusive)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    
    const income = transactions
      .filter(t => t.type === 'income' && new Date(t.date) <= endOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const expense = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) <= endOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    return { income, expense, balance: income - expense };
  }, [transactions, currentDate]);

  const categoryStats = useMemo(() => {
      const chartColors = (theme.colors as any).chart || ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
      
      // Use transactions filtered ONLY by month for the chart to keep it intact
      const monthOnlyTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      });

      const targets = monthOnlyTransactions.filter(t => t.type === chartType);
      const data: Record<string, number> = {};
      let total = 0;
      
      targets.forEach(t => {
          const catName = t.categories?.name || 'Uncategorized';
          const amount = Number(t.amount);
          data[catName] = (data[catName] || 0) + amount;
          total += amount;
      });
      
        return Object.entries(data).map(([name, amount], index) => {
          const percentage = total > 0 ? ((amount / total) * 100).toFixed(0) : '0';
          return {
            name: `${name} (${percentage}%)`, // Only category and percent
            population: amount,
            color: chartColors[index % chartColors.length],
            legendFontColor: theme.colors.textSecondary,
            legendFontSize: 12,
          };
        }).sort((a, b) => b.population - a.population);
  }, [transactions, currentDate, theme, chartType]);

  const changeMonth = (delta: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + delta);
    setCurrentDate(next);
  };

  useFocusEffect(
    React.useCallback(() => {
      showFAB();
      return () => {
         // optionally hide if leaving screen, but user wants it here.
      };
    }, [])
  );

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;
    
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      hideFAB();
    } else {
      showFAB();
    }
    lastScrollY.current = currentScrollY;
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
        <TouchableOpacity 
            style={styles.summaryItem}
            onPress={() => setShowCarryOn(!showCarryOn)}
        >
          <Typography variant="caption" color={theme.colors.textSecondary}>{showCarryOn ? 'Carry On' : 'Balance'}</Typography>
          <Typography variant="h4" color={theme.colors.primary}>
            {formatCurrency(showCarryOn ? carryOnStats.balance : monthlyStats.income - monthlyStats.expense)}
          </Typography>
        </TouchableOpacity>
      </View>

      <Card style={styles.chartCard} variant="flat">
          <View style={styles.chartHeader}>
            <Typography variant="h4">{chartType === 'expense' ? 'Spending' : 'Income'} by Category</Typography>
            <TouchableOpacity 
                style={styles.chartToggle}
                onPress={() => setChartType(chartType === 'expense' ? 'income' : 'expense')}
            >
                <Icon 
                    name={chartType === 'expense' ? 'PieChart' : 'BarChart3'} 
                    size={20} 
                    color={theme.colors.primary} 
                />
            </TouchableOpacity>
          </View>
          {categoryStats.length > 0 ? (
              <PieChart
                data={categoryStats}
                width={Dimensions.get('window').width - 64}
                height={200}
                chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
              />
          ) : (
              <View style={styles.emptyChart}>
                  <Typography color={theme.colors.textTertiary}>No data for this month</Typography>
              </View>
          )}
      </Card>

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense', 'transfer'] as const).map(t => (
          <TouchableOpacity 
            key={t} 
            style={[styles.filterChip, selectedType === t && styles.filterChipActive]}
            onPress={() => setSelectedType(t)}
          >
            <Typography variant="caption" color={selectedType === t ? (mode === 'dark' ? '#000' : '#fff') : theme.colors.textTertiary} style={{ fontWeight: '600' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Transactions" />
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} // Added bottom padding
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('TransactionForm', { transactionId: item.id })}
            onLongPress={() => handleDelete(item.id)}
          >
            <Card style={styles.transactionCard} variant="flat">
              <View style={styles.cardContent}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? theme.colors.success + '15' : theme.colors.error + '15' }]}>
                   {/* Updated Icons as requested: ArrowDownLeft for Income, ArrowUpRight for Expense */}
                  <Icon 
                    name={item.type === 'transfer' ? 'ArrowLeftRight' : item.type === 'income' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                    size={20} 
                    color={item.type === 'income' ? theme.colors.success : theme.colors.error} 
                  />
                </View>
                <View style={styles.txInfo}>
                   {/* Swapped Description and Category */}
                  <Typography variant="h4">{item.note || 'No Description'}</Typography>
                   <Typography variant="caption" color={theme.colors.textTertiary}>
                    {item.categories?.name || 'Uncategorized'} • {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Typography>
                </View>
                <Typography variant="h4" color={item.type === 'income' ? theme.colors.success : theme.colors.error}>
                  {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : ''}{formatCurrency(item.amount)}
                </Typography>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="No transactions for this period" />}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: { marginBottom: theme.spacing.xl },
  monthPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  summaryRow: { 
    flexDirection: 'row', 
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.borderRadius.xl, 
    padding: theme.spacing.md, 
    marginBottom: theme.spacing.lg,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryItem: { alignItems: 'center' },
  chartCard: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderRadius: 28,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
  },
  chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 8,
  },
  filterRow: { 
      flexDirection: 'row', 
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: theme.spacing.lg,
  },
  filterChip: { 
      paddingHorizontal: 16, 
      paddingVertical: 8, 
      borderRadius: 12, 
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 80,
      alignItems: 'center',
  },
  filterChipActive: { 
      backgroundColor: theme.colors.primary, 
      borderColor: theme.colors.primary,
  },
  chartToggle: {
      padding: 6,
      backgroundColor: theme.colors.surfaceHighlight + '40',
      borderRadius: 10,
  },
  emptyChart: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
  },
  transactionCard: { 
    marginBottom: theme.spacing.sm, 
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  txInfo: { flex: 1 }
});
