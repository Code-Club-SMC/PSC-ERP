import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAccGuard } from '../guards/jwt-access.guard';
import { PermissionsGuard } from '../guards/permission.guard';
import {
  PermissionActionAccess,
  PermissionUpsertAccess,
  Permissions,
} from './permissions.decorator';

export const ModuleAccess = (...modules: string[]) =>
  applyDecorators(UseGuards(JwtAccGuard, PermissionsGuard), Permissions(...modules));

export const ActionAccess = PermissionActionAccess;
export const UpsertAccess = PermissionUpsertAccess;