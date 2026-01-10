import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank';
  current_balance: string;
}

interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

export const TransactionFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const transactionId = (route.params as any)?.transactionId;

  // Form State
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadData();
    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId]);

  const loadData = async () => {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        apiService.accounts.getAll(),
        apiService.categories.getAll(),
      ]);
      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransaction = async () => {
    try {
      const response = await apiService.transactions.getOne(transactionId);
      const tx = response.data;
      
      setType(tx.type);
      setFromAccountId(tx.from_account_id || '');
      setToAccountId(tx.to_account_id || '');
      setCategoryId(tx.category_id);
      setAmount(tx.amount?.toString() || '');
      setNote(tx.note || '');
      setDate(tx.date || new Date().toISOString().split('T')[0]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction');
      navigation.goBack();
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (type === 'expense' || type === 'transfer') {
      if (!fromAccountId) newErrors.fromAccountId = 'Required';
    }
    if (type === 'income' || type === 'transfer') {
      if (!toAccountId) newErrors.toAccountId = 'Required';
    }
    if (type !== 'transfer' && !categoryId) newErrors.categoryId = 'Required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Invalid amount';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        type,
        fromAccountId: fromAccountId || undefined,
        toAccountId: toAccountId || undefined,
        categoryId: categoryId || '00000000-0000-0000-0000-000000000000', // Placeholder if transfer
        amount: parseFloat(amount),
        note: note || undefined,
        date,
      };

      if (transactionId) await apiService.transactions.update(transactionId, payload);
      else await apiService.transactions.create(payload);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getFilteredCategories = () => categories.filter(c => c.type === (type === 'transfer' ? 'expense' : type));
  const getSelectedCategory = () => categories.find(c => c.id === categoryId);

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Typography variant="h2">{transactionId ? 'Update' : 'New'} Transaction</Typography>
          </View>

          {/* Type Selector */}
          <View style={styles.typeSelector}>
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <TouchableOpacity 
                key={t}
                style={[
                  styles.typeTab, 
                  type === t && styles[`typeTabActive${t.charAt(0).toUpperCase() + t.slice(1)}` as keyof typeof styles]
                ]}
                onPress={() => setType(t)}
              >
                <Typography variant="button" color={type === t ? '#fff' : theme.colors.textSecondary}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <Card variant="flat" style={styles.amountCard}>
            <Typography variant="label" color={theme.colors.textSecondary}>Amount</Typography>
            <View style={styles.amountRow}>
              <Typography variant="h1" style={styles.currency}>₹</Typography>
              <Input
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                keyboardType="decimal-pad"
                style={styles.amountInput}
                autoFocus={!transactionId}
              />
            </View>
            {errors.amount && <Typography variant="caption" color={theme.colors.error}>{errors.amount}</Typography>}
          </Card>

          {/* Account Selection */}
          {(type === 'expense' || type === 'transfer') && (
            <View style={styles.section}>
              <Typography variant="label" style={styles.sectionLabel}>From Account</Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountList}>
                {accounts.map((acc) => (
                  <TouchableOpacity 
                    key={acc.id} 
                    onPress={() => setFromAccountId(acc.id)}
                    style={[styles.accountChip, fromAccountId === acc.id && styles.accountChipActive]}
                  >
                    <Icon name={acc.type === 'bank' ? 'Building2' : 'Coins'} size={14} color={fromAccountId === acc.id ? '#fff' : theme.colors.textSecondary} />
                    <Typography variant="bodySmall" style={{ marginLeft: 6 }} color={fromAccountId === acc.id ? '#fff' : theme.colors.text}>
                      {acc.name}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.fromAccountId && <Typography variant="caption" color={theme.colors.error}>{errors.fromAccountId}</Typography>}
            </View>
          )}

          {(type === 'income' || type === 'transfer') && (
            <View style={styles.section}>
              <Typography variant="label" style={styles.sectionLabel}>To Account</Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountList}>
                {accounts.map((acc) => (
                  <TouchableOpacity 
                    key={acc.id} 
                    onPress={() => setToAccountId(acc.id)}
                    style={[styles.accountChip, toAccountId === acc.id && styles.accountChipActiveTo]}
                  >
                    <Icon name={acc.type === 'bank' ? 'Building2' : 'Coins'} size={14} color={toAccountId === acc.id ? '#fff' : theme.colors.textSecondary} />
                    <Typography variant="bodySmall" style={{ marginLeft: 6 }} color={toAccountId === acc.id ? '#fff' : theme.colors.text}>
                      {acc.name}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.toAccountId && <Typography variant="caption" color={theme.colors.error}>{errors.toAccountId}</Typography>}
            </View>
          )}

          {/* Category Selection */}
          {type !== 'transfer' && (
            <View style={styles.section}>
              <Typography variant="label" style={styles.sectionLabel}>Category</Typography>
              <TouchableOpacity 
                style={[styles.selector, errors.categoryId && styles.selectorError]} 
                onPress={() => setCategoryModalVisible(true)}
              >
                <View style={styles.selectorContent}>
                  <Icon name="Tag" size={20} color={theme.colors.primary} />
                  <Typography style={{ marginLeft: 12 }}>
                    {getSelectedCategory() ? getSelectedCategory()?.name : 'Choose a category'}
                  </Typography>
                </View>
                <Icon name="ChevronRight" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Details */}
          <View style={styles.section}>
            <Input 
              label="Note" 
              value={note} 
              onChangeText={setNote} 
              placeholder="What was this for?" 
              multiline
            />
            <Input 
              label="Date" 
              value={date} 
              onChangeText={setDate} 
              placeholder="YYYY-MM-DD" 
            />
          </View>

          <Button 
            title={transactionId ? "Update" : "Save"} 
            onPress={handleSave} 
            loading={saving}
            style={styles.saveButton}
          />
          
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <Typography variant="h3">Select Category</Typography>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
              <Icon name="X" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={getFilteredCategories()}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => { setCategoryId(item.id); setCategoryModalVisible(false); }}
              >
                <Typography>{item.name}</Typography>
                {categoryId === item.id && <Icon name="Check" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: theme.spacing.lg }}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 4,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  typeTabActiveExpense: { backgroundColor: theme.colors.error },
  typeTabActiveIncome: { backgroundColor: theme.colors.success },
  typeTabActiveTransfer: { backgroundColor: theme.colors.primary },
  amountCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  currency: {
    fontSize: 32,
    marginRight: 8,
    color: theme.colors.textSecondary,
  },
  amountInput: {
    flex: 1,
    fontSize: 44,
    fontWeight: '700',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    marginBottom: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  accountList: {
    flexDirection: 'row',
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 10,
  },
  accountChipActive: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  accountChipActiveTo: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorError: {
    borderColor: theme.colors.error,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
    height: 56,
  },
  modalBg: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
});
