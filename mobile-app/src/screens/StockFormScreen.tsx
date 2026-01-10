// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { apiService } from '../services/api';
// import { Button } from '../components/Button';
// import { Input } from '../components/Input';
// import { LoadingSpinner } from '../components/LoadingSpinner';
// import { theme } from '../theme';

// export const StockFormScreen: React.FC = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const stockId = (route.params as any)?.stockId;

//   const [name, setName] = useState('');
//   const [value, setValue] = useState('');
//   const [notes, setNotes] = useState('');
//   const [loading, setLoading] = useState(!!stockId);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState<{
//     name?: string;
//     value?: string;
//   }>({});

//   useEffect(() => {
//     if (stockId) {
//       loadStock();
//     }
//   }, [stockId]);

//   const loadStock = async () => {
//     try {
//       const response = await apiService.stocks.getOne(stockId);
//       setName(response.data.name);
//       setValue(response.data.value?.toString() || '0');
//       setNotes(response.data.notes || '');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load stock');
//       navigation.goBack();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validate = () => {
//     const newErrors: { name?: string; value?: string } = {};
//     if (!name.trim()) {
//       newErrors.name = 'Name is required';
//     }
//     if (!value || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
//       newErrors.value = 'Value must be a positive number';
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSave = async () => {
//     if (!validate()) return;

//     setSaving(true);
//     try {
//       if (stockId) {
//         await apiService.stocks.update(stockId, {
//           name,
//           value: parseFloat(value),
//           notes: notes || undefined,
//         });
//       } else {
//         await apiService.stocks.create({
//           name,
//           value: parseFloat(value),
//           notes: notes || undefined,
//         });
//       }
//       navigation.goBack();
//     } catch (error: any) {
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to save stock'
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         <ScrollView
//           contentContainerStyle={styles.content}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Input
//             label="Stock Name"
//             value={name}
//             onChangeText={setName}
//             placeholder="e.g., Apple Inc."
//             error={errors.name}
//           />

//           <Input
//             label="Current Value"
//             value={value}
//             onChangeText={setValue}
//             placeholder="0.00"
//             keyboardType="decimal-pad"
//             error={errors.value}
//           />

//           <Input
//             label="Notes (Optional)"
//             value={notes}
//             onChangeText={setNotes}
//             placeholder="Additional notes"
//             multiline
//             numberOfLines={4}
//           />

//           <Button
//             title={stockId ? 'Update Stock' : 'Create Stock'}
//             onPress={handleSave}
//             loading={saving}
//             style={styles.button}
//           />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   content: {
//     padding: theme.spacing.md,
//   },
//   button: {
//     marginTop: theme.spacing.md,
//   },
// });

