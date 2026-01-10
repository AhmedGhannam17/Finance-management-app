import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';

/**
 * TransactionsService handles all financial transactions
 * Transactions automatically update account balances via database triggers
 * Income increases balance, expenses decrease balance
 */
@Injectable()
export class TransactionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all transactions for the current user
   */
  async findAll(userId: string, filters?: { startDate?: string; endDate?: string; categoryId?: string }) {
    let query = this.supabaseService
      .getClient()
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException('Failed to fetch transactions');
    }

    return data;
  }

  /**
   * Get a single transaction by ID
   */
  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('transactions')
      .select('*, categories(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Transaction not found');
    }

    return data;
  }

  /**
   * Create a new transaction
   * Manually updates account balances for consistency
   */
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { type, fromAccountId, toAccountId, amount, categoryId, note, date } = createTransactionDto;

    // Validate accounts
    if (type === 'expense' || type === 'transfer') {
      if (!fromAccountId) throw new BadRequestException('Source account is required');
      await this.validateAccount(userId, fromAccountId);
    }
    if (type === 'income' || type === 'transfer') {
      if (!toAccountId) throw new BadRequestException('Target account is required');
      await this.validateAccount(userId, toAccountId);
    }

    // Validate category
    await this.validateCategory(userId, categoryId);

    // Ensure amount is positive
    if (amount <= 0) {
      throw new BadRequestException('Transaction amount must be positive');
    }

    // 1. Insert transaction
    const { data: transaction, error: txError } = await this.supabaseService
      .getClient()
      .from('transactions')
      .insert({
        user_id: userId,
        type,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        category_id: categoryId,
        amount,
        note,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select('*, categories(*)')
      .single();

    if (txError) {
      throw new BadRequestException('Failed to create transaction');
    }

    // 2. Update balances
    if (type === 'expense' || type === 'transfer') {
      await this.updateAccountBalance(userId, fromAccountId, -amount);
    }
    if (type === 'income' || type === 'transfer') {
      await this.updateAccountBalance(userId, toAccountId, amount);
    }

    return transaction;
  }

  /**
   * Update an existing transaction
   * Adjusts balances based on the difference
   */
  async update(userId: string, id: string, updateTransactionDto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);

    // For simplicity, we'll revert the old transaction's impact and then apply the new one
    // Revert old
    if (existing.type === 'expense' || existing.type === 'transfer') {
      await this.updateAccountBalance(userId, existing.from_account_id, existing.amount);
    }
    if (existing.type === 'income' || existing.type === 'transfer') {
      await this.updateAccountBalance(userId, existing.to_account_id, -existing.amount);
    }

    // Prepare update data
    const updateData: any = {};
    if (updateTransactionDto.type) updateData.type = updateTransactionDto.type;
    if (updateTransactionDto.fromAccountId !== undefined) updateData.from_account_id = updateTransactionDto.fromAccountId;
    if (updateTransactionDto.toAccountId !== undefined) updateData.to_account_id = updateTransactionDto.toAccountId;
    if (updateTransactionDto.categoryId) updateData.category_id = updateTransactionDto.categoryId;
    if (updateTransactionDto.amount !== undefined) updateData.amount = updateTransactionDto.amount;
    if (updateTransactionDto.note !== undefined) updateData.note = updateTransactionDto.note;
    if (updateTransactionDto.date) updateData.date = updateTransactionDto.date;

    // Apply update
    const { data: updated, error: updateError } = await this.supabaseService
      .getClient()
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, categories(*)')
      .single();

    if (updateError || !updated) {
      // Rollback balances if update fails? (Actually difficult without real transactions)
      throw new BadRequestException('Failed to update transaction');
    }

    // Apply new impact
    if (updated.type === 'expense' || updated.type === 'transfer') {
      await this.updateAccountBalance(userId, updated.from_account_id, -updated.amount);
    }
    if (updated.type === 'income' || updated.type === 'transfer') {
      await this.updateAccountBalance(userId, updated.to_account_id, updated.amount);
    }

    return updated;
  }

  /**
   * Delete a transaction
   * Reverts balance impacts
   */
  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    // Revert impact
    if (existing.type === 'expense' || existing.type === 'transfer') {
      await this.updateAccountBalance(userId, existing.from_account_id, existing.amount);
    }
    if (existing.type === 'income' || existing.type === 'transfer') {
      await this.updateAccountBalance(userId, existing.to_account_id, -existing.amount);
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException('Failed to delete transaction');
    }

    return { message: 'Transaction deleted successfully' };
  }

  private async validateAccount(userId: string, accountId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }
  }

  private async updateAccountBalance(userId: string, accountId: string, amountDiff: number) {
    // We use a raw increment if possible, or fetch and update
    // Supabase supports .rpc() for safer increments, but here we fetch/update for logic clarity
    const { data: account, error: fetchError } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('current_balance')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !account) throw new NotFoundException('Account not found for balance update');

    const { error: updateError } = await this.supabaseService
      .getClient()
      .from('accounts')
      .update({ current_balance: Number(account.current_balance) + amountDiff })
      .eq('id', accountId)
      .eq('user_id', userId);

    if (updateError) throw new BadRequestException('Failed to update account balance');
  }

  /**
   * Validate that a category exists and belongs to the user
   */
  private async validateCategory(userId: string, categoryId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }
}

