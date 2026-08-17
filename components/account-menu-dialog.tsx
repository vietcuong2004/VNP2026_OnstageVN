"use client";

import type { LucideIcon } from "lucide-react";
import { LogIn, LogOut, Moon, Sun } from "lucide-react";
import type { AppTheme } from "@/components/theme-provider";

type AccountMenuLabel = {
  name: string;
  subtitle: string;
};

type AccountMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AccountMenuDialogProps = {
  isAuthenticated: boolean;
  label: AccountMenuLabel;
  avatarSrc: string;
  fallbackAvatarSrc: string;
  items: AccountMenuItem[];
  theme: AppTheme;
  onNavigate: (href: string) => void;
  onToggleTheme: () => void;
  onLogout: () => void | Promise<void>;
  onLogin: () => void;
};

export default function AccountMenuDialog({
  isAuthenticated,
  label,
  avatarSrc,
  fallbackAvatarSrc,
  items,
  theme,
  onNavigate,
  onToggleTheme,
  onLogout,
  onLogin,
}: AccountMenuDialogProps) {
  return (
    <div className="absolute right-0 top-12 z-[70] w-72 overflow-hidden rounded-[1.35rem] border border-[#E8CF91] bg-white p-2.5 text-[#191116] shadow-[0_18px_48px_rgba(212,175,55,0.18)] dark:border-white/10 dark:bg-[rgb(8,11,22)] dark:text-white dark:shadow-2xl">
      <div className="mb-1.5 flex items-center gap-3 rounded-2xl border border-[#F6E9C6] bg-[#FFFDF8] px-3 py-3 dark:border-white/5 dark:bg-[#10131d]">
        <img
          src={avatarSrc}
          alt="Profile avatar"
          onError={(event) => {
            event.currentTarget.src = fallbackAvatarSrc;
          }}
          className="h-10 w-10 rounded-full border border-[#E8CF91] bg-white object-cover dark:border-amber-400/30 dark:bg-slate-950"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#191116] dark:text-white">{label.name}</p>
          <p className="truncate text-xs font-medium text-[#574D54] dark:text-slate-500">{label.subtitle}</p>
        </div>
      </div>

      {isAuthenticated &&
        items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate(item.href)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#191116] transition-colors hover:bg-[#FFF8E8] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Icon className="h-4 w-4 text-[#574D54] dark:text-slate-400" />
              {item.label}
            </button>
          );
        })}

      <button
        type="button"
        onClick={onToggleTheme}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#191116] transition-colors hover:bg-[#FFF8E8] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-[#574D54] dark:text-slate-400" />
        ) : (
          <Moon className="h-4 w-4 text-[#574D54] dark:text-slate-400" />
        )}
        <span className="flex-1 text-left">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        <span
          className={`relative h-6 w-11 rounded-full border transition-colors ${
            theme === "light"
              ? "border-[#E8CF91] bg-[#FFF8E8]"
              : "border-white/10 bg-white/5"
          }`}
        >
          <span
            className={`absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-transform ${
              theme === "light"
                ? "translate-x-5 bg-[#D4AF37]"
                : "translate-x-0 bg-slate-500"
            }`}
          />
        </span>
      </button>

      <div className="my-1.5 border-t border-[#F6E9C6] dark:border-white/5" />

      {isAuthenticated ? (
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#C72524] transition-colors hover:bg-[#FFF8E8] dark:text-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-100"
        >
          <LogOut className="h-4 w-4 text-[#C72524] dark:text-red-400" />
          Đăng xuất
        </button>
      ) : (
        <button
          type="button"
          onClick={onLogin}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8F0709] transition-colors hover:bg-[#FFF8E8] dark:text-amber-200 dark:hover:bg-amber-400/10 dark:hover:text-amber-100"
        >
          <LogIn className="h-4 w-4 text-[#8F0709] dark:text-amber-300" />
          Đăng nhập / Đăng ký
        </button>
      )}
    </div>
  );
}
