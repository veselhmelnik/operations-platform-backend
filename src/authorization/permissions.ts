import { OrganizationRole } from 'src/generated/prisma/enums';
import { Permission } from './require-permission.decorator';

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  OWNER: [
    'organization.delete',
    'member.read',
    'member.add',
    'member.remove',
    'member.role.update',
    'project.create',
    'project.read',
    'task.create',
    'task.update',
    'task.read',
    'comment.create',
    'task.delete',
  ],

  ADMIN: [
    'member.read',
    'member.add',
    'member.remove',
    'member.role.update',
    'project.create',
    'project.read',
    'task.create',
    'task.update',
    'task.read',
    'comment.create',
    'task.delete',
  ],

  MANAGER: [
    'member.read',
    'project.create',
    'project.read',
    'task.create',
    'task.update',
    'task.read',
    'comment.create',
    'task.delete',
  ],

  MEMBER: ['project.read', 'task.update', 'task.read', 'comment.create'],

  VIEWER: ['project.read', 'task.read'],
};
