import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';

/**
 * ProfilesService handles user profile operations
 */
@Injectable()
export class ProfilesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get the current user's profile
   */
  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Profile not found');
    }

    return data;
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(userId: string, updates: { name?: string; currency?: string }) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new NotFoundException('Profile not found or update failed');
    }

    return data;
  }
}

