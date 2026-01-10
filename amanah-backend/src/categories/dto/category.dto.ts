import { IsString, IsEnum } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsEnum(['expense', 'income'])
  type: 'expense' | 'income';
}

export class UpdateCategoryDto {
  @IsString()
  name: string;

  @IsEnum(['expense', 'income'])
  type: 'expense' | 'income';
}

