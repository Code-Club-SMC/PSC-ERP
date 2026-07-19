import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";

const temporaryDirectory = await mkdtemp(join(tmpdir(), "psc-permissions-"));
const compiledModule = join(temporaryDirectory, "permissions.mjs");

try {
  const source = await readFile(resolve("src/utils/permissions.ts"), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  await writeFile(compiledModule, compiled.outputText, "utf8");
  const api = await import(`file:///${compiledModule.replaceAll("\\", "/")}`);

  const permissions = {
    version: 2,
    modules: {
      "Room Bookings": { read: true, create: false, update: false, delete: false },
      Bookings: { read: true, create: true, update: true, delete: true },
    },
  };

  assert.equal(api.isLegacyPermissionPayload(["Room Bookings"]), true);
  assert.deepEqual(api.normalizePermissionMatrix(["Room Bookings"]).modules, {});
  assert.equal(api.hasModuleAction(["Room Bookings"], "Room Bookings", "read"), false);
  assert.equal(api.isV2PermissionPayload(permissions), true);
  assert.equal(api.hasModuleAction(permissions, "Room Bookings", "read"), true);
  assert.equal(api.hasModuleAction(permissions, "Room Bookings", "create"), false);
  assert.equal(api.hasModuleAction(permissions, "Hall Bookings", "read"), false);
  assert.equal(api.moduleSupportsAction("Dashboard", "create"), false);
  assert.equal(api.moduleSupportsAction("Accounts", "delete"), false);
  assert.equal(api.hasModuleAction(permissions, "Bookings", "create"), false);

  const sanitized = api.sanitizePermissionMatrix({
    version: 2,
    modules: { Dashboard: { read: true, create: true, update: true, delete: true } },
  });
  assert.deepEqual(sanitized.modules.Dashboard, {
    read: true, create: false, update: false, delete: false,
  });
  console.log("Strict frontend permission utility checks passed.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}