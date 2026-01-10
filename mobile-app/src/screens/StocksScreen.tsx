// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   RefreshControl,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../types/navigation';
// import { apiService } from '../services/api';
// import { Card } from '../components/Card';
// import { LoadingSpinner } from '../components/LoadingSpinner';
// import { EmptyState } from '../components/EmptyState';
// import { theme } from '../theme';

// interface Stock {
//   id: string;
//   name: string;
//   value: string;
//   notes?: string;
// }

// export const StocksScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const [stocks, setStocks] = useState<Stock[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const loadStocks = async () => {
//     try {
//       const response = await apiService.stocks.getAll();
//       setStocks(response.data);
//     } catch (error) {
//       console.error('Failed to load stocks:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       loadStocks();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadStocks();
//   };

//   const handleDelete = (id: string, name: string) => {
//     Alert.alert(
//       'Delete Stock',
//       `Are you sure you want to delete "${name}"?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await apiService.stocks.delete(id);
//               loadStocks();
//             } catch (error: any) {
//               Alert.alert(
//                 'Error',
//                 error.response?.data?.message || 'Failed to delete stock'
//               );
//             }
//           },
//         },
//       ]
//     );
//   };

//   const formatCurrency = (amount: string | number) => {
//     const num = typeof amount === 'string' ? parseFloat(amount) : amount;
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2,
//     }).format(num);
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() =>
//             navigation.navigate('StockForm', { stockId: null })
//           }
//         >
//           <Text style={styles.addButtonText}>+ Add Stock</Text>
//         </TouchableOpacity>
//       </View>

//       {stocks.length === 0 ? (
//         <EmptyState
//           message="No stocks yet"
//           actionLabel="Add your first stock"
//           onAction={() =>
//             navigation.navigate('StockForm', { stockId: null })
//           }
//         />
//       ) : (
//         <FlatList
//           data={stocks}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <Card style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <View style={styles.stockInfo}>
//                   <Text style={styles.stockName}>{item.name}</Text>
//                   {item.notes && (
//                     <Text style={styles.stockNotes}>{item.notes}</Text>
//                   )}
//                 </View>
//                 <Text style={styles.stockValue}>
//                   {formatCurrency(item.value)}
//                 </Text>
//               </View>
//               <View style={styles.cardActions}>
//                 <TouchableOpacity
//                   onPress={() =>
//                     navigation.navigate('StockForm', {
//                       stockId: item.id,
//                     })
//                   }
//                 >
//                   <Text style={styles.actionText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => handleDelete(item.id, item.name)}
//                 >
//                   <Text style={[styles.actionText, styles.deleteText]}>
//                     Delete
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </Card>
//           )}
//           contentContainerStyle={styles.list}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   header: {
//     padding: theme.spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: theme.colors.border,
//   },
//   addButton: {
//     backgroundColor: theme.colors.primary,
//     padding: theme.spacing.md,
//     borderRadius: theme.borderRadius.md,
//     alignItems: 'center',
//   },
//   addButtonText: {
//     ...theme.typography.button,
//     color: '#ffffff',
//   },
//   list: {
//     padding: theme.spacing.md,
//   },
//   card: {
//     marginBottom: theme.spacing.md,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: theme.spacing.md,
//   },
//   stockInfo: {
//     flex: 1,
//     marginRight: theme.spacing.md,
//   },
//   stockName: {
//     ...theme.typography.h3,
//     color: theme.colors.text,
//     marginBottom: theme.spacing.xs,
//   },
//   stockNotes: {
//     ...theme.typography.bodySmall,
//     color: theme.colors.textSecondary,
//   },
//   stockValue: {
//     ...theme.typography.h3,
//     color: theme.colors.text,
//   },
//   cardActions: {
//     flexDirection: 'row',
//     gap: theme.spacing.lg,
//     paddingTop: theme.spacing.md,
//     borderTopWidth: 1,
//     borderTopColor: theme.colors.divider,
//   },
//   actionText: {
//     ...theme.typography.body,
//     color: theme.colors.primary,
//   },
//   deleteText: {
//     color: theme.colors.error,
//   },
// });

