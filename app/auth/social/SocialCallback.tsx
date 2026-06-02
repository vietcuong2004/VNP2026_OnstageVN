"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

type AccountType = "talent" | "brand";

type MeResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    type: AccountType;
    status: string;
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

  useEffect(() => {
    async function completeLogin() {
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
          router.replace(getRedirectPath(data.user.type));
          return;
        }
      } catch {
        // Token is already stored; fall back to the type from callback.
      }

      router.replace(getRedirectPath(type));
    }

    completeLogin();
  }, [apiUrl, router, searchParams]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-300" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
