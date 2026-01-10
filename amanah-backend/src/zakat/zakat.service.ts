import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/services/supabase.service';

/**
 * ZakatService calculates zakat based on user's assets
 * Uses gold-based nisab calculation (87.48 grams of gold)
 * Applies 2.5% rate with a safe-side bias
 */
@Injectable()
export class ZakatService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Calculate zakat for the current user
   * Includes: cash, bank balances, and stock values
   * Uses gold-based nisab (87.48 grams)
   */
  async calculateZakat(userId: string) {
    // Get all cash and bank account balances
    const { data: accounts, error: accountsError } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('current_balance')
      .eq('user_id', userId);

    if (accountsError) {
      throw new Error('Failed to fetch accounts');
    }

    const totalCashAndBank = accounts?.reduce(
      (sum, account) => sum + parseFloat(account.current_balance || '0'),
      0,
    ) || 0;

    // Calculate total assets
    const totalAssets = totalCashAndBank;

    // Calculate nisab (87.48 grams of gold)
    // Get gold price from config or use default
    const goldPricePerGram =
      parseFloat(this.configService.get<string>('GOLD_PRICE_PER_GRAM') || '5000') || 5000;
    const nisabValue = 87.48 * goldPricePerGram;

    // Calculate zakat (2.5% of total assets if above nisab)
    // Add 1% buffer for safe-side calculation
    let zakatDue = 0;
    if (totalAssets >= nisabValue) {
      zakatDue = totalAssets * 0.025;
      // Add 1% buffer for safe-side calculation
      zakatDue = zakatDue * 1.01;
    }

    // Round to 2 decimal places
    zakatDue = Math.round(zakatDue * 100) / 100;

    // Save zakat record
    const { data: record, error: recordError } = await this.supabaseService
      .getClient()
      .from('zakat_records')
      .insert({
        user_id: userId,
        total_assets: totalAssets,
        nisab_value: nisabValue,
        zakat_due: zakatDue,
        is_zakat_due: totalAssets >= nisabValue,
      })
      .select()
      .single();

    if (recordError) {
      console.error('Failed to save zakat record:', recordError);
    }

    return {
      totalAssets: Math.round(totalAssets * 100) / 100,
      totalCashAndBank: Math.round(totalCashAndBank * 100) / 100,
      nisabValue: Math.round(nisabValue * 100) / 100,
      zakatDue: zakatDue,
      isZakatDue: totalAssets >= nisabValue,
      record: record || null,
    };
  }

  /**
   * Get zakat calculation history for the current user
   */
  async getZakatHistory(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('zakat_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch zakat history');
    }

    return data;
  }

  /**
   * Get net worth for the current user
   * Net worth = cash + bank balances + stock values
   */
  async getNetWorth(userId: string) {
    // Get all cash and bank account balances
    const { data: accounts, error: accountsError } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('current_balance, type')
      .eq('user_id', userId);

    if (accountsError) {
      throw new Error('Failed to fetch accounts');
    }

    const totalCash = accounts?.reduce((sum, account) => {
      if (account.type === 'cash') {
        return sum + parseFloat(account.current_balance || '0');
      }
      return sum;
    }, 0) || 0;

    const totalBank = accounts?.reduce((sum, account) => {
      if (account.type === 'bank') {
        return sum + parseFloat(account.current_balance || '0');
      }
      return sum;
    }, 0) || 0;

    const netWorth = totalCash + totalBank;

    return {
      netWorth: Math.round(netWorth * 100) / 100,
      totalCash: Math.round(totalCash * 100) / 100,
      totalBank: Math.round(totalBank * 100) / 100,
    };
  }
}

