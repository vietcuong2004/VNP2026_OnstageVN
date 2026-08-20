import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm kiếm Idol",
  description: "Khám phá danh bạ hàng trăm Idol, Model, KOL và Influencer chuyên nghiệp hàng đầu trên Onstage VN.",
  openGraph: {
    title: "Tìm kiếm Idol | Onstage VN",
    description: "Khám phá danh bạ hàng trăm Idol, Model, KOL và Influencer chuyên nghiệp hàng đầu trên Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tìm kiếm Idol | Onstage VN",
    description: "Khám phá danh bạ hàng trăm Idol, Model, KOL và Influencer chuyên nghiệp hàng đầu trên Onstage VN.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
