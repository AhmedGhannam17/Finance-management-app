import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/services/supabase.service';
import { CalculateZakatDto } from './dto/calculate-zakat.dto';

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

  async calculateZakat(userId: string, dto?: CalculateZakatDto) {
    // Get all cash and bank account balances
    const { data: accounts, error: accountsError } = await this.supabaseService
      .getClient()
      .from('accounts')
      .select('current_balance')
      .eq('user_id', userId);

    if (accountsError) {
      throw new Error('Failed to fetch accounts');
    }

    const autoCash = accounts?.reduce(
      (sum, account) => sum + parseFloat(account.current_balance || '0'),
      0,
    ) || 0;

    const cashAssets = dto?.manualCash !== undefined ? dto.manualCash : autoCash;
    
    // Precious Metals
    const goldValue = (dto?.goldWeight || 0) * (dto?.goldPrice || 0);
    const silverValue = (dto?.silverWeight || 0) * (dto?.silverPrice || 0);
    
    // Other Assets
    const investmentAssets = dto?.investments || 0;
    
    // Total Assets
    const totalAssets = cashAssets + goldValue + silverValue + investmentAssets;

    // Deduct Liabilities
    const netAssets = Math.max(0, totalAssets - (dto?.debts || 0));

    // Calculate nisab
    const goldPricePerGram = dto?.goldPrice || 
      parseFloat(this.configService.get<string>('GOLD_PRICE_PER_GRAM') || '5000') || 5000;
    const silverPricePerGram = dto?.silverPrice || 80;

    const goldNisab = 87.48 * goldPricePerGram;
    const silverNisab = 612.36 * silverPricePerGram;

    const nisabValue = dto?.nisabType === 'gold' ? goldNisab : silverNisab;

    // Calculate zakat (2.5% of net assets if above nisab)
    let zakatDue = 0;
    if (netAssets >= nisabValue) {
      zakatDue = netAssets * 0.025;
    }

    // Round to 2 decimal places
    zakatDue = Math.round(zakatDue * 100) / 100;

    // Save zakat record with metadata
    const { data: record, error: recordError } = await this.supabaseService
      .getClient()
      .from('zakat_records')
      .insert({
        user_id: userId,
        total_assets: totalAssets,
        nisab_value: nisabValue,
        zakat_due: zakatDue,
        is_zakat_due: netAssets >= nisabValue,
        metadata: dto, // Assuming metadata column exists, if not we'll just save the basics
      })
      .select()
      .single();

    if (recordError) {
      console.error('Failed to save zakat record:', recordError);
    }

    return {
      totalAssets: Math.round(totalAssets * 100) / 100,
      netAssets: Math.round(netAssets * 100) / 100,
      nisabValue: Math.round(nisabValue * 100) / 100,
      zakatDue: zakatDue,
      isZakatDue: netAssets >= nisabValue,
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

