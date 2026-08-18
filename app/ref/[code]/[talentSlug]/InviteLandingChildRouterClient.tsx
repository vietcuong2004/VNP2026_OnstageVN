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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F6] px-4 text-center text-[#191116]">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#8F0709] border-t-transparent" />
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#8F0709] animate-pulse">
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
