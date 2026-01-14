import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CalculateZakatDto {
  @IsNumber()
  @IsOptional()
  goldPrice?: number;

  @IsNumber()
  @IsOptional()
  silverPrice?: number;

  @IsString()
  @IsOptional()
  nisabType?: 'gold' | 'silver';

  @IsNumber()
  @IsOptional()
  manualCash?: number;

  @IsNumber()
  @IsOptional()
  goldWeight?: number;

  @IsNumber()
  @IsOptional()
  silverWeight?: number;

  @IsNumber()
  @IsOptional()
  investments?: number;

  @IsNumber()
  @IsOptional()
  debts?: number;
}
