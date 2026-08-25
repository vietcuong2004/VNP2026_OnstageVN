import { Metadata } from "next";
import InviteLandingRouterClient from "./InviteLandingRouterClient";
import { generateReferralMetadata } from "@/lib/referral-metadata";

interface Props {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return generateReferralMetadata({ code });
}

export default async function InviteLandingPage({ params }: Props) {
  const { code } = await params;
  return <InviteLandingRouterClient code={code} />;
}