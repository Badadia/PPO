import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { ComplaintType } from './complaintType.enum';
import { Point } from 'geojson';

export class ComplaintDto {
  @IsNotEmpty()
  @IsEnum(ComplaintType)
  setor: ComplaintType;

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
