"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import CrownfundingTabs from "./_components/tabs";
import { ToastContext } from "./_context/toast-context";

interface Toast {
  id: number;
  message: string;
  type: "success" | "info";
}

export default function CrowdfundingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // State for Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast handler
  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Determine active tab based on pathname
  let activeTab: "donate" | "rewards" | "lending" | "equity" = "donate";
  if (pathname.includes("/rewards")) activeTab = "rewards";
  else if (pathname.includes("/lending")) activeTab = "lending";
  else if (pathname.includes("/equity")) activeTab = "equity";

  const handleTabChange = (tab: "donate" | "rewards" | "lending" | "equity") => {
    router.push(`/talent/crownfunding/${tab}`);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/talent/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-[#08090f] text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-black text-white tracking-tight uppercase leading-none">
                Quỹ Vương Miện
              </h1>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Cổng Crowdfunding - Quản lý nguồn vốn hỗ trợ phát triển thương hiệu và dự án nhân ái.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <CrownfundingTabs activeTab={activeTab} onChangeTab={handleTabChange} />

        {/* Page Content */}
        <div className="mt-6">{children}</div>

        {/* Floating Toast Notification System */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "glass-panel border-l-4 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 min-w-[280px] max-w-[400px]",
                toast.type === "success" ? "border-l-emerald-500" : "border-l-amber-500"
              )}
            >
              {toast.type === "success" ? (
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="h-4.5 w-4.5 text-amber-400 shrink-0" />
              )}
              <p className="text-xs font-semibold text-white leading-snug">{toast.message}</p>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
