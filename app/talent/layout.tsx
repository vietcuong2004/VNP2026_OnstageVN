import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const ASSET_VERSION = "9";
const SHARE_IMAGE_URL = `${SITE_URL}/apple-touch-icon.png?v=${ASSET_VERSION}`;

export const metadata: Metadata = {
  title: "Onstage VN",
  description: "OnstageVN - Model Management System",
  openGraph: {
    type: "website",
    siteName: "Onstage VN",
    title: "Onstage VN",
    description: "OnstageVN - Model Management System",
    images: [{ url: SHARE_IMAGE_URL, secureUrl: SHARE_IMAGE_URL, type: "image/png", width: 180, height: 180, alt: "Onstage VN" }],
  },
  twitter: {
    card: "summary",
    title: "Onstage VN",
    description: "OnstageVN - Model Management System",
    images: [SHARE_IMAGE_URL],
  },
};

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
