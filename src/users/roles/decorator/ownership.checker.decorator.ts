import { Type } from '@nestjs/common';
import { ResourceOwnershipChecker } from '../interface/resource.ownership.checker';

export const OWNER_CHECKER = 'owner_checker';
export function OwnerChecker(
  checker: ResourceOwnershipChecker | Type<ResourceOwnershipChecker>,
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(OWNER_CHECKER, checker, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(OWNER_CHECKER, checker, target);
    return target;
  };
}
