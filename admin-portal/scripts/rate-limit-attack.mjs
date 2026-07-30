#!/usr/bin/env node

import { setTimeout as sleep } from "node:timers/promises";

const DEFAULT_TARGET = "http://localhost:3000/api";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const ADMIN_APIS = [
  { method: "GET", path: "/auth/user-who", module: "auth" },
  { method: "GET", path: "/auth/admins", module: "admins" },
  { method: "GET", path: "/auth/reservations", module: "admin-reservations" },
  { method: "GET", path: "/dashboard/stats", module: "dashboard" },
  { method: "GET", path: "/member/admin/get/members?page=1&limit=10", module: "members" },
  { method: "GET", path: "/member/admin/search?searchFor=1", module: "members" },
  { method: "GET", path: "/booking/get/bookings/room?page=1&limit=10", module: "bookings" },
  { method: "GET", path: "/booking/get/bookings/cancelled?page=1&limit=10", module: "bookings" },
  { method: "GET", path: "/room/get/roomTypes", module: "rooms" },
  { method: "GET", path: "/room/get/rooms", module: "rooms" },
  { method: "GET", path: "/hall/get/halls", module: "halls" },
  { method: "GET", path: "/lawn/get/lawns", module: "lawns" },
  { method: "GET", path: "/photoShoot/get/photoShoots", module: "photoshoot" },
  { method: "GET", path: "/sport/get/sports", module: "sports" },
  { method: "GET", path: "/accounts/list-bills?month=12&year=2025", module: "accounts" },
  { method: "GET", path: "/accounts/admin/bills?membershipNo=001&month=12&year=2025", module: "accounts" },
  { method: "GET", path: "/payment/admin/bill-payment-history/001", module: "accounts" },
  { method: "GET", path: "/payment/admin/member-vouchers?membershipNo=001", module: "accounts" },
  { method: "GET", path: "/feedback", module: "feedback" },
  { method: "GET", path: "/reports/rooms/bookings?fromDate=2025-01-01&toDate=2025-12-31", module: "reports" },
  { method: "GET", path: "/activity-notifications?limit=10", module: "activity-notifications" },
];

const MEMBER_APIS = [
  { method: "GET", path: "/auth/user-who", module: "auth" },
  { method: "GET", path: "/payment/member-vouchers", module: "payment" },
  { method: "GET", path: "/payment/bill-payment-history", module: "payment" },
  { method: "GET", path: "/accounts/bills", module: "accounts" },
  { method: "GET", path: "/accounts/latest-bill", module: "accounts" },
  { method: "GET", path: "/booking/member/bookings", module: "booking" },
  { method: "GET", path: "/feedback/member", module: "feedback" },
  { method: "GET", path: "/notification/notifications", module: "notification" },
  { method: "GET", path: "/room/date-statuses?from=2025-12-01&to=2025-12-31", module: "room" },
  { method: "GET", path: "/hall/date-statuses?from=2025-12-01&to=2025-12-31", module: "hall" },
  { method: "GET", path: "/lawn/date-statuses?from=2025-12-01&to=2025-12-31", module: "lawn" },
];

const args = parseArgs(process.argv.slice(2));
const target = normalizeTarget(args.target || DEFAULT_TARGET);
enforceLocalTarget(target, args.allowNonLocal);

const mode = args.mode || "admin";
const catalog = pickCatalog(mode);
const totalRequests = toPositiveInt(args.requests, 250);
const concurrency = toPositiveInt(args.concurrency, 25);
const durationMs = args.duration ? toPositiveInt(args.duration, 0) * 1000 : 0;
const jitterMs = toNonNegativeInt(args.jitter, 25);
const methodFilter = args.methods
  ? new Set(String(args.methods).split(",").map((method) => method.trim().toUpperCase()).filter(Boolean))
  : null;
const selectedCatalog = methodFilter
  ? catalog.filter((entry) => methodFilter.has(entry.method))
  : catalog;

if (!selectedCatalog.length) {
  throw new Error("No APIs selected. Check --mode and --methods.");
}

const headers = {
  Accept: "application/json, text/plain, */*",
  "Client-Type": args.clientType || "web",
  "User-Agent": "PSC-local-rate-limit-exerciser/1.0",
};

if (args.token) {
  headers.Authorization = `Bearer ${args.token}`;
}

if (args.cookie) {
  headers.Cookie = args.cookie;
}

const stats = {
  startedAt: new Date(),
  total: 0,
  byStatus: new Map(),
  byModule: new Map(),
  byEndpoint: new Map(),
  errors: 0,
  first429At: null,
};

let requestCursor = 0;
const deadline = durationMs ? Date.now() + durationMs : null;

console.log("PSC local API rate-limit exercise");
console.log(`Target: ${target.href}`);
console.log(`Mode: ${mode}`);
console.log(`Requests: ${durationMs ? `until ${args.duration}s duration` : totalRequests}`);
console.log(`Concurrency: ${concurrency}`);
console.log(`Auth: ${args.token ? "bearer token" : args.cookie ? "cookie" : "none"}`);
console.log("");

await Promise.all(
  Array.from({ length: concurrency }, (_, workerId) => runWorker(workerId)),
);

printSummary();

async function runWorker(workerId) {
  while (shouldContinue()) {
    const requestNumber = ++requestCursor;
    const api = selectedCatalog[Math.floor(Math.random() * selectedCatalog.length)];
    await hitApi(api, requestNumber, workerId);

    if (jitterMs > 0) {
      await sleep(Math.floor(Math.random() * jitterMs));
    }
  }
}

function shouldContinue() {
  if (deadline) {
    return Date.now() < deadline;
  }

  return requestCursor < totalRequests;
}

async function hitApi(api, requestNumber, workerId) {
  const started = performance.now();
  const url = new URL(api.path, target);
  const requestOptions = {
    method: api.method,
    headers,
    redirect: "manual",
  };

  try {
    const response = await fetch(url, requestOptions);
    const elapsedMs = Math.round(performance.now() - started);
    stats.total += 1;
    increment(stats.byStatus, response.status);
    increment(stats.byModule, api.module);
    increment(stats.byEndpoint, `${api.method} ${api.path}`);

    if (response.status === 429 && !stats.first429At) {
      stats.first429At = { requestNumber, module: api.module, endpoint: api.path };
    }

    const marker = response.status === 429 ? "RATE-LIMITED" : "hit";
    console.log(
      `[${requestNumber.toString().padStart(4, "0")}] worker=${workerId} ${marker} status=${response.status} ${api.method} ${api.path} ${elapsedMs}ms`,
    );

    await response.arrayBuffer();
  } catch (error) {
    stats.total += 1;
    stats.errors += 1;
    increment(stats.byStatus, "NETWORK_ERROR");
    console.log(
      `[${requestNumber.toString().padStart(4, "0")}] worker=${workerId} error ${api.method} ${api.path}: ${error.message}`,
    );
  }
}

function printSummary() {
  const elapsedSeconds = Math.max(1, (Date.now() - stats.startedAt.getTime()) / 1000);
  console.log("");
  console.log("Summary");
  console.log(`Total attempts: ${stats.total}`);
  console.log(`Elapsed: ${elapsedSeconds.toFixed(1)}s`);
  console.log(`Approx RPS: ${(stats.total / elapsedSeconds).toFixed(1)}`);
  console.log(`Network errors: ${stats.errors}`);
  console.log(`First 429: ${stats.first429At ? JSON.stringify(stats.first429At) : "none"}`);
  console.log("");
  console.log("Status counts");
  printMap(stats.byStatus);
  console.log("");
  console.log("Module counts");
  printMap(stats.byModule);
  console.log("");
  console.log("Top endpoints");
  printMap(stats.byEndpoint, 10);
}

function printMap(map, limit = Number.POSITIVE_INFINITY) {
  [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .forEach(([key, value]) => console.log(`  ${key}: ${value}`));
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (!arg.startsWith("--")) {
      continue;
    }

    const [key, inlineValue] = arg.slice(2).split("=");
    const normalizedKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

    if (inlineValue !== undefined) {
      parsed[normalizedKey] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[normalizedKey] = true;
      continue;
    }

    parsed[normalizedKey] = next;
    index += 1;
  }

  return parsed;
}

function normalizeTarget(rawTarget) {
  const url = new URL(rawTarget);
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url;
}

function enforceLocalTarget(url, allowNonLocal) {
  if (allowNonLocal) {
    return;
  }

  if (!LOCAL_HOSTNAMES.has(url.hostname)) {
    throw new Error(
      `Refusing to exercise non-local target ${url.href}. Pass --allow-non-local only for an approved staging system.`,
    );
  }
}

function pickCatalog(mode) {
  if (mode === "admin") return ADMIN_APIS;
  if (mode === "member") return MEMBER_APIS;
  if (mode === "mixed") return [...ADMIN_APIS, ...MEMBER_APIS];
  throw new Error("Invalid --mode. Use admin, member, or mixed.");
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, got ${value}`);
  }
  return parsed;
}

function toNonNegativeInt(value, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected a non-negative integer, got ${value}`);
  }
  return parsed;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/rate-limit-attack.mjs [options]

Options:
  --target <url>          API base URL. Default: ${DEFAULT_TARGET}
  --mode <admin|member|mixed>
                          API catalog to attack. Default: admin
  --requests <number>     Total attempts. Default: 250
  --duration <seconds>    Run until duration instead of fixed request count
  --concurrency <number>  Parallel workers. Default: 25
  --jitter <ms>           Random delay after each request per worker. Default: 25
  --token <jwt>           Bearer token to send
  --cookie <cookie>       Cookie header, for example "access_token=..."
  --methods <csv>         Restrict methods, for example "GET,HEAD"
  --client-type <value>   Client-Type header. Default: web
  --allow-non-local       Permit non-local targets. Use only on approved staging.

Examples:
  node scripts/rate-limit-attack.mjs --cookie "access_token=..." --requests 300 --concurrency 30
  node scripts/rate-limit-attack.mjs --mode member --token eyJ... --duration 30 --concurrency 20
`);
}
