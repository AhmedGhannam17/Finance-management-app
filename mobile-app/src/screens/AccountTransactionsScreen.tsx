import React, { useState, useEffect } from 'react';
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
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { theme } from '../theme';
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
  const { accountId, accountName } = (route.params as any) || {};

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="ArrowLeft" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ marginLeft: 16 }}>{accountName}</Typography>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isIncome = item.to_account_id === accountId && item.type !== 'transfer';
          const isExpense = item.from_account_id === accountId && item.type !== 'transfer';
          const isTransferOut = item.type === 'transfer' && item.from_account_id === accountId;
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
        ListEmptyComponent={<EmptyState message="No transactions yet" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  list: { padding: theme.spacing.lg },
  card: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md }
});
