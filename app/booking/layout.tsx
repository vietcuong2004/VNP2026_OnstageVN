import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt lịch booking",
  description: "Trang đặt lịch làm việc, biểu diễn và hợp tác trực tiếp với các Model, KOL, Idol hàng đầu tại Onstage VN.",
  openGraph: {
    title: "Đặt lịch booking | Onstage VN",
    description: "Trang đặt lịch làm việc, biểu diễn và hợp tác trực tiếp với các Model, KOL, Idol hàng đầu tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đặt lịch booking | Onstage VN",
    description: "Trang đặt lịch làm việc, biểu diễn và hợp tác trực tiếp với các Model, KOL, Idol hàng đầu tại Onstage VN.",
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
