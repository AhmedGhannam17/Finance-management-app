import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';
import { CreateStockDto, UpdateStockDto } from './dto/stock.dto';

/**
 * StocksService handles manual stock holdings
 * All stock values are manually entered (no API integration)
 */
@Injectable()
export class StocksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all stocks for the current user
   */
  async findAll(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stocks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to fetch stocks');
    }

    return data;
  }

  /**
   * Get a single stock by ID
   */
  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stocks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Stock not found');
    }

    return data;
  }

  /**
   * Create a new stock holding
   */
  async create(userId: string, createStockDto: CreateStockDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stocks')
      .insert({
        user_id: userId,
        name: createStockDto.name,
        value: createStockDto.value,
        notes: createStockDto.notes,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create stock');
    }

    return data;
  }

  /**
   * Update an existing stock
   */
  async update(userId: string, id: string, updateStockDto: UpdateStockDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stocks')
      .update({
        name: updateStockDto.name,
        value: updateStockDto.value,
        notes: updateStockDto.notes,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Stock not found or update failed');
    }

    return data;
  }

  /**
   * Delete a stock holding
   */
  async remove(userId: string, id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('stocks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException('Stock not found or delete failed');
    }

    return { message: 'Stock deleted successfully' };
  }
}

