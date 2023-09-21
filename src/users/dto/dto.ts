import { IsNumber, IsString } from 'class-validator';

export class Dto {
  @IsString()
  readonly nome: string;

  @IsNumber()
  telefone: number;

  @IsString()
  email: string;

  @IsString()
  senha: string;
}
