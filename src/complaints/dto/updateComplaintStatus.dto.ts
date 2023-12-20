import { IsEnum } from 'class-validator';
import { ComplaintStatus } from './complaintStatus.enum';

export class UpdateComplaintStatusDto {
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;
}
