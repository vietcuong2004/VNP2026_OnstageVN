"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { avatarFallbackForUser, profileAvatarFromBackend } from "@/lib/avatar";
import { storeAuthSession } from "@/lib/api-client";

type AccountType = "talent" | "brand";
type SocialProvider = "google" | "facebook";

type MeResponse = {
  user: {
    id: number;
    name: string;
    email: string | null;
    type: AccountType;
    status: string;
    social_provider?: SocialProvider | null;
    external_avatar_url?: string | null;
  };
};

type ProfileResponse = {
  data?: {
    id?: number;
    display_name?: string | null;
    photos?: Array<{ url?: string | null; path?: string | null; category?: string | null }> | null;
    user?: { name?: string | null; email?: string | null } | null;
  } | null;
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api").replace(/\/$/, "");
}

function getRedirectPath(type: AccountType | null) {
  return type === "talent" ? "/talent/dashboard" : "/brand/dashboard";
}

function getMissingEmailPath(type: AccountType | null) {
  return type === "talent" ? "/talent/settings?missingEmail=1" : "/brand/settings?missingEmail=1";
}

async function hydrateTalentAvatar(apiUrl: string, token: string, user: MeResponse["user"]) {
  if (user.type !== "talent") return user;

  const fallbackAvatar = avatarFallbackForUser(user);
  let avatar = fallbackAvatar;

  try {
    const response = await fetch(`${apiUrl}/my/profile`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const profile = (await response.json()) as ProfileResponse;
      avatar = profileAvatarFromBackend(profile.data) || fallbackAvatar;
    }
  } catch {
    avatar = fallbackAvatar;
  }

  const storedProfile = localStorage.getItem("vnp_talent_profile");
  let currentProfile = {};

  try {
    currentProfile = storedProfile ? JSON.parse(storedProfile) : {};
  } catch {
    currentProfile = {};
  }

  localStorage.setItem("vnp_talent_profile", JSON.stringify({
    ...currentProfile,
    name: user.name,
    email: user.email,
    avatar,
  }));

  return { ...user, external_avatar_url: avatar };
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
      const provider = searchParams.get("provider") as SocialProvider | null;

      if (!token) {
        setMessage("Không nhận được token đăng nhập.");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = (await response.json()) as MeResponse;
          const user = await hydrateTalentAvatar(apiUrl, token, data.user);
          storeAuthSession(token, user);
          const loginProvider = provider ?? user.social_provider ?? null;
          if (!user.email && loginProvider === "facebook") {
            router.replace(getMissingEmailPath(user.type));
            return;
          }
          router.replace(getRedirectPath(user.type));
          return;
        }
      } catch {
        // Token is already stored; fall back to the type from callback.
      }

      storeAuthSession(token, {
        id: 0,
        name: "User",
        email: null,
        type: type ?? "talent",
        status: "active",
      });
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
