import { Controller, Get, Inject } from '@nestjs/common';
import { SupabaseService } from './common/services/supabase.service';

@Controller('health')
export class HealthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async ping() {
    console.log('[Health] Ping received, checking DB...');
    const { error } = await this.supabaseService.getAdminClient()
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('[Health] DB Check failed:', error);
      return { 
        status: 'error', 
        message: 'Backend OK, but Database Check FAILED',
        db_error: error.message,
        db_code: error.code
      };
    }

    return { 
      status: 'ok', 
      message: 'Amanah Backend is reachable and Database is CONNECTED!' 
    };
  }
}
