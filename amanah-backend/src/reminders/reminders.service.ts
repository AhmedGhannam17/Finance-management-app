import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';

/**
 * RemindersService provides read-only access to Islamic reminders
 * Reminders are curated content (Quran, Hadith, Dua)
 * Users can only read, not modify
 */
@Injectable()
export class RemindersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all reminders
   */
  async findAll(type?: 'quran' | 'hadith' | 'dua') {
    let query = this.supabaseService
      .getClient()
      .from('reminders')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException('Failed to fetch reminders');
    }

    return data;
  }

  /**
   * Get a single reminder by ID
   */
  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('reminders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new BadRequestException('Reminder not found');
    }

    return data;
  }

  /**
   * Get a random reminder
   */
  async findRandom(type?: 'quran' | 'hadith' | 'dua') {
    let query = this.supabaseService
      .getClient()
      .from('reminders')
      .select('*');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException('Failed to fetch reminders');
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Return a random reminder
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }
}

