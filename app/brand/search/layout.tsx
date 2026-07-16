import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OnstageVN - Tim kiem Talent",
  description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
  openGraph: {
    type: "website",
    url: "https://onstagevn.vercel.app/brand/search",
    siteName: "OnstageVN",
    title: "OnstageVN - Tim kiem Talent",
    description: "Tim kiem va ket noi talent phu hop cho chien dich cua doanh nghiep.",
    images: [
      {
        url: "https://onstagevn.vercel.app/apple-touch-icon.png?v=7",
        secureUrl: "https://onstagevn.vercel.app/apple-touch-icon.png?v=7",
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
    images: ["https://onstagevn.vercel.app/apple-touch-icon.png?v=7"],
  },
};

export default function BrandSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
