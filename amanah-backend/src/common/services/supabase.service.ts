import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseService provides a singleton Supabase client
 * Used throughout the application for database operations
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>(
      'SUPABASE_ANON_KEY',
    );
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Regular client for user operations (respects RLS)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client for operations that bypass RLS (if needed)
    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  /**
   * Get the regular Supabase client (respects RLS)
   * Use this for most operations
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get the admin Supabase client (bypasses RLS)
   * Use with caution, only when necessary
   */
  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error('Admin client not configured');
    }
    return this.supabaseAdmin;
  }

  /**
   * Get a client with a specific user's JWT token
   * Useful for operations that need to run as a specific user
   */
  getClientWithToken(token: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>(
      'SUPABASE_ANON_KEY',
    );
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
}

