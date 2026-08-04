"use client";

import { Award, Crown, Gem, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAchievementBadgeConfig } from "@/lib/achievement-badges.mjs";

type BadgeTierVariant = "subtle" | "gradient";
type BadgeTierSize = "sm" | "xs";

type BadgeTierProps = {
  tier?: string | null;
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

export function getTierBadgeConfig(tierValue: unknown, seed?: unknown) {
  return getAchievementBadgeConfig(tierValue, seed == null ? "" : String(seed));
}

export default function BadgeTier({
  tier,
  seed,
  variant = "subtle",
  size = "sm",
  className,
}: BadgeTierProps) {
  const config = getTierBadgeConfig(tier, seed);
  if (!config) return null;

  const Icon = ACHIEVEMENT_ICONS[config.level as keyof typeof ACHIEVEMENT_ICONS] || Award;
  const toneClass = variant === "gradient" ? config.gradientClass : config.subtleClass;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wider",
        variant === "gradient" ? "gap-1" : "gap-1 bg-[#0F1115]/80 backdrop-blur-sm",
        size === "xs"
          ? "h-5 px-2 text-[8px]"
          : "px-2 py-0.5 text-[8.5px]",
        toneClass,
        className
      )}
      title={config.title}
    >
      <Icon className={cn(size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3")} />
      {config.displayText}
    </span>
  );
}
