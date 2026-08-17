import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const ASSET_VERSION = "10";

export const metadata: Metadata = {
  title: "Onstage VN",
  description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/brand/search`,
    siteName: "Onstage VN",
    title: "Onstage VN",
    description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
    images: [
      {
        url: `${SITE_URL}/logo_vuong.png?v=${ASSET_VERSION}`,
        secureUrl: `${SITE_URL}/logo_vuong.png?v=${ASSET_VERSION}`,
        type: "image/png",
        width: 1200,
        height: 1200,
        alt: "Onstage VN",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Onstage VN",
    description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
    images: [`${SITE_URL}/logo_vuong.png?v=${ASSET_VERSION}`],
  },
};

export default function BrandSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
