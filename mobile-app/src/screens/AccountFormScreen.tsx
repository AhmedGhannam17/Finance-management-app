import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Icon } from '../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Typography } from '../components/Typography';
import { useTheme } from '../context/ThemeContext';
export const AccountFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const accountId = (route.params as any)?.accountId;

  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank'>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(!!accountId);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    initialBalance?: string;
  }>({});

  useEffect(() => {
    if (accountId) {
      loadAccount();
    }
  }, [accountId]);

  const loadAccount = async () => {
    try {
      const response = await apiService.accounts.getOne(accountId);
      setName(response.data.name);
      setType(response.data.type);
      setInitialBalance(response.data.initial_balance?.toString() || '0');
      setCurrency(response.data.currency || 'INR');
    } catch (error) {
      Alert.alert('Error', 'Failed to load account');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { name?: string; initialBalance?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (initialBalance && isNaN(parseFloat(initialBalance))) {
      newErrors.initialBalance = 'Balance must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        name,
        type,
        initialBalance: initialBalance ? parseFloat(initialBalance) : 0,
        currency,
      };

      if (accountId) {
        await apiService.accounts.update(accountId, data);
      } else {
        await apiService.accounts.create(data);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save account'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="ArrowLeft" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Typography variant="h3" style={styles.headerTitle}>
            {accountId ? 'Edit Account' : 'New Account'}
          </Typography>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Account Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Main Bank Account"
            error={errors.name}
          />

          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionLabel}>Account Type</Typography>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                onPress={() => setType('cash')}
                style={[
                  styles.typeOption,
                  type === 'cash' && styles.typeOptionActive,
                  { borderColor: type === 'cash' ? theme.colors.primary : theme.colors.border }
                ]}
              >
                <Icon 
                  name="Coins" 
                  size={24} 
                  color={type === 'cash' ? theme.colors.primary : theme.colors.textTertiary} 
                />
                <Typography 
                  variant="bodySmall" 
                  style={{ marginTop: 8 }}
                  color={type === 'cash' ? theme.colors.primary : theme.colors.textSecondary}
                >
                  Cash
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('bank')}
                style={[
                  styles.typeOption,
                  type === 'bank' && styles.typeOptionActive,
                  { borderColor: type === 'bank' ? theme.colors.primary : theme.colors.border }
                ]}
              >
                <Icon 
                  name="Building2" 
                  size={24} 
                  color={type === 'bank' ? theme.colors.primary : theme.colors.textTertiary} 
                />
                <Typography 
                  variant="bodySmall" 
                  style={{ marginTop: 8 }}
                  color={type === 'bank' ? theme.colors.primary : theme.colors.textSecondary}
                >
                  Bank
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="Initial Balance"
            value={initialBalance}
            onChangeText={setInitialBalance}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.initialBalance}
            helperText="This is the balance you're starting with."
          />

          <View style={styles.section}>
             <Typography variant="h4" style={styles.sectionLabel}>Currency</Typography>
             <View style={styles.currencyBox}>
                <Typography variant="body">{currency}</Typography>
                <View style={styles.badge}>
                  <Typography variant="caption" color={theme.colors.primary}>Default</Typography>
                </View>
             </View>
          </View>

          <Button
            title={accountId ? 'Save Changes' : 'Create Account'}
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    marginLeft: theme.spacing.md,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    marginBottom: theme.spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeOption: {
    flex: 1,
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  currencyBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    borderRadius: 16,
    height: 56,
  },
});
