import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { rmSync } from "node:fs";

const require = createRequire(import.meta.url);

try {
  execFileSync(process.execPath, [
    "node_modules/typescript/bin/tsc",
    "lib/public-navigation.ts",
    "--outDir",
    ".tmp/public-navigation-test",
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--moduleResolution",
    "node",
    "--skipLibCheck",
  ], { stdio: "inherit" });

  const {
    getGuestDesktopNavigation,
    getGuestPrimaryNavigation,
    getGuestMoreNavigation,
    isGuestMarketplacePath,
    getGuestDefaultPath,
  } = require("../.tmp/public-navigation-test/public-navigation.js");

  assert.deepEqual(
    getGuestPrimaryNavigation().map((item) => [item.label, item.href]),
    [
      ["Talent", "/brand/search"],
      ["Việc làm", "/talent/jobs"],
      ["Về chúng tôi", "/about"],
    ],
  );

  assert.equal(getGuestDefaultPath(), "/brand/search");
  assert.equal(isGuestMarketplacePath("/brand/search"), true);
  assert.equal(isGuestMarketplacePath("/talent/jobs"), true);
  assert.equal(isGuestMarketplacePath("/brand/dashboard"), false);
  assert.equal(isGuestMarketplacePath("/talent/dashboard"), false);

  assert.deepEqual(
    getGuestMoreNavigation().map((item) => [item.label, item.href]),
    [
      ["Khảo sát", "/talent/survey"],
      ["Đăng nhập", "/auth/login"],
    ],
  );

  assert.deepEqual(
    getGuestDesktopNavigation().map((item) => [item.label, item.href]),
    [
      ["Talent", "/brand/search"],
      ["Việc làm", "/talent/jobs"],
      ["Về chúng tôi", "/about"],
      ["Khảo sát", "/talent/survey"],
      ["Đăng nhập", "/auth/login"],
    ],
  );
} finally {
  rmSync(".tmp/public-navigation-test", { recursive: true, force: true });
}
