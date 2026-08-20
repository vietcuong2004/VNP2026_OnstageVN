import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dành cho Nhãn hàng & Doanh nghiệp | Onstage VN",
  description: "Nền tảng kết nối và quản trị hợp tác với các Model, KOL, Idol hàng đầu cho chiến dịch thương hiệu.",
  openGraph: {
    type: "website",
    siteName: "Onstage VN",
    title: "Dành cho Nhãn hàng & Doanh nghiệp | Onstage VN",
    description: "Nền tảng kết nối và quản trị hợp tác với các Model, KOL, Idol hàng đầu cho chiến dịch thương hiệu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dành cho Nhãn hàng & Doanh nghiệp | Onstage VN",
    description: "Nền tảng kết nối và quản trị hợp tác với các Model, KOL, Idol hàng đầu cho chiến dịch thương hiệu.",
  },
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
