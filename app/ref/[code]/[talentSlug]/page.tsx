import { Metadata } from "next";
import InviteLandingChildRouterClient from "./InviteLandingChildRouterClient";
import { generateReferralMetadata } from "@/lib/referral-metadata";

interface Props {
  params: Promise<{
    code: string;
    talentSlug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, talentSlug } = await params;
  return generateReferralMetadata({ campaignSlug: code, referrerSlug: talentSlug });
}

export default async function TalentChildInviteRedirectPage({ params }: Props) {
  const { code, talentSlug } = await params;
  return <InviteLandingChildRouterClient code={code} talentSlug={talentSlug} />;
}
