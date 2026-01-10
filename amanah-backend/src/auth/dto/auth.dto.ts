import { IsString, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class SignInDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
