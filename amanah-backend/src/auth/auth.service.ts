import { Injectable, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/services/supabase.service';
import { CategoriesService } from '../categories/categories.service';

/**
 * AuthService - Dead-simple authentication
 * No external dependencies (like jsonwebtoken). 
 * Tokens are just the User IDs for simplicity as requested.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async signUp(username: string, password: string, name?: string) {
    const db = this.supabaseService.getAdminClient();

    // Check if username already exists
    const { data: existing, error: checkError } = await db
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[AuthService] DB check error:', checkError);
      throw new BadRequestException('Database error: ' + checkError.message);
    }

    if (existing) {
      throw new BadRequestException('Username already taken');
    }

    // Create user
    console.log('[AuthService] Attempting to create user:', username);
    const { data: user, error } = await db
      .from('users')
      .insert({
        username,
        password, // Plain text as requested
        name: name || username,
      })
      .select()
      .single();

    if (error) {
      console.error('[AuthService] User creation failed:', error);
      throw new BadRequestException('Failed to create user: ' + error.message);
    }

    // Create default categories
    try {
      console.log('[AuthService] Seeding categories for:', user.id);
      await this.categoriesService.createDefaultCategories(user.id);
    } catch (err) {
      console.warn('[AuthService] Category seeding failed (non-blocking):', err);
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
      token: user.id, // Use ID as token for maximum simplicity
    };
  }

  /**
   * Sign in an existing user
   */
  async signIn(username: string, password: string) {
    const db = this.supabaseService.getAdminClient();

    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
      token: user.id,
    };
  }

  async signOut() {
    return { message: 'Signed out successfully' };
  }

  /**
   * Verify token (token is just the userId in this simple system)
   */
  verifyToken(token: string): string {
    if (!token) throw new UnauthorizedException('Invalid token');
    return token; // The token is the ID
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const db = this.supabaseService.getAdminClient();
    const { data: user, error } = await db
      .from('users')
      .select('id, username, name, currency')
      .eq('id', userId)
      .single();
    
    if (error || !user) return null;
    return user;
  }
}
