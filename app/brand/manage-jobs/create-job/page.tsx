"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Campaign } from "@/lib/brand-mvp-data";
import FormCreatJobDesktop from "./FormCreatJobDesktop";
import FormCreateJobMobile from "./FormCreateJobMobile";

export default function CreateJobPage() {
  const router = useRouter();
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

  const formProps = {
    isOpen: true,
    onClose: () => router.push("/brand/manage-jobs"),
    onCampaignCreated: (_campaign: Campaign) => {
      // The form redirects to the created job detail after submit.
    },
  };

  return (
    <div className="h-full min-h-0 w-full">
      {isDesktop ? <FormCreatJobDesktop {...formProps} /> : <FormCreateJobMobile {...formProps} />}
    </div>
  );
}
