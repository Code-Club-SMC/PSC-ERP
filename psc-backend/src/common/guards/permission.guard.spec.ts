import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permission.guard';

const permissions = {
  version: 2,
  modules: {
    'Room Bookings': {
      read: true,
      create: false,
      update: false,
      delete: false,
    },
    Bookings: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
  },
};

const contextFor = (request: any) =>
  ({
    getHandler: () => 'handler',
    getClass: () => 'controller',
    switchToHttp: () => ({ getRequest: () => request }),
  }) as any;

describe('PermissionsGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const prisma = {
    admin: { findUnique: jest.fn() },
  } as any;
  let guard: PermissionsGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new PermissionsGuard(reflector, prisma);
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === 'permissions') return ['Room Bookings'];
      return undefined;
    });
  });

  it('allows the current database permission for the inferred action', async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 1, role: 'ADMIN', permissions });
    await expect(
      guard.canActivate(contextFor({ method: 'GET', user: { id: 1 } })),
    ).resolves.toBe(true);
  });

  it('denies broad-module inheritance', async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 1, role: 'ADMIN', permissions });
    await expect(
      guard.canActivate(contextFor({ method: 'POST', user: { id: 1 } })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies legacy permissions from the database', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 1,
      role: 'ADMIN',
      permissions: ['Room Bookings'],
    });
    await expect(
      guard.canActivate(contextFor({ method: 'GET', user: { id: 1 } })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('uses the current database role for SUPER_ADMIN bypass', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 1,
      role: 'SUPER_ADMIN',
      permissions: null,
    });
    await expect(
      guard.canActivate(contextFor({ method: 'DELETE', user: { id: 1, role: 'ADMIN' } })),
    ).resolves.toBe(true);
  });

  it('invalidates sessions for deleted admins', async () => {
    prisma.admin.findUnique.mockResolvedValue(null);
    await expect(
      guard.canActivate(contextFor({ method: 'GET', user: { id: 1 } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});