import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ComplaintType } from './complaintType.enum';
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
  @IsString()
  location: string;
}
