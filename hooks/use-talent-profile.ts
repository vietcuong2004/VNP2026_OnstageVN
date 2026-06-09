"use client";

import { useEffect, useState } from "react";
import { loadTalentProfile } from "@/lib/talent-api";

/**
 * Custom React hook to fetch and read the talent profile state from local storage.
 */
export function useTalentProfile() {
  const [profile, setProfile] = useState<unknown>(null);

  useEffect(() => {
    let active = true;

    loadTalentProfile().then((loadedProfile) => {
      if (active) setProfile(loadedProfile);
    });

    return () => {
      active = false;
    };
  }, []);

  return profile;
}
