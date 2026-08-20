import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yêu cầu của tôi",
  description: "Theo dõi trạng thái, tiến độ và lịch trình các yêu cầu booking Idol & Model của nhãn hàng tại Onstage VN.",
  openGraph: {
    title: "Yêu cầu của tôi | Onstage VN",
    description: "Theo dõi trạng thái, tiến độ và lịch trình các yêu cầu booking Idol & Model của nhãn hàng tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yêu cầu của tôi | Onstage VN",
    description: "Theo dõi trạng thái, tiến độ và lịch trình các yêu cầu booking Idol & Model của nhãn hàng tại Onstage VN.",
  },
};

export default function MyBookingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
