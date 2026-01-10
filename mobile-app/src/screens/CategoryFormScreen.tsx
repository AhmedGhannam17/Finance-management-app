import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { theme } from '../theme';

export const CategoryFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const categoryId = (route.params as any)?.categoryId;

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [loading, setLoading] = useState(!!categoryId);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      const response = await apiService.categories.getOne(categoryId);
      setName(response.data.name);
      setType(response.data.type);
    } catch (error) {
      Alert.alert('Error', 'Failed to load category');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      if (categoryId) {
        await apiService.categories.update(categoryId, {
          name,
          type,
        });
      } else {
        await apiService.categories.create({
          name,
          type,
        });
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save category'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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
          <Input
            label="Category Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Groceries"
            error={errors.name}
          />

          <View style={styles.typeContainer}>
            <Text style={styles.label}>Category Type</Text>
            <View style={styles.typeButtons}>
              <Button
                title="Expense"
                onPress={() => setType('expense')}
                variant={type === 'expense' ? 'primary' : 'outline'}
                style={styles.typeButton}
              />
              <Button
                title="Income"
                onPress={() => setType('income')}
                variant={type === 'income' ? 'primary' : 'outline'}
                style={styles.typeButton}
              />
            </View>
          </View>

          <Button
            title={categoryId ? 'Update Category' : 'Create Category'}
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
    padding: theme.spacing.md,
  },
  typeContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});

