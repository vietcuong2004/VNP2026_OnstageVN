"use client";

import { Award, Crown, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeTierVariant = "subtle" | "gradient";
type BadgeTierSize = "sm" | "xs";

type BadgeTierProps = {
  tier?: string | null;
  variant?: BadgeTierVariant;
  size?: BadgeTierSize;
  className?: string;
};

export function getTierBadgeConfig(tierValue: unknown) {
  const tier = String(tierValue || "").trim().toUpperCase();
  if (!tier || tier === "POTENTIAL") return null;

  if (tier === "S") {
    return {
      tier,
      Icon: Crown,
      subtleClass: "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.16)]",
      gradientClass: "border-amber-300/70 bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.28)]",
    };
  }

  if (tier === "A") {
    return {
      tier,
      Icon: Trophy,
      subtleClass: "border-slate-300/40 bg-slate-300/15 text-slate-100 shadow-[0_0_15px_rgba(203,213,225,0.1)]",
      gradientClass: "border-slate-100/70 bg-gradient-to-r from-slate-50 via-slate-300 to-slate-500 text-slate-950 shadow-[0_0_12px_rgba(203,213,225,0.22)]",
    };
  }

  if (tier === "B") {
    return {
      tier,
      Icon: Star,
      subtleClass: "border-orange-500/40 bg-orange-500/15 text-orange-300 shadow-[0_0_15px_rgba(180,104,46,0.12)]",
      gradientClass: "border-orange-200/70 bg-gradient-to-r from-orange-100 via-amber-500 to-orange-300 text-slate-950 shadow-[0_0_12px_rgba(180,104,46,0.28)]",
    };
  }

  if (tier === "C") {
    return {
      tier,
      Icon: Award,
      subtleClass: "border-teal-500/40 bg-teal-500/15 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.1)]",
      gradientClass: "border-teal-100/70 bg-gradient-to-r from-teal-100 via-emerald-400 to-teal-700 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.24)]",
    };
  }

  return null;
}

export default function BadgeTier({
  tier,
  variant = "subtle",
  size = "sm",
  className,
}: BadgeTierProps) {
  const config = getTierBadgeConfig(tier);
  if (!config) return null;

  const Icon = config.Icon;
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
    >
      <Icon className={cn(size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3")} />
      Hạng {config.tier}
    </span>
  );
}
