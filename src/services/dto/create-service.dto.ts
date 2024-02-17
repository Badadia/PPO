import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  isString,
} from 'class-validator';
import { ServiceType } from './serviceType.enum';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsEnum(ServiceType)
  tipo: ServiceType;

  @IsNotEmpty()
  @IsString()
  endereco: string;

  @IsString()
  complemento: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsString()
  latitude: string;

  @IsNotEmpty()
  @IsString()
  longitude: string;
}
