import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ComplaintType } from './complaintType.enum';
import { Point } from 'geojson';
export class CreateComplaintDto {
  @IsNotEmpty()
  @IsEnum(ComplaintType)
  tipo: ComplaintType;

  @IsNotEmpty()
  @IsString()
  endereco: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsObject()
  location: Point;
}
