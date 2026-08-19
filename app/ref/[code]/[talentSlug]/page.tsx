import { Metadata } from "next";
import InviteLandingChildRouterClient from "./InviteLandingChildRouterClient";

export const metadata: Metadata = {
  title: "Ứng tuyển job",
  description: "Tham gia mạng lưới Talent chuyên nghiệp cùng OnstageVN.",
  openGraph: {
    title: "Ứng tuyển job",
    description: "Tham gia mạng lưới Talent chuyên nghiệp cùng OnstageVN.",
    images: [
      {
        url: "https://onstage.vn/cover_image.png",
        width: 1200,
        height: 630,
        alt: "OnstageVN Cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ứng tuyển job",
    description: "Tham gia mạng lưới Talent chuyên nghiệp cùng OnstageVN.",
    images: ["https://onstage.vn/cover_image.png"],
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
