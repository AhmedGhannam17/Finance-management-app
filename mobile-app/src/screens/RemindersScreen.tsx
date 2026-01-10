// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   RefreshControl,
//   Share,
//   Alert,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { apiService } from '../services/api';
// import { Card } from '../components/Card';
// import { Typography } from '../components/Typography';
// import { Icon } from '../components/Icon';
// import { Button } from '../components/Button';
// import { LoadingSpinner } from '../components/LoadingSpinner';
// import { Skeleton } from '../components/Skeleton';
// import { theme } from '../theme';

// interface Reminder {
//   id: string;
//   type: 'quran' | 'hadith' | 'dua';
//   source: string;
//   text: string;
//   translation?: string;
// }

// type ReminderType = 'quran' | 'hadith' | 'dua' | 'all';

// export const RemindersScreen: React.FC = () => {
//   const [reminder, setReminder] = useState<Reminder | null>(null);
//   const [activeType, setActiveType] = useState<ReminderType>('all');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const loadRandomReminder = async (type?: ReminderType) => {
//     try {
//       const selectedType = type === 'all' ? undefined : type;
//       const response = await apiService.reminders.getRandom(selectedType);
//       setReminder(response.data);
//     } catch (error) {
//       console.error('Failed to load reminder:', error);
//       setReminder(null);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     loadRandomReminder(activeType);
//   }, [activeType]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadRandomReminder(activeType);
//   };

//   const handleShare = async () => {
//     if (!reminder) return;
//     try {
//       await Share.share({
//         message: `${reminder.text}\n\n${reminder.translation || ''}\n\n— ${reminder.source || reminder.type}`,
//       });
//     } catch (error) {
//       Alert.alert('Error', 'Could not share reminder');
//     }
//   };

//   if (loading && !refreshing) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={{ padding: theme.spacing.lg }}>
//           <Skeleton height={40} width={200} style={{ marginBottom: 20 }} />
//           <Skeleton height={50} borderRadius={12} style={{ marginBottom: 20 }} />
//           <Skeleton height={300} borderRadius={24} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//         <ScrollView 
//             contentContainerStyle={styles.scrollContent}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
//         >
//             <Typography variant="h2" style={{ marginBottom: theme.spacing.lg }}>Daily Remembrance</Typography>

//             {/* Filter Tabs */}
//             <View style={styles.tabs}>
//                 {(['all', 'quran', 'hadith', 'dua'] as ReminderType[]).map((type) => (
//                     <TouchableOpacity 
//                         key={type}
//                         onPress={() => { setActiveType(type); setLoading(true); }}
//                         style={[styles.tab, activeType === type && styles.tabActive]}
//                     >
//                         <Typography 
//                             variant="caption" 
//                             color={activeType === type ? theme.colors.primary : theme.colors.textSecondary}
//                             style={{ textTransform: 'capitalize' }}
//                         >
//                             {type}
//                         </Typography>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             {reminder ? (
//                 <View>
//                     <Card style={styles.reminderCard} variant="elevated">
//                         <View style={styles.cardHeader}>
//                             <View style={styles.badge}>
//                                 <Typography variant="label" color={theme.colors.primary}>{reminder.type}</Typography>
//                             </View>
//                             {reminder.source && (
//                                 <Typography variant="caption" color={theme.colors.textTertiary}>{reminder.source}</Typography>
//                             )}
//                         </View>

//                         <View style={styles.content}>
//                             <Typography variant="h3" align="right" style={styles.arabicText}>
//                                 {reminder.text}
//                             </Typography>
                            
//                             {reminder.translation && (
//                                 <View style={styles.translationContainer}>
//                                     <View style={styles.quoteLine} />
//                                     <Typography variant="body" style={styles.translationText}>
//                                         {reminder.translation}
//                                     </Typography>
//                                 </View>
//                             )}
//                         </View>

//                         <View style={styles.actions}>
//                             <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
//                                 <Icon name="Share2" size={20} color={theme.colors.textSecondary} />
//                             </TouchableOpacity>
//                             <TouchableOpacity style={styles.actionBtn}>
//                                 <Icon name="Copy" size={20} color={theme.colors.textSecondary} />
//                             </TouchableOpacity>
//                         </View>
//                     </Card>

//                     <Button 
//                         title="Give Me Another" 
//                         variant="secondary" 
//                         onPress={onRefresh} 
//                         style={styles.refreshBtn}
//                         leftIcon={<Icon name="RefreshCw" size={18} color={theme.colors.text} />}
//                     />
//                 </View>
//             ) : (
//                 <Card variant="outlined" style={styles.emptyCard}>
//                     <Icon name="SearchX" size={48} color={theme.colors.textTertiary} />
//                     <Typography variant="body" style={{ marginTop: 16 }}>No reminders found for this category.</Typography>
//                     <Button title="Reset Filters" onPress={() => setActiveType('all')} style={{ marginTop: 16 }} variant="outline" />
//                 </Card>
//             )}

//             {/* Quote of the day footer */}
//             <View style={styles.footer}>
//                 <Icon name="Leaf" size={24} color={theme.colors.accent} />
//                 <Typography variant="caption" align="center" style={{ marginTop: 8, maxWidth: '80%' }}>
//                     "The best of people are those that are most useful to people." — Hadith
//                 </Typography>
//             </View>
//         </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   scrollContent: {
//     padding: theme.spacing.lg,
//     paddingBottom: 40,
//   },
//   tabs: {
//     flexDirection: 'row',
//     gap: theme.spacing.xs,
//     marginBottom: theme.spacing.xl,
//     backgroundColor: theme.colors.surfaceHighlight,
//     padding: 4,
//     borderRadius: theme.borderRadius.md,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: theme.borderRadius.sm,
//   },
//   tabActive: {
//     backgroundColor: theme.colors.surface,
//     ...theme.shadows.sm,
//   },
//   reminderCard: {
//     padding: theme.spacing.xl,
//     minHeight: 300,
//     justifyContent: 'center',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: theme.spacing.lg,
//   },
//   badge: {
//     backgroundColor: theme.colors.primary + '15',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 99,
//   },
//   content: {
//     marginVertical: theme.spacing.md,
//   },
//   arabicText: {
//     fontSize: 26,
//     lineHeight: 48,
//     fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif',
//     marginBottom: theme.spacing.xl,
//   },
//   translationContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   quoteLine: {
//     width: 3,
//     backgroundColor: theme.colors.accent,
//     height: '100%',
//     marginRight: 16,
//     borderRadius: 2,
//   },
//   translationText: {
//     flex: 1,
//     fontStyle: 'italic',
//     color: theme.colors.textSecondary,
//     lineHeight: 24,
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: theme.spacing.xl,
//     gap: theme.spacing.md,
//   },
//   actionBtn: {
//     padding: 8,
//     backgroundColor: theme.colors.surfaceHighlight,
//     borderRadius: 12,
//   },
//   refreshBtn: {
//     marginTop: theme.spacing.lg,
//   },
//   emptyCard: {
//     padding: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   footer: {
//     marginTop: 60,
//     alignItems: 'center',
//     opacity: 0.6,
//   }
// });
