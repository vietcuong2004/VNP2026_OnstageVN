import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
  description: "Xem và quản lý thông tin cá nhân, hình ảnh nghệ thuật và hoạt động của bạn tại Onstage VN.",
  openGraph: {
    title: "Hồ sơ cá nhân | Onstage VN",
    description: "Xem và quản lý thông tin cá nhân, hình ảnh nghệ thuật và hoạt động của bạn tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hồ sơ cá nhân | Onstage VN",
    description: "Xem và quản lý thông tin cá nhân, hình ảnh nghệ thuật và hoạt động của bạn tại Onstage VN.",
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
