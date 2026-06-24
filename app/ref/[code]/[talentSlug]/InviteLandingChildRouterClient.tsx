"use client";

import { useEffect, useState } from "react";
import BrandInviteLandingClient from "../BrandInviteLandingClient";
import CampaignInviteLandingClient from "../CampaignInviteLandingClient";
import { resolveCampaignReferralLinkBySlug } from "@/lib/talent-api";

type InviteType = "loading" | "brand" | "campaign";

interface Props {
  code: string;
  talentSlug: string;
}

export default function InviteLandingChildRouterClient({ code, talentSlug }: Props) {
  const [inviteType, setInviteType] = useState<InviteType>("loading");

  useEffect(() => {
    let isMounted = true;

    resolveCampaignReferralLinkBySlug(code, talentSlug)
      .then((data) => {
        if (!isMounted) return;
        setInviteType(data?.type === "campaign" ? "campaign" : "brand");
      })
      .catch(() => {
        if (!isMounted) return;
        setInviteType("brand");
      });

    return () => {
      isMounted = false;
    };
  }, [code, talentSlug]);

  if (inviteType === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] px-4 text-center text-white">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-r-2 border-t-2 border-amber-400 border-b-transparent border-l-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F0C56B]">VNP</span>
          </div>
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500">
          Đang mở lời mời...
        </p>
      </div>
    );
  }

  if (inviteType === "campaign") {
    return <CampaignInviteLandingClient campaignSlug={code} referrerSlug={talentSlug} />;
  }

  return <BrandInviteLandingClient code={code} talentSlug={talentSlug} />;
}
