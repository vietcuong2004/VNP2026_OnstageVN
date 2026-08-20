import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Việc làm đã lưu",
  description: "Quản lý và theo dõi các công việc, dự án casting và chiến dịch mà bạn đã lưu để ứng tuyển tại Onstage VN.",
  openGraph: {
    title: "Việc làm đã lưu | Onstage VN",
    description: "Quản lý và theo dõi các công việc, dự án casting và chiến dịch mà bạn đã lưu để ứng tuyển tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Việc làm đã lưu | Onstage VN",
    description: "Quản lý và theo dõi các công việc, dự án casting và chiến dịch mà bạn đã lưu để ứng tuyển tại Onstage VN.",
  },
};

export default function SavedJobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
