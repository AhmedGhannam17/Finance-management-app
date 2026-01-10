import { Global, Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './services/supabase.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthModule } from '../auth/auth.module';

/**
 * CommonModule is a global module that provides shared services
 */
@Global()
@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule)],
  providers: [SupabaseService, AuthGuard],
  exports: [SupabaseService, AuthGuard],
})
export class CommonModule {}
