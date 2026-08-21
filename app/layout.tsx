import type { Metadata, Viewport } from "next";
import AppShell from "./app-shell";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const ASSET_VERSION = "10";
const FAVICON_VERSION = "12";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Onstage VN - Nền tảng kết nối & Booking Idol, Model hàng đầu",
    template: "Onstage VN - %s",
  },
  description: "Nền tảng kết nối và booking Idol, Model, MC, Livestreamer và KOLs chuyên nghiệp dành cho nhãn hàng và sự kiện tại Việt Nam.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Onstage VN",
    title: "Onstage VN - Nền tảng kết nối & Booking Idol, Model hàng đầu",
    description: "Nền tảng kết nối và booking Idol, Model, MC, Livestreamer và KOLs chuyên nghiệp dành cho nhãn hàng và sự kiện tại Việt Nam.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onstage VN - Nền tảng kết nối & Booking Idol, Model hàng đầu",
    description: "Nền tảng kết nối và booking Idol, Model, MC, Livestreamer và KOLs chuyên nghiệp dành cho nhãn hàng và sự kiện tại Việt Nam.",
  },
  icons: {
    icon: [
      { url: `/logo_icon.png?v=${FAVICON_VERSION}`, type: "image/png", sizes: "any" },
    ],
    apple: [
      { url: `/apple-touch-icon.png?v=${ASSET_VERSION}`, sizes: "180x180" },
    ],
  },
  manifest: `/site.webmanifest?v=${ASSET_VERSION}`,
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className="h-full light antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="h-full bg-white text-[#191116] font-sans selection:bg-[#E8CF91]/40 selection:text-[#8F0709] dark:bg-[#03050c] dark:text-slate-100 dark:selection:bg-amber-500/30 dark:selection:text-amber-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
