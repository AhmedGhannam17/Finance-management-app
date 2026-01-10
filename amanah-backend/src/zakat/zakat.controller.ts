import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('zakat')
@UseGuards(AuthGuard)
export class ZakatController {
  constructor(private readonly zakatService: ZakatService) {}

  @Get('calculate')
  async calculateZakat(@CurrentUser() userId: string) {
    return this.zakatService.calculateZakat(userId);
  }

  @Get('history')
  async getZakatHistory(@CurrentUser() userId: string) {
    return this.zakatService.getZakatHistory(userId);
  }

  @Get('net-worth')
  async getNetWorth(@CurrentUser() userId: string) {
    return this.zakatService.getNetWorth(userId);
  }
}

