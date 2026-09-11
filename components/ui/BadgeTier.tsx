"use client";

import { Award, Crown, Gem, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAchievementBadgeConfig } from "@/lib/achievement-badges.mjs";

type BadgeTierVariant = "subtle" | "gradient";
type BadgeTierSize = "sm" | "xs";

export type TalentAchievementBadge = {
  id?: string | number;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  tier?: string | null;
  color_scheme?: string | null;
  icon?: string | null;
  period_type?: string | null;
  period_value?: string | null;
  score?: number | null;
};

type BadgeTierProps = {
  tier?: string | null;
  badge?: TalentAchievementBadge | null;
  seed?: string | number | null;
  variant?: BadgeTierVariant;
  size?: BadgeTierSize;
  className?: string;
};

const ACHIEVEMENT_ICONS = {
  "Kim cương": Gem,
  "Vàng": Crown,
  "Bạc": Medal,
  "Đồng": Award,
} as const;

const BACKEND_BADGE_ICONS: Record<string, typeof Award> = {
  award: Award,
  medal: Medal,
  crown: Crown,
  gem: Gem,
  star: Star,
};

function normalizeBadgeKey(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLowerCase()
    .trim();
}

export function getTierBadgeConfig(tierValue: unknown, seed?: unknown) {
  return getAchievementBadgeConfig(tierValue, seed == null ? "" : String(seed));
}

export function getPrimaryAchievementBadge(source: unknown): TalentAchievementBadge | null {
  const candidate = source as { badges?: unknown; active_badges?: unknown } | null | undefined;
  const badges = Array.isArray(candidate?.badges)
    ? candidate.badges
    : Array.isArray(candidate?.active_badges)
      ? candidate.active_badges
      : [];

  return (badges as TalentAchievementBadge[]).find((badge) => Boolean(badge?.title)) || null;
}

export function getBackendBadgeConfig(badge: TalentAchievementBadge | null | undefined, fallbackTier?: unknown) {
  if (!badge?.title) return null;

  const tone = badge.color_scheme || badge.tier || fallbackTier;
  const base = getAchievementBadgeConfig(tone, "");
  if (!base) return null;

  return {
    ...base,
    displayText: badge.title,
    title: badge.description ? `${badge.title} · ${badge.description}` : badge.title,
    iconKey: normalizeBadgeKey(badge.icon),
  };
}

export default function BadgeTier({
  tier,
  badge,
  seed,
  variant = "subtle",
  size = "sm",
  className,
}: BadgeTierProps) {
  const config = getBackendBadgeConfig(badge, tier) || getTierBadgeConfig(tier, seed);
  if (!config) return null;

  const iconFromBadge = "iconKey" in config && config.iconKey ? BACKEND_BADGE_ICONS[String(config.iconKey)] : null;
  const Icon = iconFromBadge || ACHIEVEMENT_ICONS[config.level as keyof typeof ACHIEVEMENT_ICONS] || Award;
  const toneClass = variant === "gradient" ? config.gradientClass : config.subtleClass;
  const displayText = ("displayText" in config && config.displayText) ? config.displayText : config.label || config.level;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border font-black uppercase tracking-tight whitespace-nowrap",
        variant === "gradient" ? "gap-1" : "gap-1 bg-[#0F1115]/80 backdrop-blur-sm",
        size === "xs"
          ? "h-5 px-1.5 text-[7.5px] min-[350px]:text-[8px] sm:text-[8.5px]"
          : "px-2 py-0.5 text-[8.5px]",
        toneClass,
        className
      )}
      title={config.title}
    >
      <Icon className={cn("shrink-0", size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3")} />
      <span className="whitespace-nowrap leading-none">{displayText}</span>
    </span>
  );
}
