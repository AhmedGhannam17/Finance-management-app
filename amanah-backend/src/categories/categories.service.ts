import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

/**
 * CategoriesService handles expense and income categories
 * Categories are user-specific and fully manageable
 */
@Injectable()
export class CategoriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all categories for the current user
   */
  async findAll(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch categories');
    }

    return data;
  }

  /**
   * Get categories by type (expense or income)
   */
  async findByType(userId: string, type: 'expense' | 'income') {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch categories');
    }

    return data;
  }

  /**
   * Get a single category by ID
   */
  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }

  /**
   * Create a new category
   */
  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .insert({
        user_id: userId,
        name: createCategoryDto.name,
        type: createCategoryDto.type,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create category');
    }

    return data;
  }

  /**
   * Update an existing category
   */
  async update(userId: string, id: string, updateCategoryDto: UpdateCategoryDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .update({
        name: updateCategoryDto.name,
        type: updateCategoryDto.type,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Category not found or update failed');
    }

    return data;
  }

  /**
   * Delete a category
   * Note: Should check if category has transactions before deleting
   */
  async remove(userId: string, id: string) {
    // Check if category has transactions
    const { data: transactions } = await this.supabaseService
      .getClient()
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', id)
      .limit(1);

    if (transactions && transactions.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing transactions',
      );
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException('Category not found or delete failed');
    }

    return { message: 'Category deleted successfully' };
  }

  /**
   * Create default categories for a new user
   */
  async createDefaultCategories(userId: string) {
    const defaults = [
      { name: 'Salary', type: 'income' },
      { name: 'Business', type: 'income' },
      { name: 'Gift', type: 'income' },
      { name: 'Bonus', type: 'income' },
      { name: 'Food', type: 'expense' },
      { name: 'Transport', type: 'expense' },
      { name: 'Rent', type: 'expense' },
      { name: 'Education', type: 'expense' },
      { name: 'Health', type: 'expense' },
      { name: 'Shopping', type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
      { name: 'Utilities', type: 'expense' },
      { name: 'Investment', type: 'expense' },
      { name: 'Other', type: 'expense' },
    ];

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('categories')
      .insert(defaults.map(cat => ({ ...cat, user_id: userId })));

    if (error) {
      console.error('Failed to create default categories:', error);
      // We don't throw here to avoid blocking signup
    }

    return data;
  }
}

