import assert from "node:assert/strict";
import { getAchievementBadgeConfig } from "../lib/achievement-badges.mjs";

assert.equal(getAchievementBadgeConfig("S").level, "Kim cương");
assert.equal(getAchievementBadgeConfig("S").label, "Top 50 KOL");
assert.equal(getAchievementBadgeConfig("A").level, "Vàng");
assert.equal(getAchievementBadgeConfig("A").label, "Nổi bật T7");
assert.equal(getAchievementBadgeConfig("B").level, "Bạc");
assert.equal(getAchievementBadgeConfig("B").label, "Đánh giá tốt");
assert.equal(getAchievementBadgeConfig("C").level, "Đồng");
assert.equal(getAchievementBadgeConfig("C").label, "Gương mặt mới");

const fallback = getAchievementBadgeConfig("unknown", "talent-42");
assert.ok(["Kim cương", "Vàng", "Bạc", "Đồng"].includes(fallback.level));
assert.ok(!fallback.displayText.includes("Hạng"));
assert.ok(!fallback.displayText.includes("A"));
assert.ok(!fallback.displayText.includes("B"));
assert.ok(!fallback.displayText.includes("C"));

const seededBadges = Array.from({ length: 100 }, (_, index) =>
  getAchievementBadgeConfig("C", `talent-${index}`)
);
const top50Count = seededBadges.filter((badge) => badge.label === "Top 50 KOL").length;
assert.ok(top50Count >= 20, `expected at least 20 Top 50 KOL badges, got ${top50Count}`);

assert.equal(getAchievementBadgeConfig(null), null);

console.log("achievement badge tests passed");
