import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class Dto {
  @IsNotEmpty()
  @IsString()
  readonly nome: string;

  @IsNotEmpty()
  @IsNumber()
  telefone: number;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  senha: string;
}

export class UserQueryDto {
  @IsOptional()
  owner: any;
}
