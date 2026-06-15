import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { rmSync } from "node:fs";

const require = createRequire(import.meta.url);

try {
  execFileSync(process.execPath, [
    "node_modules/typescript/bin/tsc",
    "lib/auth-routes.ts",
    "--outDir",
    ".tmp/auth-route-test",
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--moduleResolution",
    "node",
    "--skipLibCheck",
  ], { stdio: "inherit" });

  const { isPublicPath } = require("../.tmp/auth-route-test/auth-routes.js");

  assert.equal(isPublicPath("/"), true);
  assert.equal(isPublicPath("/auth/login"), true);
  assert.equal(isPublicPath("/auth/register?redirect=/talent"), true);
  assert.equal(isPublicPath("/campaign/123"), true);
  assert.equal(isPublicPath("/ref/nguyen-ban"), true);
  assert.equal(isPublicPath("/talent"), false);
  assert.equal(isPublicPath("/talent/dashboard"), false);
  assert.equal(isPublicPath("/brand"), false);
  assert.equal(isPublicPath("/brand/my-talents"), false);
} finally {
  rmSync(".tmp/auth-route-test", { recursive: true, force: true });
}
