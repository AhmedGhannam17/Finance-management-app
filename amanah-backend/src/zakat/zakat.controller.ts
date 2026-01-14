import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CalculateZakatDto } from './dto/calculate-zakat.dto';

@Controller('zakat')
@UseGuards(AuthGuard)
export class ZakatController {
  constructor(private readonly zakatService: ZakatService) {}

  @Post('calculate')
  async calculateZakat(@CurrentUser() userId: string, @Body() dto: CalculateZakatDto) {
    return this.zakatService.calculateZakat(userId, dto);
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

