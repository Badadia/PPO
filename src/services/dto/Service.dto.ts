import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { ServiceType } from './serviceType.enum';
import { Point } from 'geojson';

export class ServiceDto {
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
  @IsObject()
  location: Point;
}
