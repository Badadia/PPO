import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Type,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';
import { ResourceOwnershipChecker } from './interface/resource.ownership.checker';
import { OWNER_CHECKER } from './decorator/ownership.checker.decorator';
import {
  NoOwnershipCheckerException,
  NoResourceToCheckException,
} from './exception/ownership.checker.exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}

  matchRoles(roles: string[], userRole: string) {
    return roles.some((role) => role === userRole);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.getRolesMetadata(context);
    if (!roles || roles.length === 0) {
      return true;
    }
    const ownershipMetadata = this.getOwnershipMetadata(context);
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const hasSomeRole = this.matchRoles(roles, user.role);
    if (!hasSomeRole && roles.includes(Role.Owner)) {
      const resourceId = request.params?.id ? request.params?.id : null;
      if (!resourceId && request.method === 'GET') {
        this.fillOwnershipQueryParam(user, request);
        return true;
      }
      return await this.checkOwnership(resourceId, user.id, ownershipMetadata);
    }
    return hasSomeRole;
  }

  private getRolesMetadata(context: ExecutionContext): Role[] {
    return this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private getOwnershipMetadata(
    context: ExecutionContext,
  ): ResourceOwnershipChecker | Type<ResourceOwnershipChecker> {
    return this.reflector.getAllAndOverride<
      ResourceOwnershipChecker | Type<ResourceOwnershipChecker>
    >(OWNER_CHECKER, [context.getHandler(), context.getClass()]);
  }

  private async checkOwnership(
    resourceId: any,
    userId: any,
    ownershipMetadata:
      | ResourceOwnershipChecker
      | Type<ResourceOwnershipChecker>,
  ): Promise<boolean> {
    if (!ownershipMetadata) {
      throw new NoOwnershipCheckerException();
    }

    if (!resourceId) {
      throw new NoResourceToCheckException();
    }
    let ownershipChecker: ResourceOwnershipChecker = null;
    if (typeof ownershipMetadata === 'object') {
      ownershipChecker = ownershipMetadata;
    } else {
      ownershipChecker = this.moduleRef.get(
        ownershipMetadata as Type<ResourceOwnershipChecker>,
      );
    }
    return await ownershipChecker.checkOwnership(resourceId, userId);
  }

  private fillOwnershipQueryParam(user, request): void {
    if (!request.query) request.query = {};
    request.query.owner = user.id;
  }
}
