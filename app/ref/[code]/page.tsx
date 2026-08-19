import { Metadata } from "next";
import InviteLandingRouterClient from "./InviteLandingRouterClient";

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
  }>;
}

export default async function InviteLandingPage({ params }: Props) {
  const { code } = await params;
  return <InviteLandingRouterClient code={code} />;
}