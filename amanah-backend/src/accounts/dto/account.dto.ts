import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsEnum(['cash', 'bank'])
  type: 'cash' | 'bank';

  @IsNumber()
  initialBalance: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['cash', 'bank'])
  type?: 'cash' | 'bank';

  @IsOptional()
  @IsNumber()
  initialBalance?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

