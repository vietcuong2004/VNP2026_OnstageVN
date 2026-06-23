import { Metadata } from "next";
import InviteRedirectClient from "./InviteRedirectClient";

export const metadata: Metadata = {
  title: "OnstageVN - Lời mời hợp tác",
  description: "Tham gia mạng lưới Talent chuyên nghiệp cùng OnstageVN.",
  openGraph: {
    title: "OnstageVN - Lời mời hợp tác",
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
  }>;
}

export default async function BrandInviteRedirectPage({ params }: Props) {
  const { code } = await params;
  return <InviteRedirectClient code={code} />;
}
