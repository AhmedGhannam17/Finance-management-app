// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   RefreshControl,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { useAuth } from '../context/AuthContext';
// import { Card } from '../components/Card';
// import { LoadingSpinner } from '../components/LoadingSpinner';
// import { Typography } from '../components/Typography';
// import { Icon } from '../components/Icon';
// import { AllocationChart } from '../components/charts/AllocationChart';
// import { Skeleton } from '../components/Skeleton';
// import { apiService } from '../services/api';
// import { theme } from '../theme';
// import { aggregateBalanceByType, getMonthlyStats, formatCurrency } from '../utils/analytics';

// const { width } = Dimensions.get('window');

// interface NetWorth {
//   netWorth: number;
//   totalCash: number;
//   totalBank: number;
//   totalStocks: number;
// }

// export const WalletScreen: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const { signOut } = useAuth();
  
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [netWorth, setNetWorth] = useState<NetWorth | null>(null);
//   const [allocationData, setAllocationData] = useState<any[]>([]);
//   const [monthlyStats, setMonthlyStats] = useState({ income: 0, expense: 0 });

//   const loadData = async () => {
//     try {
//       const [nwRes, accRes, stockRes, txRes] = await Promise.all([
//         apiService.zakat.getNetWorth(),
//         apiService.accounts.getAll(),
//         apiService.stocks.getAll(),
//         apiService.transactions.getAll(),
//       ]);

//       setNetWorth(nwRes.data);
//       setAllocationData(aggregateBalanceByType(accRes.data, stockRes.data));
//       setMonthlyStats(getMonthlyStats(txRes.data));
//     } catch (error) {
//       console.error('Failed to load wallet data:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.scrollContent}>
//           <Skeleton height={40} width={150} style={{ marginBottom: 20 }} />
//           <Skeleton height={160} borderRadius={24} style={{ marginBottom: 20 }} />
//           <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
//             <Skeleton height={100} style={{ flex: 1 }} borderRadius={16} />
//             <Skeleton height={100} style={{ flex: 1 }} borderRadius={16} />
//           </View>
//           <Skeleton height={200} borderRadius={16} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
//         }
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View>
//             <Typography variant="bodySmall">Welcome back,</Typography>
//             <Typography variant="h2">Amanah Wallet</Typography>
//           </View>
//           <TouchableOpacity onPress={signOut} style={styles.profileButton}>
//             <Icon name="LogOut" size={20} color={theme.colors.error} />
//           </TouchableOpacity>
//         </View>

//         {/* Hero Card */}
//         <Card style={styles.heroCard} variant="elevated">
//           <Typography variant="label" color="rgba(255,255,255,0.7)">Total Net Worth</Typography>
//           <Typography variant="h1" color="#ffffff" style={styles.netWorthText}>
//             {netWorth ? formatCurrency(netWorth.netWorth) : '₹0'}
//           </Typography>
//           <View style={styles.heroStats}>
//             <View style={styles.heroStatItem}>
//               <Icon name="TrendingUp" size={16} color="#ffffff" />
//               <Typography variant="caption" color="#ffffff" style={{ marginLeft: 4 }}>
//                 Monthly Growth: +2.4%
//               </Typography>
//             </View>
//           </View>
//         </Card>

//         {/* Monthly Summary */}
//         <View style={styles.summaryRow}>
//           <TouchableOpacity 
//             style={styles.summaryCardWrapper}
//             onPress={() => navigation.navigate('Transactions', { filterType: 'income' })}
//           >
//             <Card style={styles.summaryCard} variant="outlined">
//               <View style={styles.summaryIconContainer}>
//                 <Icon name="ArrowDownLeft" size={20} color={theme.colors.success} />
//               </View>
//               <Typography variant="caption" color={theme.colors.textSecondary}>Income</Typography>
//               <Typography variant="h4" color={theme.colors.success}>
//                 {formatCurrency(monthlyStats.income)}
//               </Typography>
//             </Card>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.summaryCardWrapper}
//             onPress={() => navigation.navigate('Transactions', { filterType: 'expense' })}
//           >
//             <Card style={styles.summaryCard} variant="outlined">
//               <View style={[styles.summaryIconContainer, { backgroundColor: theme.colors.expense + '10' }]}>
//                 <Icon name="ArrowUpRight" size={20} color={theme.colors.expense} />
//               </View>
//               <Typography variant="caption" color={theme.colors.textSecondary}>Expense</Typography>
//               <Typography variant="h4" color={theme.colors.expense}>
//                 {formatCurrency(monthlyStats.expense)}
//               </Typography>
//             </Card>
//           </TouchableOpacity>
//         </View>

//         {/* Chart Section */}
//         <Card variant="flat" style={styles.chartCard} padding="sm">
//           <AllocationChart data={allocationData} title="Asset Allocation" />
//         </Card>

//         {/* Quick Actions */}
//         <Typography variant="h3" style={styles.sectionTitle}>Main Actions</Typography>
//         <View style={styles.actionGrid}>
//           <ActionItem 
//             icon="Plus" 
//             label="Add New" 
//             onPress={() => navigation.navigate('TransactionForm', { transactionId: null })} 
//             color={theme.colors.primary}
//             isLarge
//           />
//           <ActionItem 
//             icon="Wallet" 
//             label="Accounts" 
//             onPress={() => navigation.navigate('Accounts')} 
//             color={theme.colors.accent}
//           />
//           <ActionItem 
//             icon="Tag" 
//             label="Categories" 
//             onPress={() => navigation.navigate('Categories')} 
//             color="#8b5cf6" 
//           />
//           <ActionItem 
//             icon="Heart" 
//             label="Zakat" 
//             onPress={() => navigation.navigate('Zakat')} 
//             color="#ec4899"
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const ActionItem = ({ icon, label, onPress, color, isLarge }: any) => (
//   <TouchableOpacity style={styles.actionItem} onPress={onPress}>
//     <View style={[
//       styles.actionIcon, 
//       { backgroundColor: color + '15' },
//       isLarge && styles.actionIconLarge
//     ]}>
//       <Icon name={icon} size={isLarge ? 28 : 24} color={color} strokeWidth={isLarge ? 2.5 : 2} />
//     </View>
//     <Typography variant="caption" align="center" style={isLarge && { fontWeight: '700' }}>{label}</Typography>
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   scrollContent: {
//     padding: theme.spacing.lg,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: theme.spacing.xl,
//   },
//   profileButton: {
//     padding: theme.spacing.sm,
//     backgroundColor: theme.colors.surface,
//     borderRadius: theme.borderRadius.full,
//     ...theme.shadows.sm,
//   },
//   heroCard: {
//     backgroundColor: theme.colors.primary,
//     padding: theme.spacing.xl,
//     borderRadius: theme.borderRadius.xl,
//     marginBottom: theme.spacing.lg,
//   },
//   netWorthText: {
//     fontSize: 34,
//     marginVertical: theme.spacing.xs,
//   },
//   heroStats: {
//     flexDirection: 'row',
//     marginTop: theme.spacing.sm,
//   },
//   heroStatItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     gap: theme.spacing.md,
//     marginBottom: theme.spacing.lg,
//   },
//   summaryCardWrapper: {
//     flex: 1,
//   },
//   summaryCard: {
//     padding: theme.spacing.md,
//     backgroundColor: theme.colors.surface,
//     height: '100%',
//   },
//   summaryIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: theme.colors.success + '10',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: theme.spacing.sm,
//   },
//   chartCard: {
//     marginBottom: theme.spacing.lg,
//   },
//   sectionTitle: {
//     marginBottom: theme.spacing.md,
//   },
//   actionGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: theme.spacing.xl,
//   },
//   actionItem: {
//     width: (width - theme.spacing.lg * 2 - theme.spacing.md * 3) / 4,
//     alignItems: 'center',
//   },
//   actionIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: theme.spacing.xs,
//   },
//   actionIconLarge: {
//     width: 60,
//     height: 60,
//     borderRadius: 20,
//     ...theme.shadows.md,
//     backgroundColor: theme.colors.primary + '20',
//   },
// });
