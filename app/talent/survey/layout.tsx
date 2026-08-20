import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký nhanh",
  description: "Cổng đăng ký nhanh thông tin cá nhân, tải lên portfolio ảnh lookbook và gia nhập mạng lưới Idol Onstage VN.",
  openGraph: {
    title: "Đăng ký nhanh | Onstage VN",
    description: "Cổng đăng ký nhanh thông tin cá nhân, tải lên portfolio ảnh lookbook và gia nhập mạng lưới Idol Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đăng ký nhanh | Onstage VN",
    description: "Cổng đăng ký nhanh thông tin cá nhân, tải lên portfolio ảnh lookbook và gia nhập mạng lưới Idol Onstage VN.",
  },
};

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
