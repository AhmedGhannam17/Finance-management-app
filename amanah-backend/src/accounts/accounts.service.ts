import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

/**
 * AccountsService handles cash and bank account operations
 * Accounts can be of type 'cash' or 'bank'
 */
@Injectable()
export class AccountsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all accounts for the current user
   */
  async findAll(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch accounts');
    }

    return data;
  }

  /**
   * Get a single account by ID
   */
  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Account not found');
    }

    return data;
  }

  /**
   * Create a new account
   */
  async create(userId: string, createAccountDto: CreateAccountDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('accounts')
      .insert({
        user_id: userId,
        name: createAccountDto.name,
        type: createAccountDto.type,
        initial_balance: createAccountDto.initialBalance,
        current_balance: createAccountDto.initialBalance, // Initially same
        currency: createAccountDto.currency || 'INR',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create account');
    }

    return data;
  }

  /**
   * Update an existing account
   * Note: Balance updates should be done through transactions
   */
  async update(userId: string, id: string, updateAccountDto: UpdateAccountDto) {
    const updateData: any = {
      name: updateAccountDto.name,
      type: updateAccountDto.type,
      currency: updateAccountDto.currency,
    };

    if (updateAccountDto.initialBalance !== undefined) {
      // If initial balance is changed, we need to adjust current balance too
      const existing = await this.findOne(userId, id);
      const diff = updateAccountDto.initialBalance - existing.initial_balance;
      updateData.initial_balance = updateAccountDto.initialBalance;
      updateData.current_balance = existing.current_balance + diff;
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('accounts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Account not found or update failed');
    }

    return data;
  }

  /**
   * Delete an account
   * Note: Should check if account has transactions before deleting
   */
  async remove(userId: string, id: string) {
    // Check if account has transactions
    const { data: transactions } = await this.supabaseService
      .getClient()
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .or(`from_account_id.eq.${id},to_account_id.eq.${id}`)
      .limit(1);

    if (transactions && transactions.length > 0) {
      throw new BadRequestException(
        'Cannot delete account with existing transactions',
      );
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException('Account not found or delete failed');
    }

    return { message: 'Account deleted successfully' };
  }
}

