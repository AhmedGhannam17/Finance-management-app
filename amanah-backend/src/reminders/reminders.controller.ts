import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('reminders')
@UseGuards(AuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  async findAll(@Query('type') type?: 'quran' | 'hadith' | 'dua') {
    return this.remindersService.findAll(type);
  }

  @Get('random')
  async findRandom(@Query('type') type?: 'quran' | 'hadith' | 'dua') {
    return this.remindersService.findRandom(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.remindersService.findOne(id);
  }
}

