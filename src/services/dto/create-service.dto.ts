import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ServiceType } from './serviceType.enum';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsEnum(ServiceType)
  tipo: ServiceType;

  @IsNotEmpty()
  @IsString()
  endereco: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsString()
  location: string;
}
