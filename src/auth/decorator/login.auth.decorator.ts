import { applyDecorators, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guard/local-auth.guard';

export function LoginAuth() {
  return applyDecorators(UseGuards(LocalAuthGuard));
}
