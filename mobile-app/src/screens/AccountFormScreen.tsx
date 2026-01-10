import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Typography } from '../components/Typography';
import { theme } from '../theme';

export const AccountFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Typography variant="h2" style={styles.title}>
            {accountId ? 'Edit Account' : 'New Account'}
          </Typography>

          <Input
            label="Account Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Main Bank Account"
            error={errors.name}
          />

          <View style={styles.section}>
            <Typography variant="label" style={styles.label}>Account Type</Typography>
            <View style={styles.typeButtons}>
              <Button
                title="Cash"
                onPress={() => setType('cash')}
                variant={type === 'cash' ? 'primary' : 'outline'}
                style={styles.typeButton}
              />
              <Button
                title="Bank"
                onPress={() => setType('bank')}
                variant={type === 'bank' ? 'primary' : 'outline'}
                style={styles.typeButton}
              />
            </View>
          </View>

          <Input
            label="Initial Balance"
            value={initialBalance}
            onChangeText={setInitialBalance}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.initialBalance}
            helperText="Changing this will adjust the current balance accordingly."
          />

          <View style={styles.section}>
             <Typography variant="label" style={styles.label}>Currency</Typography>
             <View style={styles.currencyBox}>
                <Typography variant="body">{currency}</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>Default</Typography>
             </View>
          </View>

          <Button
            title={accountId ? 'Save Changes' : 'Create Account'}
            onPress={handleSave}
            loading={saving}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
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
  button: {
    marginTop: theme.spacing.xl,
  },
});
