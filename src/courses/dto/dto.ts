import { IsString } from 'class-validator';

export class Dto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly descricao: string;

  @IsString({ each: true })
  readonly tags: string[];
}
