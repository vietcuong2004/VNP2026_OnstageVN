import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dành cho Model & Idol | Onstage VN",
  description: "Bệ phóng tài năng, kết nối cơ hội việc làm, casting và hợp tác với các thương hiệu hàng đầu.",
  openGraph: {
    type: "website",
    siteName: "Onstage VN",
    title: "Dành cho Model & Idol | Onstage VN",
    description: "Bệ phóng tài năng, kết nối cơ hội việc làm, casting và hợp tác với các thương hiệu hàng đầu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dành cho Model & Idol | Onstage VN",
    description: "Bệ phóng tài năng, kết nối cơ hội việc làm, casting và hợp tác với các thương hiệu hàng đầu.",
  },
};

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
