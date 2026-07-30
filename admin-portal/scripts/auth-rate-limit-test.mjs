#!/usr/bin/env node

import { setTimeout as sleep } from "node:timers/promises";

const DEFAULT_TARGET = "http://localhost:3000/api";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const args = parseArgs(process.argv.slice(2));
const target = normalizeTarget(args.target || DEFAULT_TARGET);
enforceLocalTarget(target, args.allowNonLocal);

const mode = args.mode || "admin";
const requests = toPositiveInt(args.requests, 25);
const delayMs = toNonNegativeInt(args.delay, 0);
const endpoint = mode === "member" ? "/auth/login/member" : "/auth/login/admin";
const body = buildPayload(mode, args);

console.log("PSC safe auth rate-limit test");
console.log(`Target: ${target.href}`);
console.log(`Endpoint: ${endpoint}`);
console.log(`Requests: ${requests}`);
console.log(`Payload: ${redactPayload(body)}`);
console.log("");

const stats = new Map();
let first429At = null;

for (let index = 1; index <= requests; index += 1) {
  const status = await hitLogin(index);
  stats.set(status, (stats.get(status) || 0) + 1);

  if (status === 429 && first429At === null) {
    first429At = index;
  }

  if (delayMs > 0) {
    await sleep(delayMs);
  }
}

console.log("");
console.log("Summary");
console.log(`First 429: ${first429At ?? "none"}`);
[...stats.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([status, count]) => console.log(`  ${status}: ${count}`));

async function hitLogin(index) {
  const url = new URL(endpoint, target);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Client-Type": args.clientType || "web",
        "User-Agent": "PSC-safe-auth-rate-limit-test/1.0",
      },
      body: JSON.stringify(body),
      redirect: "manual",
    });
    const elapsedMs = Math.round(performance.now() - started);
    console.log(`[${String(index).padStart(3, "0")}] status=${response.status} ${elapsedMs}ms`);
    await response.arrayBuffer();
    return response.status;
  } catch (error) {
    console.log(`[${String(index).padStart(3, "0")}] NETWORK_ERROR ${error.message}`);
    return "NETWORK_ERROR";
  }
}

function buildPayload(selectedMode, options) {
  if (selectedMode === "admin") {
    return {
      email: options.email || "invalid-rate-limit-test@example.invalid",
      password: options.password || "invalid-password",
    };
  }

  if (selectedMode === "member") {
    return {
      memberID: options.memberId || "invalid-rate-limit-test",
      otp: options.otp || "0000",
      fcmToken: options.fcmToken || "local-rate-limit-test",
    };
  }

  throw new Error("Invalid --mode. Use admin or member.");
}

function redactPayload(payload) {
  const redacted = { ...payload };
  if ("password" in redacted) redacted.password = "<redacted>";
  if ("otp" in redacted) redacted.otp = "<redacted>";
  return JSON.stringify(redacted);
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
      `Refusing non-local target ${url.href}. Pass --allow-non-local only for an approved staging system.`,
    );
  }
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
  node scripts/auth-rate-limit-test.mjs [options]

Options:
  --target <url>          API base URL. Default: ${DEFAULT_TARGET}
  --mode <admin|member>   Login endpoint to test. Default: admin
  --requests <number>     Number of fixed-payload attempts. Default: 25
  --delay <ms>            Delay between attempts. Default: 0
  --email <email>         Admin email. Default: fixed invalid email
  --password <password>   Admin password. Default: fixed invalid password
  --member-id <id>        Member ID. Default: fixed invalid ID
  --otp <otp>             Member OTP. Default: 0000
  --fcm-token <token>     Member FCM token. Default: local-rate-limit-test
  --client-type <value>   Client-Type header. Default: web
  --allow-non-local       Permit non-local targets. Use only on approved staging.

Examples:
  node scripts/auth-rate-limit-test.mjs --mode admin --requests 20
  node scripts/auth-rate-limit-test.mjs --mode member --member-id 001 --otp 0000 --requests 10
`);
}
