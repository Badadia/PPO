export interface ResourceOwnershipChecker<R = any, U = any> {
  checkOwnership(resourceId: R, userId: U): boolean;
}
