import type { Metadata, Viewport } from "next";
import AppShell from "./app-shell";
import "./globals.css";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://onstagevn.vercel.app").replace(/\/$/, "");
const ASSET_VERSION = "8";
const SHARE_IMAGE = `/apple-touch-icon.png?v=${ASSET_VERSION}`;
const SHARE_IMAGE_URL = `${SITE_URL}${SHARE_IMAGE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "OnstageVN",
  description: "OnstageVN - Model Management System",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "OnstageVN",
    title: "OnstageVN",
    description: "OnstageVN - Model Management System",
    images: [
      {
        url: SHARE_IMAGE_URL,
        secureUrl: SHARE_IMAGE_URL,
        type: "image/png",
        width: 180,
        height: 180,
        alt: "OnstageVN",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "OnstageVN",
    description: "OnstageVN - Model Management System",
    images: [SHARE_IMAGE_URL],
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ASSET_VERSION}`, sizes: "any" },
      { url: `/favicon-32x32.png?v=${ASSET_VERSION}`, type: "image/png", sizes: "32x32" },
      { url: `/favicon-24x24.png?v=${ASSET_VERSION}`, type: "image/png", sizes: "24x24" },
      { url: `/favicon-16x16.png?v=${ASSET_VERSION}`, type: "image/png", sizes: "16x16" },
      { url: `/favicon-192x192.png?v=${ASSET_VERSION}`, type: "image/png", sizes: "192x192" },
      { url: `/favicon-512x512.png?v=${ASSET_VERSION}`, type: "image/png", sizes: "512x512" },
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
      <body suppressHydrationWarning className="h-full bg-[#03050c] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
