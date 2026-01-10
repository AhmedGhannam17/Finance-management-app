import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank';
  current_balance: string;
  currency: string;
}

export const AccountsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState({ total: 0, income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [accountsRes, netWorthRes] = await Promise.all([
        apiService.accounts.getAll(),
        apiService.zakat.getNetWorth(),
      ]);
      
      setAccounts(accountsRes.data);
      if (netWorthRes.data) {
        setSummary({
          total: netWorthRes.data.netWorth,
          income: 0, // Need to implement income/expense summary API or calculate here
          expense: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load accounts data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (amount: number | string, currency = 'INR') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(num);
  };

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <Typography variant="label" color={theme.colors.textSecondary} align="center">Total Balance</Typography>
      <Typography variant="h1" align="center" style={styles.totalBalance}>
        {formatCurrency(summary.total)}
      </Typography>
      
      <View style={styles.statsRow}>
        <Card style={styles.statCard} variant="flat">
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '15' }]}>
            <Icon name="ArrowDownLeft" size={20} color={theme.colors.success} />
          </View>
          <View>
            <Typography variant="caption" color={theme.colors.textSecondary}>Income</Typography>
            <Typography variant="h4" color={theme.colors.success}>{formatCurrency(summary.income)}</Typography>
          </View>
        </Card>
        
        <View style={{ width: theme.spacing.md }} />

        <Card style={styles.statCard} variant="flat">
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '15' }]}>
            <Icon name="ArrowUpRight" size={20} color={theme.colors.error} />
          </View>
          <View>
            <Typography variant="caption" color={theme.colors.textSecondary}>Expense</Typography>
            <Typography variant="h4" color={theme.colors.error}>{formatCurrency(summary.expense)}</Typography>
          </View>
        </Card>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 100 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => navigation.navigate('AccountTransactions' as any, { accountId: item.id, accountName: item.name })}
          >
            <Card style={styles.accountCard} variant="outlined">
              <View style={styles.accountCardHeader}>
                <View style={[styles.typeIcon, { backgroundColor: item.type === 'bank' ? theme.colors.primary + '15' : theme.colors.warning + '15' }]}>
                  <Icon 
                    name={item.type === 'bank' ? 'Building2' : 'Coins'} 
                    size={24} 
                    color={item.type === 'bank' ? theme.colors.primary : theme.colors.warning} 
                  />
                </View>
                <TouchableOpacity onPress={() => {}}>
                  <Icon name="MoreVertical" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.accountCardBody}>
                <Typography variant="h4">{item.name}</Typography>
                <Typography variant="h3" style={styles.accountBalance}>
                  {formatCurrency(item.current_balance, item.currency)}
                </Typography>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            message="No accounts yet. Start by adding one!"
            actionLabel="Add Account"
            onAction={() => navigation.navigate('AccountForm', { accountId: null })}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  summaryContainer: {
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  totalBalance: {
    fontSize: 40,
    fontWeight: '700',
    marginVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
  },
  accountCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  accountCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCardBody: {
    marginTop: theme.spacing.sm,
  },
  accountBalance: {
    marginTop: theme.spacing.xs,
    fontWeight: '600',
  },
});
