import { IsEnum } from 'class-validator';
import { ServiceStatus } from './serviceStatus.enum';

export class UpdateServiceStatusDto {
  @IsEnum(ServiceStatus)
  status: ServiceStatus;
}
