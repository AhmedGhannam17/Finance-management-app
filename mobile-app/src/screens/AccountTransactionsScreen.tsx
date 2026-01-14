import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/analytics';

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

export const AccountTransactionsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { accountId, accountName } = (route.params as any) || {};

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadTransactions = async () => {
    try {
      const response = await apiService.transactions.getAll();
      const accountTransactions = response.data.filter(
        (tx: any) => tx.from_account_id === accountId || tx.to_account_id === accountId
      );
      setTransactions(accountTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [accountId])
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentDate]);

  const changeMonth = (delta: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + delta);
    setCurrentDate(next);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader title={accountName} showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
          <Icon name="ChevronLeft" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setCurrentDate(new Date())}
          style={styles.monthLabel}
        >
          <Typography variant="h4">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
          <Icon name="ChevronRight" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isIncome = item.to_account_id === accountId && item.type !== 'transfer';
          const isTransferIn = item.type === 'transfer' && item.to_account_id === accountId;

          return (
            <Card style={styles.card} variant="flat">
               <View style={styles.txRow}>
                  <View style={[styles.iconBox, { backgroundColor: (isIncome || isTransferIn) ? theme.colors.success + '15' : theme.colors.error + '15' }]}>
                     <Icon 
                        name={item.type === 'transfer' ? 'ArrowLeftRight' : (isIncome ? 'ArrowDownLeft' : 'ArrowUpRight')} 
                        size={18} 
                        color={(isIncome || isTransferIn) ? theme.colors.success : theme.colors.error} 
                     />
                  </View>
                  <View style={{ flex: 1 }}>
                     <Typography variant="h4">{item.note || item.categories?.name || 'Transfer'}</Typography>
                     <Typography variant="caption" color={theme.colors.textTertiary}>
                        {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                     </Typography>
                  </View>
                  <Typography variant="h4" color={(isIncome || isTransferIn) ? theme.colors.success : theme.colors.error}>
                     {(isIncome || isTransferIn) ? '+' : '-'}{formatCurrency(item.amount)}
                  </Typography>
               </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={{ marginTop: 60 }}>
            <EmptyState 
              message="No transactions found" 
              subMessage={`You don't have any transactions for ${currentDate.toLocaleDateString('default', { month: 'long' })}.`}
              icon="History"
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border 
  },
  backBtn: { padding: 4 },
  headerTitle: { marginLeft: 12 },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceHighlight + '20',
  },
  monthBtn: { padding: 8 },
  monthLabel: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20 },
  list: { padding: theme.spacing.lg },
  card: { 
    marginBottom: theme.spacing.md, 
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: theme.spacing.md 
  }
});
