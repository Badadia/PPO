import { Injectable } from '@nestjs/common';
import { ResourceOwnershipChecker } from 'src/users/roles/interface/resource.ownership.checker';
import { ComplaintsService } from '../complaints.service';

@Injectable()
export class ComplaintOwnershipChecker
  implements ResourceOwnershipChecker<number, number>
{
  constructor(private readonly complaintService: ComplaintsService) {}

  public async checkOwnership(
    serviceId: number,
    userId: number,
  ): Promise<boolean> {
    return await this.complaintService.checkOwnership(serviceId, userId);
  }
}
