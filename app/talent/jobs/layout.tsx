import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cơ hội việc làm",
  description: "Danh sách các chiến dịch tuyển dụng, casting TVC, chụp lookbook thời trang và livestream dành cho Idol & Model tại Onstage VN.",
  openGraph: {
    title: "Cơ hội việc làm | Onstage VN",
    description: "Danh sách các chiến dịch tuyển dụng, casting TVC, chụp lookbook thời trang và livestream dành cho Idol & Model tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cơ hội việc làm | Onstage VN",
    description: "Danh sách các chiến dịch tuyển dụng, casting TVC, chụp lookbook thời trang và livestream dành cho Idol & Model tại Onstage VN.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
