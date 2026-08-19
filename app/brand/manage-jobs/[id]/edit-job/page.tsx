"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Campaign } from "@/lib/brand-mvp-data";
import { loadBrandCampaign } from "@/lib/brand-api";
import FormEditJobDesktop from "./FormEditJobDesktop";
import FormEditJobMobile from "./FormEditJobMobile";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    loadBrandCampaign(params.id, [])
      .then((data) => {
        if (!cancelled) {
          setCampaign(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load campaign for edit:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (isDesktop === null || isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#8F0709] border-t-transparent" />
          <p className="text-xs font-bold text-[#8F0709]">Đang tải dữ liệu Job...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-base font-black text-[#8F0709]">Không tìm thấy thông tin job</h2>
        <button
          onClick={() => router.push(`/brand/manage-jobs/${params.id}`)}
          className="rounded-xl border border-[#F0D7D3] bg-white px-5 py-2.5 text-xs font-bold text-[#574D54] hover:bg-[#FFF0EE] hover:text-[#8F0709] shadow-sm"
        >
          Quay lại chi tiết job
        </button>
      </div>
    );
  }

  const formProps = {
    isOpen: true,
    campaignToEdit: campaign,
    onClose: () => router.push(`/brand/manage-jobs/${params.id}`),
    onCampaignUpdated: (_updated: Campaign) => {
      router.refresh();
      router.push(`/brand/manage-jobs/${params.id}`);
    },
  };

  return (
    <div className="h-full min-h-0 w-full">
      {isDesktop ? <FormEditJobDesktop {...formProps} /> : <FormEditJobMobile {...formProps} />}
    </div>
  );
}
