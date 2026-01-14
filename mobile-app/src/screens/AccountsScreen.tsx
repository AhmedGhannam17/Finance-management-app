import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform, Alert } from 'react-native';
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
import { useTheme } from '../context/ThemeContext';
import { useFAB } from '../context/FABContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { formatCurrency } from '../utils/analytics';

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank';
  current_balance: string;
  initial_balance: string;
  currency: string;
}

export const AccountsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showFAB, hideFAB } = useFAB();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState({ total: 0, income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastScrollY = React.useRef(0);

  const loadData = async () => {
    try {
      const [accountsRes, netWorthRes, transactionsRes] = await Promise.all([
        apiService.accounts.getAll(),
        apiService.zakat.getNetWorth(),
        apiService.transactions.getAll(),
      ]);
      
      setAccounts(accountsRes.data);
      
      let lifetimeIncome = 0;
      let lifetimeExpense = 0;
      
      if (transactionsRes.data) {
        lifetimeIncome = transactionsRes.data
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
          
        lifetimeExpense = transactionsRes.data
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      }

      if (netWorthRes.data) {
        setSummary({
          total: netWorthRes.data.netWorth,
          income: lifetimeIncome,
          expense: lifetimeExpense,
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
      // Removed showFAB() as user wants to remove FAB from accounts page
      return () => hideFAB();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleScroll = (event: any) => {
      // Removed FAB logic
  };

  // Removed useEffect for navigation.setOptions as header is hidden

  const handleAccountAction = (account: Account) => {
    Alert.alert(
      account.name,
      'Choose an action',
      [
        { text: 'Edit', onPress: () => navigation.navigate('AccountForm', { accountId: account.id }) },
        { text: 'Delete', onPress: () => confirmDelete(account.id, account.name), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${name}"? This will delete all associated transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              await apiService.accounts.delete(id);
              loadData();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
          style: 'destructive' 
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <Card style={styles.totalCard} variant="elevated">
          <Typography variant="label" color={theme.colors.textSecondary} align="center" style={{ marginBottom: 4 }}>Total Balance</Typography>
          <Typography variant="h1" align="center" style={styles.totalBalance} color={theme.colors.text}>
            {formatCurrency(summary.total)}
          </Typography>
          
          <View style={styles.statsDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                <Icon name="ArrowDownLeft" size={16} color={theme.colors.success} />
              </View>
              <View>
                <Typography variant="caption" color={theme.colors.textSecondary}>Income so far</Typography>
                <Typography variant="h4" color={theme.colors.success}>{formatCurrency(summary.income)}</Typography>
              </View>
            </View>
            
            <View style={styles.verticalDivider} />

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '15' }]}>
                <Icon name="ArrowUpRight" size={16} color={theme.colors.error} />
              </View>
              <View>
                <Typography variant="caption" color={theme.colors.textSecondary}>Expense so far</Typography>
                <Typography variant="h4" color={theme.colors.error}>{formatCurrency(summary.expense)}</Typography>
              </View>
            </View>
          </View>
      </Card>
      
      <View style={styles.listHeader}>
          <Typography variant="h3">My Accounts</Typography>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader 
        title="Accounts" 
        rightIcon="Plus" 
        onRightPress={() => navigation.navigate('AccountForm', { accountId: null })}
      />
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View style={styles.listFooter}>
            <TouchableOpacity 
                style={styles.addAccountBtn}
                onPress={() => navigation.navigate('AccountForm', { accountId: null })}
                activeOpacity={0.9}
            >
                <Icon name="Plus" size={24} color="#fff" />
                <Typography variant="h4" color="#fff" style={{ marginLeft: 8 }}>Add Account</Typography>
            </TouchableOpacity>
          </View>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => navigation.navigate('AccountTransactions', { accountId: item.id, accountName: item.name })}
            activeOpacity={0.7}
          >
            <Card style={styles.accountCard} padding="none">
              <View style={styles.accountCardMain}>
                <View style={[styles.typeIcon, { backgroundColor: item.type === 'bank' ? theme.colors.primary + '20' : theme.colors.accent + '20' }]}>
                  <Icon 
                    name={item.type === 'bank' ? 'Building2' : 'Coins'} 
                    size={22} 
                    color={item.type === 'bank' ? theme.colors.primary : theme.colors.accent} 
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Typography variant="h4" color={theme.colors.text}>{item.name}</Typography>
                  <Typography variant="caption" color={theme.colors.textTertiary}>
                    {item.type === 'bank' ? 'Bank Account' : 'Cash Wallet'}
                  </Typography>
                </View>
                <TouchableOpacity 
                  onPress={() => handleAccountAction(item)}
                  style={styles.moreBtn}
                >
                  <Icon name="MoreVertical" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.accountCardFooter}>
                <View style={styles.balanceItem}>
                  <Typography variant="caption" color={theme.colors.textTertiary}>Initial</Typography>
                  <Typography variant="bodySmall" color={theme.colors.textSecondary}>
                    {formatCurrency(item.initial_balance)}
                  </Typography>
                </View>
                <View style={[styles.balanceItem, { alignItems: 'flex-end' }]}>
                  <Typography variant="caption" color={theme.colors.textTertiary}>Current Balance</Typography>
                  <Typography variant="h3" color={theme.colors.text}>
                    {formatCurrency(item.current_balance)}
                  </Typography>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ marginTop: 40 }}>
            <EmptyState
              message="No accounts yet"
              subMessage="Add your bank accounts or cash wallets to start tracking your finances."
              icon="Wallet"
              actionLabel="Add First Account"
              onAction={() => navigation.navigate('AccountForm', { accountId: null })}
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  summaryContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  totalCard: {
      width: '100%',
      padding: theme.spacing.xl,
      borderRadius: 24,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: theme.spacing.lg,
  },
  statsDivider: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  statItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  verticalDivider: {
      width: 1,
      height: '100%',
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  listHeader: {
      width: '100%',
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
  },
  cardWrapper: {
    marginBottom: theme.spacing.md,
  },
  accountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  accountCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  moreBtn: {
    padding: 8,
  },
  accountCardFooter: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  balanceItem: {
    flex: 1,
  },
  listFooter: {
      padding: theme.spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? 100 : 80, 
  },
  addAccountBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: theme.borderRadius.full,
      width: '100%',
      ...theme.shadows.md,
  },
});
