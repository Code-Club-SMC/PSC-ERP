import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PERMISSION_ACTION_KEY,
  PERMISSION_UPSERT_FIELD_KEY,
  PERMISSIONS_KEY,
} from '../decorators/permissions.decorator';
import { RolesEnum } from '../constants/roles.enum';
import { hasPermissionAction, PermissionAction } from '../utils/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  private inferAction(method: string): PermissionAction {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'create';
      case 'PATCH':
      case 'PUT':
        return 'update';
      case 'DELETE':
        return 'delete';
      case 'GET':
      default:
        return 'read';
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModules = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredModules?.length) return true;

    const request = context.switchToHttp().getRequest();
    const tokenUser = request.user;
    const adminId = Number(tokenUser?.id);
    if (!tokenUser || !Number.isInteger(adminId)) {
      throw new UnauthorizedException('Invalid admin session');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, role: true, permissions: true },
    });
    if (!admin) {
      throw new UnauthorizedException('Admin account no longer exists');
    }

    request.user = { ...tokenUser, role: admin.role, permissions: admin.permissions };
    if (admin.role === RolesEnum.SUPER_ADMIN) return true;

    const upsertField = this.reflector.getAllAndOverride<string>(
      PERMISSION_UPSERT_FIELD_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredAction: PermissionAction = upsertField
      ? (request.body?.[upsertField] ? 'update' : 'create')
      : this.reflector.getAllAndOverride<PermissionAction>(
          PERMISSION_ACTION_KEY,
          [context.getHandler(), context.getClass()],
        ) || this.inferAction(request.method || 'GET');

    if (hasPermissionAction(admin.permissions, requiredModules, requiredAction)) {
      return true;
    }

    throw new ForbiddenException(
      `${requiredAction.toUpperCase()} access is required for ${requiredModules.join(' or ')}`,
    );
  }
}