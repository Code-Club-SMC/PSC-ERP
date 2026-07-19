import { SetMetadata } from '@nestjs/common';
import type { PermissionAction } from '../utils/permissions';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSION_ACTION_KEY = 'permission_action';
export const PERMISSION_UPSERT_FIELD_KEY = 'permission_upsert_field';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const PermissionActionAccess = (action: PermissionAction) =>
  SetMetadata(PERMISSION_ACTION_KEY, action);

export const PermissionUpsertAccess = (field = 'id') =>
  SetMetadata(PERMISSION_UPSERT_FIELD_KEY, field);
