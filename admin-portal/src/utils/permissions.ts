export const PERMISSION_ACTIONS = ["read", "create", "update", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type PermissionActionMap = Record<PermissionAction, boolean>;

export const MODULES = [
  "Dashboard",
  "Bookings",
  "Calendar",
  "Notifications",
  "Members",
  "Rooms",
  "Room Types",
  "Room Bookings",
  "Halls",
  "Hall Bookings",
  "Lawns",
  "Lawn Categories",
  "Lawn Bookings",
  "Photoshoot",
  "Photoshoot Bookings",
  "Sports",
  "Accounts",
  "Affiliated Clubs",
  "Contents",
  "Admin Reservations",
  "Messing",
  "Admins",
  "Feedback",
  "Search",
  "Room Reports",
  "Hall Reports",
  "Photoshoot Reports",
] as const;

export type ModuleName = (typeof MODULES)[number];
export type PermissionMatrix = {
  version: 2;
  modules: Partial<Record<ModuleName, PermissionActionMap>>;
};

const CRUD: PermissionAction[] = ["read", "create", "update", "delete"];
export const MODULE_CAPABILITIES: Record<ModuleName, PermissionAction[]> = {
  Dashboard: ["read"],
  Bookings: ["read"],
  Calendar: ["read"],
  Notifications: ["read", "create", "delete"],
  Members: CRUD,
  Rooms: CRUD,
  "Room Types": CRUD,
  "Room Bookings": CRUD,
  Halls: CRUD,
  "Hall Bookings": CRUD,
  Lawns: CRUD,
  "Lawn Categories": CRUD,
  "Lawn Bookings": CRUD,
  Photoshoot: CRUD,
  "Photoshoot Bookings": CRUD,
  Sports: CRUD,
  Accounts: CRUD,
  "Affiliated Clubs": CRUD,
  Contents: CRUD,
  "Admin Reservations": ["read", "update"],
  Messing: CRUD,
  Admins: CRUD,
  Feedback: ["read"],
  Search: ["read"],
  "Room Reports": ["read"],
  "Hall Reports": ["read"],
  "Photoshoot Reports": ["read"],
};

export type PermissionSection = {
  title: string;
  description?: string;
  modules: Array<{
    module: ModuleName;
    label?: string;
    description?: string;
  }>;
};

export const PERMISSION_SECTIONS: PermissionSection[] = [
  { title: "Overview", modules: [{ module: "Dashboard" }, { module: "Search" }, { module: "Calendar" }, { module: "Bookings" }] },
  { title: "Members", modules: [{ module: "Members" }] },
  {
    title: "Accounts",
    modules: [
      { module: "Accounts", label: "Members Info and Monthly Bills", description: "Read covers member account info; Create, Update, and Delete cover monthly bill operations." },
    ],
  },
  { title: "Admins", modules: [{ module: "Admins" }] },
  { title: "Admin Reservations", modules: [{ module: "Admin Reservations", description: "Read allows viewing requests; Update allows shifting a request into a booking." }] },
  {
    title: "Rooms",
    modules: [
      { module: "Rooms" },
      { module: "Room Types" },
      { module: "Room Bookings" },
      { module: "Room Reports" },
    ],
  },
  {
    title: "Halls and Lawns",
    modules: [
      { module: "Halls" },
      { module: "Hall Bookings" },
      { module: "Hall Reports" },
      { module: "Lawns" },
      { module: "Lawn Categories" },
      { module: "Lawn Bookings" },
    ],
  },
  {
    title: "Photoshoot",
    modules: [
      { module: "Photoshoot" },
      { module: "Photoshoot Bookings" },
      { module: "Photoshoot Reports" },
    ],
  },
  { title: "Messing", modules: [{ module: "Messing", description: "Controls CRUD permissions across Messing sub-tabs." }] },
  { title: "Sports", modules: [{ module: "Sports" }] },
  {
    title: "Affiliated Clubs",
    modules: [
      { module: "Affiliated Clubs", label: "Clubs, Requests, Room Bookings and Statistics", description: "Read covers requests/statistics; CRUD controls club and affiliated room booking operations." },
    ],
  },
  { title: "Notifications", modules: [{ module: "Notifications", description: "Update is intentionally unsupported." }] },
  { title: "Contents", modules: [{ module: "Contents", description: "Controls CRUD permissions across all content sub-tabs." }] },
  { title: "Feedback", modules: [{ module: "Feedback" }] },
];

export function emptyActionMap(): PermissionActionMap {
  return { read: false, create: false, update: false, delete: false };
}

export function isV2PermissionPayload(rawPermissions: unknown): boolean {
  if (!rawPermissions || typeof rawPermissions !== "object" || Array.isArray(rawPermissions)) {
    return false;
  }
  const source = rawPermissions as Record<string, unknown>;
  return source.version === 2 && !!source.modules &&
    typeof source.modules === "object" && !Array.isArray(source.modules);
}

export function isLegacyPermissionPayload(rawPermissions: unknown): boolean {
  return rawPermissions != null && !isV2PermissionPayload(rawPermissions);
}

export function normalizePermissionMatrix(rawPermissions: unknown): PermissionMatrix {
  const matrix: PermissionMatrix = { version: 2, modules: {} };
  if (!isV2PermissionPayload(rawPermissions)) return matrix;

  const modules = (rawPermissions as { modules: Record<string, unknown> }).modules;
  Object.entries(modules).forEach(([moduleName, rawActions]) => {
    if (!(moduleName in MODULE_CAPABILITIES)) return;
    if (!rawActions || typeof rawActions !== "object" || Array.isArray(rawActions)) return;

    const actions = rawActions as Record<string, unknown>;
    matrix.modules[moduleName as ModuleName] = PERMISSION_ACTIONS.reduce(
      (normalized, action) => {
        normalized[action] =
          MODULE_CAPABILITIES[moduleName as ModuleName].includes(action) &&
          actions[action] === true;
        return normalized;
      },
      emptyActionMap(),
    );
  });
  return matrix;
}

export function sanitizePermissionMatrix(rawPermissions: unknown): PermissionMatrix {
  const normalized = normalizePermissionMatrix(rawPermissions);
  return {
    version: 2,
    modules: MODULES.reduce((modules, moduleName) => {
      const allowedActions = MODULE_CAPABILITIES[moduleName];
      const current = normalized.modules[moduleName] || emptyActionMap();
      modules[moduleName] = PERMISSION_ACTIONS.reduce((actions, action) => {
        actions[action] = allowedActions.includes(action) && current[action] === true;
        return actions;
      }, emptyActionMap());
      return modules;
    }, {} as Record<ModuleName, PermissionActionMap>),
  };
}

export function moduleSupportsAction(moduleName: ModuleName, action: PermissionAction): boolean {
  return MODULE_CAPABILITIES[moduleName].includes(action);
}

export function hasModuleAction(
  rawPermissions: unknown,
  moduleName: ModuleName,
  action: PermissionAction,
): boolean {
  return normalizePermissionMatrix(rawPermissions).modules[moduleName]?.[action] === true;
}

export function canReadModule(rawPermissions: unknown, moduleName: ModuleName): boolean {
  return hasModuleAction(rawPermissions, moduleName, "read");
}
