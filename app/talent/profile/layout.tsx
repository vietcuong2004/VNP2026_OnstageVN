import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân & Portfolio",
  description: "Hồ sơ cá nhân comp-card chuyên nghiệp, hình ảnh lookbook và thông tin nghệ sĩ tại Onstage VN.",
  openGraph: {
    title: "Hồ sơ cá nhân & Portfolio | Onstage VN",
    description: "Hồ sơ cá nhân comp-card chuyên nghiệp, hình ảnh lookbook và thông tin nghệ sĩ tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hồ sơ cá nhân & Portfolio | Onstage VN",
    description: "Hồ sơ cá nhân comp-card chuyên nghiệp, hình ảnh lookbook và thông tin nghệ sĩ tại Onstage VN.",
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
