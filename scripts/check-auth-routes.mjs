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

  const { isPublicPath, isStandalonePublicPath, usesAppShell } = require("../.tmp/auth-route-test/auth-routes.js");

  assert.equal(isPublicPath("/"), true);
  assert.equal(isPublicPath("/auth/login"), true);
  assert.equal(isPublicPath("/auth/register?redirect=/talent"), true);
  assert.equal(isPublicPath("/campaign/123"), true);
  assert.equal(isPublicPath("/ref/nguyen-ban"), true);
  assert.equal(isPublicPath("/intro/talent"), true);
  assert.equal(isPublicPath("/intro/brand"), true);
  assert.equal(isPublicPath("/talent"), true);
  assert.equal(isPublicPath("/talent/dashboard"), true);
  assert.equal(isPublicPath("/brand"), true);
  assert.equal(isPublicPath("/brand/my-talents"), true);
  assert.equal(isPublicPath("/talent/profile"), true);
  assert.equal(isPublicPath("/talent/survey"), true);

  assert.equal(isStandalonePublicPath("/intro/talent"), true);
  assert.equal(isStandalonePublicPath("/brand/search"), false);
  assert.equal(isStandalonePublicPath("/talent/dashboard"), false);
  assert.equal(isStandalonePublicPath("/talent/profile"), false);
  assert.equal(isStandalonePublicPath("/talent/survey"), false);
  assert.equal(usesAppShell("/brand/search"), true);
  assert.equal(usesAppShell("/talent/dashboard"), true);
  assert.equal(usesAppShell("/talent/profile"), true);
  assert.equal(usesAppShell("/talent/survey"), true);
} finally {
  rmSync(".tmp/auth-route-test", { recursive: true, force: true });
}
