"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Calendar, ChevronDown, Crown, LogOut, Search, UserCircle, Building2 } from "lucide-react";

type AuthUser = {
  name: string;
  email: string;
  type: "talent" | "brand";
  status: string;
  external_avatar_url?: string | null;
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api").replace(/\/$/, "");
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isBrandPath = pathname.startsWith("/brand");
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("onstagevn_auth_user");
    if (!stored) {
      return;
    }

    try {
      setUser(JSON.parse(stored) as AuthUser);
    } catch {
      window.localStorage.removeItem("onstagevn_auth_user");
    }
  }, []);

  const label = user
    ? { name: user.name, subtitle: user.type === "talent" ? "Talent" : "Đối tác" }
    : isBrandPath
      ? { name: "L'Oréal Vietnam", subtitle: "Doanh nghiệp" }
      : { name: "Nguyễn Mai Anh", subtitle: "Hạng S" };
  const headerAvatarSrc = isBrandPath ? "/logo_icon.png" : user?.external_avatar_url || "/avatar.png";

  async function handleLogout() {
    const token = localStorage.getItem("onstagevn_auth_token");

    if (token) {
      try {
        await fetch(`${getApiBaseUrl()}/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Local logout still clears the browser session when API is offline.
      }
    }

    localStorage.removeItem("onstagevn_auth_token");
    localStorage.removeItem("onstagevn_auth_user");
    router.push("/auth/login");
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-white/5 bg-[#070913]/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex w-auto md:w-72 shrink-0 items-center">
        <button
          onClick={() => router.push("/")}
          className="flex items-center hover:opacity-95 transition-opacity focus:outline-none cursor-pointer"
        >
          <img
            src="/logo_icon.png"
            alt="OnstageVN Logo Icon"
            className="h-11 w-11 object-contain shrink-0"
          />
          <img
            src="/logo_text.png"
            alt="OnstageVN Logo Text"
            className="h-9 object-contain shrink-0"
          />
        </button>
      </div>

      <div className="ml-4 hidden md:flex max-w-md flex-1 items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm tài năng, chiến dịch, giao dịch..."
            className="w-full rounded-xl border border-white/5 bg-slate-900/30 py-2 pl-9 pr-4 text-xs text-white transition-all focus:border-amber-400/50 focus:bg-slate-900/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-slate-900/30 text-slate-400 transition-colors hover:text-white">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="relative border-l border-white/5 pl-3.5 md:pl-6">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-white/5"
          >
            <img
              src={headerAvatarSrc}
              alt="Profile avatar"
              className="h-9 w-9 rounded-full border border-amber-400/30 object-cover bg-slate-950"
            />
            <div className="hidden sm:block">
              <span className="block text-xs font-bold text-white">{label.name}</span>
              <span className="block text-[10px] text-slate-500">{label.subtitle}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-white/10 bg-[#080b16] p-2 shadow-2xl">
              <div className="flex items-center gap-3 rounded-lg px-3 py-3 border-b border-white/5 mb-1.5">
                {isBrandPath ? <Building2 className="h-9 w-9 text-amber-300" /> : <UserCircle className="h-9 w-9 text-amber-300" />}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{label.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email ?? (isBrandPath ? "partner@loreal.com" : "maianh@onstage.vn")}</p>
                </div>
              </div>

              {/* Navigation Links based on user role */}
              {isBrandPath ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/brand/settings");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Building2 className="h-4 w-4 text-slate-400" />
                    Cài đặt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/brand/dashboard");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Tổng quan
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/talent/portfolio");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <UserCircle className="h-4 w-4 text-slate-400" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/talent/calendar");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Lịch trình
                  </button>
                </>
              )}

              <div className="border-t border-white/5 my-1.5" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/10 hover:text-red-100"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
