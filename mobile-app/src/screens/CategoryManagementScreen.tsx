import React, { useState, useCallback } from 'react';
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
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

export const CategoryManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const loadCategories = async () => {
    try {
      const response = await apiService.categories.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This will not delete transactions using this category.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await apiService.categories.delete(category.id);
              loadCategories();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard} variant="flat">
      <View style={styles.cardContent}>
        <View style={[
          styles.iconBox, 
          { backgroundColor: item.type === 'income' ? theme.colors.success + '15' : theme.colors.error + '15' }
        ]}>
          <Icon 
            name={item.type === 'income' ? 'TrendingUp' : 'TrendingDown'} 
            size={20} 
            color={item.type === 'income' ? theme.colors.success : theme.colors.error} 
          />
        </View>
        <View style={styles.info}>
          <Typography variant="h4">{item.name}</Typography>
          <Typography variant="caption" color={theme.colors.textSecondary}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Typography>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('CategoryForm', { categoryId: item.id })}
            style={styles.actionBtn}
          >
            <Icon name="Edit2" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item)}
            style={styles.actionBtn}
          >
            <Icon name="Trash2" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Typography variant="h2">Categories</Typography>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CategoryForm', { categoryId: null })}
          style={styles.addBtn}
        >
          <Icon name="Plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCategories(); }} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={<EmptyState message="No categories found. Add your first category!" />}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backBtn: {
    padding: 4,
  },
  addBtn: {
    padding: 4,
  },
  list: {
    padding: theme.spacing.lg,
  },
  categoryCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
});
