import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ComplaintType } from './complaintType.enum';
export class CreateComplaintDto {
  @IsNotEmpty()
  @IsEnum(ComplaintType)
  setor: ComplaintType;

  @IsNotEmpty()
  @IsString()
  endereco: string;

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
