import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { Role } from '../../users/roles/roles.enum';
import { RolesGuard } from '../../users/roles/roles.guard';
import { Roles } from '../../users/roles/roles.decorator';

export function JwtAuth(...roles: Role[]) {
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
