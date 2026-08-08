"use client";

import { useEffect, useState } from "react";
import type { Campaign } from "@/lib/brand-mvp-data";
import FormEditJobDesktop from "./FormEditJobDesktop";
import FormEditJobMobile from "./FormEditJobMobile";

type FormEditJobProps = {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit: Campaign | null;
  onCampaignUpdated: (campaign: Campaign) => void;
};

export default function FormEditJob(props: FormEditJobProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncMode = () => setIsDesktop(mediaQuery.matches);

    syncMode();
    mediaQuery.addEventListener("change", syncMode);

    return () => {
      mediaQuery.removeEventListener("change", syncMode);
    };
  }, []);

  if (isDesktop === null) {
    return null;
  }

  return isDesktop ? <FormEditJobDesktop {...props} /> : <FormEditJobMobile {...props} />;
}
