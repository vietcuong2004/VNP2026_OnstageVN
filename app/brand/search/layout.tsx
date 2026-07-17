import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const ASSET_VERSION = "8";

export const metadata: Metadata = {
  title: "OnstageVN - Tim kiem Talent",
  description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/brand/search`,
    siteName: "OnstageVN",
    title: "OnstageVN - Tim kiem Talent",
    description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
    images: [
      {
        url: `${SITE_URL}/apple-touch-icon.png?v=${ASSET_VERSION}`,
        secureUrl: `${SITE_URL}/apple-touch-icon.png?v=${ASSET_VERSION}`,
        type: "image/png",
        width: 180,
        height: 180,
        alt: "OnstageVN",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "OnstageVN - Tim kiem Talent",
    description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
    images: [`${SITE_URL}/apple-touch-icon.png?v=${ASSET_VERSION}`],
  },
};

export default function BrandSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
