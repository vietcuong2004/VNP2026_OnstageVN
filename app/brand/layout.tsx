import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const ASSET_VERSION = "9";
const SHARE_IMAGE_URL = `${SITE_URL}/home-og-image.png?v=${ASSET_VERSION}`;

export const metadata: Metadata = {
  title: "OnstageVN",
  description: "OnstageVN - Model Management System",
  openGraph: {
    type: "website",
    siteName: "OnstageVN",
    title: "OnstageVN",
    description: "OnstageVN - Model Management System",
    images: [{ url: SHARE_IMAGE_URL, secureUrl: SHARE_IMAGE_URL, type: "image/png", width: 1200, height: 630, alt: "OnstageVN" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnstageVN",
    description: "OnstageVN - Model Management System",
    images: [SHARE_IMAGE_URL],
  },
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
