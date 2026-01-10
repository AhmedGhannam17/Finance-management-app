import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { theme } from '../theme';

interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const loadCategories = async () => {
    try {
      const response = await apiService.categories.getAll(type);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [type])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Category', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await apiService.categories.delete(id);
        loadCategories();
      }},
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Categories</Typography>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('CategoryForm', { categoryId: null })}
        >
          <Icon name="Plus" color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, type === 'expense' && styles.tabActive]}
          onPress={() => setType('expense')}
        >
          <Typography variant="button" color={type === 'expense' ? '#fff' : theme.colors.textSecondary}>Expense</Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, type === 'income' && styles.tabActive]}
          onPress={() => setType('income')}
        >
          <Typography variant="button" color={type === 'income' ? '#fff' : theme.colors.textSecondary}>Income</Typography>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('CategoryForm', { categoryId: item.id })}
            onLongPress={() => handleDelete(item.id, item.name)}
          >
            <Card style={styles.catCard} variant="outlined">
              <View style={styles.cardInner}>
                <View style={styles.iconBox}>
                  <Icon name="Tag" size={18} color={theme.colors.primary} />
                </View>
                <Typography variant="h4" style={{ flex: 1 }}>{item.name}</Typography>
                <Icon name="ChevronRight" size={20} color={theme.colors.textTertiary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message={`No ${type} categories yet`} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary + '10', alignItems: 'center', justifyContent: 'center' },
  tabContainer: { flexDirection: 'row', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg, backgroundColor: theme.colors.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: theme.colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: theme.colors.primary },
  list: { padding: theme.spacing.lg },
  catCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  cardInner: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary + '08', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md }
});
