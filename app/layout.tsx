import type { Metadata, Viewport } from "next";
import AppShell from "./app-shell";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const ASSET_VERSION = "9";
const FAVICON_VERSION = "11";
const SHARE_IMAGE = `/home-og-image.png?v=${ASSET_VERSION}`;
const SHARE_IMAGE_URL = `${SITE_URL}${SHARE_IMAGE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Onstage VN",
  description: "OnstageVN - Model Management System",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Onstage VN",
    title: "Onstage VN",
    description: "OnstageVN - Model Management System",
    images: [
      {
        url: SHARE_IMAGE_URL,
        secureUrl: SHARE_IMAGE_URL,
        type: "image/png",
        width: 1200,
        height: 630,
        alt: "Onstage VN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onstage VN",
    description: "OnstageVN - Model Management System",
    images: [SHARE_IMAGE_URL],
  },
  icons: {
    icon: [
      { url: `/logo_new.png?v=${FAVICON_VERSION}`, type: "image/png", sizes: "any" },
    ],
    apple: [
      { url: `/apple-touch-icon.png?v=${ASSET_VERSION}`, sizes: "180x180" },
    ],
  },
  manifest: `/site.webmanifest?v=${ASSET_VERSION}`,
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className="h-full dark antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="h-full bg-[#03050c] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
