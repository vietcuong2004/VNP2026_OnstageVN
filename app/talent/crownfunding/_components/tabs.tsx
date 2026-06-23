"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  activeTab: "donate" | "rewards" | "lending" | "equity";
  onChangeTab: (tab: "donate" | "rewards" | "lending" | "equity") => void;
}

export default function CrownfundingTabs({ activeTab, onChangeTab }: TabsProps) {
  const tabsList = [
    { id: "donate", label: "Quỹ Nhân Ái (Donate)" },
    { id: "rewards", label: "Quà Tri Ân (Rewards)" },
    { id: "lending", label: "Vay Vốn (Lending/ISA)" },
    { id: "equity", label: "Cổ Phần (Equity/BCC)" },
  ] as const;

  return (
    <div className="flex border-b border-white/5 overflow-x-auto scrollbar-none gap-2">
      {tabsList.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChangeTab(tab.id)}
          className={cn(
            "px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all duration-300 relative cursor-pointer border-b-2 -mb-[2px]",
            activeTab === tab.id
              ? "border-amber-400 text-amber-300 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
