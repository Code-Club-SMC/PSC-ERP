import { MODULE_CAPABILITIES, ModuleKey } from '../constants/modules.constants';

export const PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type PermissionActionMap = Record<PermissionAction, boolean>;
export type PermissionMatrix = {
  version: 2;
  modules: Partial<Record<ModuleKey, PermissionActionMap>>;
};

const emptyActions = (): PermissionActionMap => ({
  read: false,
  create: false,
  update: false,
  delete: false,
});

export const isV2PermissionPayload = (permissions: unknown): boolean => {
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
    return false;
  }

  const payload = permissions as Record<string, unknown>;
  return payload.version === 2 && !!payload.modules &&
    typeof payload.modules === 'object' && !Array.isArray(payload.modules);
};

export const normalizePermissionMatrix = (rawPermissions: unknown): PermissionMatrix => {
  const matrix: PermissionMatrix = { version: 2, modules: {} };
  if (!isV2PermissionPayload(rawPermissions)) return matrix;

  const rawModules = (rawPermissions as { modules: Record<string, unknown> }).modules;
  Object.entries(rawModules).forEach(([moduleName, rawActions]) => {
    if (!(moduleName in MODULE_CAPABILITIES)) return;
    if (!rawActions || typeof rawActions !== 'object' || Array.isArray(rawActions)) return;

    const actions = rawActions as Record<string, unknown>;
    matrix.modules[moduleName as ModuleKey] = PERMISSION_ACTIONS.reduce(
      (normalized, action) => {
        normalized[action] =
          MODULE_CAPABILITIES[moduleName as ModuleKey].includes(action) &&
          actions[action] === true;
        return normalized;
      },
      emptyActions(),
    );
  });

  return matrix;
};

export const hasPermissionAction = (
  rawPermissions: unknown,
  requiredModules: string[],
  requiredAction: PermissionAction,
) => {
  const matrix = normalizePermissionMatrix(rawPermissions);
  return requiredModules.some(
    (moduleName) =>
      moduleName in MODULE_CAPABILITIES &&
      matrix.modules[moduleName as ModuleKey]?.[requiredAction] === true,
  );
};

export const isValidPermissionPayload = (permissions: unknown) => {
  if (!isV2PermissionPayload(permissions)) return false;

  const rawModules = (permissions as { modules: Record<string, unknown> }).modules;
  return Object.entries(rawModules).every(([moduleName, rawActions]) => {
    if (!(moduleName in MODULE_CAPABILITIES)) return false;
    if (!rawActions || typeof rawActions !== 'object' || Array.isArray(rawActions)) {
      return false;
    }

    const actions = rawActions as Record<string, unknown>;
    if (
      Object.keys(actions).some(
        (action) => !PERMISSION_ACTIONS.includes(action as PermissionAction),
      )
    ) {
      return false;
    }

    return PERMISSION_ACTIONS.every(
      (action) =>
        typeof actions[action] === 'boolean' &&
        (actions[action] !== true ||
          MODULE_CAPABILITIES[moduleName as ModuleKey].includes(action)),
    );
  });
};