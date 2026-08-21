import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description: "Tìm hiểu tầm nhìn, sứ mệnh và hệ sinh thái Onstage VN — bệ phóng phát triển sự nghiệp và kết nối thương hiệu cho Idol, Model và Nhà sáng tạo nội dung.",
  openGraph: {
    title: "Về chúng tôi | Onstage VN",
    description: "Tìm hiểu tầm nhìn, sứ mệnh và hệ sinh thái Onstage VN — bệ phóng phát triển sự nghiệp và kết nối thương hiệu cho Idol, Model và Nhà sáng tạo nội dung.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Về chúng tôi | Onstage VN",
    description: "Tìm hiểu tầm nhìn, sứ mệnh và hệ sinh thái Onstage VN — bệ phóng phát triển sự nghiệp và kết nối thương hiệu cho Idol, Model và Nhà sáng tạo nội dung.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
