import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateStockDto, UpdateStockDto } from './dto/stock.dto';

@Controller('stocks')
@UseGuards(AuthGuard)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  async findAll(@CurrentUser() userId: string) {
    return this.stocksService.findAll(userId);
  }

  @Get(':id')
  async findOne(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.stocksService.findOne(userId, id);
  }

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() createStockDto: CreateStockDto,
  ) {
    return this.stocksService.create(userId, createStockDto);
  }

  @Put(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.stocksService.update(userId, id, updateStockDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.stocksService.remove(userId, id);
  }
}

