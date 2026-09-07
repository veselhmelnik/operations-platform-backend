import { Prisma } from 'src/generated/prisma/client';
import { ActivityActions, ActivityEntityType } from '../activityActions';

export type CreateActivityInput = {
  organizationId: string;
  userId?: string;
  action: ActivityActions;
  entityType: ActivityEntityType;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
};
