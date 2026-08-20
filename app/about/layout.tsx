import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description: "Onstage VN - Hệ sinh thái kết nối và quản lý Idol, Model, KOL và doanh nghiệp hàng đầu Việt Nam.",
  openGraph: {
    title: "Về chúng tôi | Onstage VN",
    description: "Onstage VN - Hệ sinh thái kết nối và quản lý Idol, Model, KOL và doanh nghiệp hàng đầu Việt Nam.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Về chúng tôi | Onstage VN",
    description: "Onstage VN - Hệ sinh thái kết nối và quản lý Idol, Model, KOL và doanh nghiệp hàng đầu Việt Nam.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
