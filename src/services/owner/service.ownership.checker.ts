import { Injectable } from '@nestjs/common';
import { ResourceOwnershipChecker } from 'src/users/roles/interface/resource.ownership.checker';
import { ServicesService } from '../services.service';

@Injectable()
export class ServiceOwnershipChecker
  implements ResourceOwnershipChecker<number, number>
{
  constructor(private readonly servicesService: ServicesService) {}

  public async checkOwnership(
    serviceId: number,
    userId: number,
  ): Promise<boolean> {
    return await this.servicesService.checkOwnership(serviceId, userId);
  }
}
