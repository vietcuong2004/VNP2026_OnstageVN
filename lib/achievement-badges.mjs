const ACHIEVEMENT_PRESETS = [
  {
    key: "DIAMOND",
    level: "Kim cương",
    label: "Top 50 KOL",
    title: "Kim cương · Top 50 KOL",
    subtleClass: "border-cyan-200/45 bg-cyan-300/12 text-cyan-100 shadow-[0_0_16px_rgba(125,211,252,0.16)]",
    gradientClass: "border-cyan-100/70 bg-gradient-to-r from-cyan-50 via-sky-200 to-blue-400 text-slate-950 shadow-[0_0_14px_rgba(125,211,252,0.3)]",
  },
  {
    key: "GOLD",
    level: "Vàng",
    label: "Nổi bật tháng",
    title: "Vàng · Nổi bật tháng",
    subtleClass: "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.16)]",
    gradientClass: "border-amber-300/70 bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.28)]",
  },
  {
    key: "TRUSTED",
    level: "Bạc",
    label: "Đối tác tin cậy",
    title: "Bạc · Đối tác tin cậy",
    subtleClass: "border-slate-300/40 bg-slate-300/15 text-slate-100 shadow-[0_0_15px_rgba(203,213,225,0.1)]",
    gradientClass: "border-slate-100/70 bg-gradient-to-r from-slate-50 via-slate-300 to-slate-500 text-slate-950 shadow-[0_0_12px_rgba(203,213,225,0.22)]",
  },
  {
    key: "SILVER",
    level: "Bạc",
    label: "Đánh giá tốt",
    title: "Bạc · Đánh giá tốt",
    subtleClass: "border-purple-400/40 bg-purple-500/15 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.12)]",
    gradientClass: "border-purple-100/70 bg-gradient-to-r from-purple-50 via-fuchsia-200 to-purple-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.22)]",
  },
  {
    key: "POTENTIAL",
    level: "Đồng",
    label: "Gương mặt triển vọng",
    title: "Đồng · Gương mặt triển vọng",
    subtleClass: "border-orange-400/45 bg-orange-500/14 text-orange-200 shadow-[0_0_15px_rgba(194,120,64,0.14)]",
    gradientClass: "border-orange-200/70 bg-gradient-to-r from-orange-100 via-orange-400 to-stone-500 text-slate-950 shadow-[0_0_12px_rgba(194,120,64,0.26)]",
  },
  {
    key: "BRONZE",
    level: "Đồng",
    label: "Gương mặt mới",
    title: "Đồng · Gương mặt mới",
    subtleClass: "border-stone-400/45 bg-stone-500/16 text-stone-100 shadow-[0_0_15px_rgba(120,113,108,0.14)]",
    gradientClass: "border-stone-200/70 bg-gradient-to-r from-stone-100 via-orange-300 to-stone-500 text-slate-950 shadow-[0_0_12px_rgba(120,113,108,0.26)]",
  },
];

const TIER_TO_PRESET_INDEX = new Map([
  ["S", 0],
  ["DIAMOND", 0],
  ["KIM CUONG", 0],
  ["A", 1],
  ["GOLD", 1],
  ["VANG", 1],
  ["B", 3],
  ["SILVER", 3],
  ["BAC", 3],
  ["C", 5],
  ["BRONZE", 5],
  ["DONG", 5],
]);

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(String.fromCharCode(273), "d")
    .replaceAll(String.fromCharCode(272), "D")
    .toUpperCase()
    .trim();
}

function stableBucket(seed) {
  const key = String(seed || "achievement");
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }

  return hash % 100;
}

function stableIndex(seed) {
  const bucket = stableBucket(seed);
  if (bucket < 18) return 0;
  if (bucket < 36) return 1;
  if (bucket < 52) return 2;
  if (bucket < 70) return 3;
  if (bucket < 85) return 4;
  return 5;
}

function seededDisplayIndex(baseIndex, seed) {
  if (!seed) return baseIndex;

  const bucket = stableBucket(seed);

  if (baseIndex <= 1) {
    return bucket < 55 ? 0 : 1;
  }

  if (baseIndex <= 3) {
    return bucket < 48 ? 2 : 3;
  }

  return bucket < 48 ? 4 : 5;
}

export function getAchievementBadgeConfig(tierValue, seed = "") {
  const normalized = normalizeText(tierValue);
  if (!normalized && !seed) return null;

  if (normalized === "POTENTIAL" || normalized === "TIEM NANG") {
    const preset = ACHIEVEMENT_PRESETS[seededDisplayIndex(4, seed)];

    return {
      ...preset,
      displayText: preset.label,
    };
  }

  const baseIndex = TIER_TO_PRESET_INDEX.has(normalized)
    ? TIER_TO_PRESET_INDEX.get(normalized)
    : stableIndex(seed || tierValue);
  const presetIndex = seededDisplayIndex(baseIndex, seed);
  const preset = ACHIEVEMENT_PRESETS[presetIndex] || ACHIEVEMENT_PRESETS[5];

  return {
    ...preset,
    displayText: preset.label,
  };
}

export { ACHIEVEMENT_PRESETS };
