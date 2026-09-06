import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';
export type Permission =
  | 'organization.delete'
  | 'member.read'
  | 'member.add'
  | 'member.invite'
  | 'member.remove'
  | 'member.role.update'
  | 'project.create'
  | 'project.read'
  | 'task.create'
  | 'task.update'
  | 'task.read'
  | 'comment.create'
  | 'user.add'
  | 'task.delete';
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions);
