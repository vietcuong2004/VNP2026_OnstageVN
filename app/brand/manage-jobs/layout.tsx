import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Job & Quản lý tuyển dụng",
  description: "Đăng tin tuyển dụng casting, quản lý chiến dịch quảng cáo và tiếp nhận hồ sơ ứng tuyển từ các Idol tại Onstage VN.",
  openGraph: {
    title: "Tạo Job & Quản lý tuyển dụng | Onstage VN",
    description: "Đăng tin tuyển dụng casting, quản lý chiến dịch quảng cáo và tiếp nhận hồ sơ ứng tuyển từ các Idol tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tạo Job & Quản lý tuyển dụng | Onstage VN",
    description: "Đăng tin tuyển dụng casting, quản lý chiến dịch quảng cáo và tiếp nhận hồ sơ ứng tuyển từ các Idol tại Onstage VN.",
  },
};

export default function ManageJobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
