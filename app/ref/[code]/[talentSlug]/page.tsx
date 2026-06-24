import { Metadata } from "next";
import InviteLandingChildRouterClient from "./InviteLandingChildRouterClient";

export const metadata: Metadata = {
  title: "OnstageVN - Lời mời hợp tác từ Talent",
  description: "Tham gia mạng lưới Talent chuyên nghiệp cùng OnstageVN.",
  openGraph: {
    title: "OnstageVN - Lời mời hợp tác từ Talent",
    description: "Tham gia mạng lưới Talent chuyên nghiệp cùng OnstageVN.",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "OnstageVN Logo",
      },
    ],
  },
};

interface Props {
  params: Promise<{
    code: string;
    talentSlug: string;
  }>;
}

export default async function TalentChildInviteRedirectPage({ params }: Props) {
  const { code, talentSlug } = await params;
  return <InviteLandingChildRouterClient code={code} talentSlug={talentSlug} />;
}
