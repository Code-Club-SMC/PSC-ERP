import {
  hasPermissionAction,
  isValidPermissionPayload,
  normalizePermissionMatrix,
} from './permissions';

const v2 = {
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
      create: false,
      update: false,
      delete: false,
    },
  },
};

describe('strict permission utilities', () => {
  it('treats legacy module arrays as authorization-inert', () => {
    expect(normalizePermissionMatrix(['Room Bookings']).modules).toEqual({});
    expect(hasPermissionAction(['Room Bookings'], ['Room Bookings'], 'read')).toBe(false);
  });

  it('requires an exact module and action', () => {
    expect(hasPermissionAction(v2, ['Room Bookings'], 'read')).toBe(true);
    expect(hasPermissionAction(v2, ['Room Bookings'], 'create')).toBe(false);
    expect(hasPermissionAction(v2, ['Hall Bookings'], 'read')).toBe(false);
  });

  it('does not inherit broad Bookings actions into booking domains', () => {
    expect(hasPermissionAction(v2, ['Room Bookings'], 'update')).toBe(false);
    expect(hasPermissionAction(v2, ['Bookings'], 'update')).toBe(false);
  });

  it('rejects legacy, malformed, unknown, and unsupported grants', () => {
    expect(isValidPermissionPayload(['Members'])).toBe(false);
    expect(isValidPermissionPayload({ version: 2, modules: { Dashboard: { read: true } } })).toBe(false);
    expect(isValidPermissionPayload({
      version: 2,
      modules: {
        Dashboard: { read: true, create: true, update: false, delete: false },
      },
    })).toBe(false);
    expect(isValidPermissionPayload({
      version: 2,
      modules: {
        Unknown: { read: true, create: false, update: false, delete: false },
      },
    })).toBe(false);
    expect(isValidPermissionPayload(v2)).toBe(true);
  });
});
