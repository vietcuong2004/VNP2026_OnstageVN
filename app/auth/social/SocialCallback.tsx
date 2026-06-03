"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Users } from "lucide-react";

type AccountType = "talent" | "brand";

type MeResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    type: AccountType;
    status: string;
    external_avatar_url?: string | null;
  };
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api").replace(/\/$/, "");
}

function getRedirectPath(type: AccountType | null) {
  return type === "talent" ? "/talent/dashboard" : "/brand/dashboard";
}

export default function SocialCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiUrl = useMemo(() => getApiBaseUrl(), []);
  const [message, setMessage] = useState("Đang hoàn tất đăng nhập...");
  const error = searchParams.get("error");
  const provider = searchParams.get("provider") || "google";
  const needsAccountType = error === "account_type_required";

  useEffect(() => {
    async function completeLogin() {
      if (needsAccountType) {
        setMessage("Vui lòng chọn loại tài khoản để đăng ký trước khi tiếp tục.");
        return;
      }

      const token = searchParams.get("token");
      const type = searchParams.get("type") as AccountType | null;

      if (!token) {
        setMessage("Không nhận được token đăng nhập.");
        return;
      }

      localStorage.setItem("onstagevn_auth_token", token);

      try {
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = (await response.json()) as MeResponse;
          localStorage.setItem("onstagevn_auth_user", JSON.stringify(data.user));
          localStorage.removeItem("vnp_talent_profile");
          router.replace(getRedirectPath(data.user.type));
          return;
        }
      } catch {
        // Token is already stored; fall back to the type from callback.
      }

      router.replace(getRedirectPath(type));
    }

    completeLogin();
  }, [apiUrl, needsAccountType, router, searchParams]);

  function socialRegisterUrl(type: AccountType) {
    return `${apiUrl}/auth/social/${provider}/redirect?mode=register&type=${type}`;
  }

  if (needsAccountType) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10">
          <Users className="h-7 w-7 text-amber-300" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-black uppercase tracking-widest text-white">Chọn loại tài khoản</h1>
          <p className="text-sm leading-relaxed text-slate-400">{message}</p>
        </div>
        <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={socialRegisterUrl("talent")}
            className="flex h-12 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-300 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:brightness-105"
          >
            Đăng ký Talent
          </a>
          <a
            href={socialRegisterUrl("brand")}
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60 text-xs font-black uppercase tracking-widest text-slate-100 transition-all hover:border-amber-400/50 hover:text-amber-300"
          >
            Đăng ký Brand
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-300" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
