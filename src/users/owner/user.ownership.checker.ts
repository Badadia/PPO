import { Injectable } from '@nestjs/common';
import { ResourceOwnershipChecker } from '../roles/interface/resource.ownership.checker';

@Injectable()
export class UserOwnershipChecker
  implements ResourceOwnershipChecker<number, number>
{
  public checkOwnership(resourceId: number, userId: number): boolean {
    return resourceId == userId;
  }
}
