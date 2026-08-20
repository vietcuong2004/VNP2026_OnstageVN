import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt lịch Booking Talent",
  description: "Trang đặt lịch làm việc, biểu diễn và hợp tác trực tiếp với các Model, KOL, Idol hàng đầu tại Onstage VN.",
  openGraph: {
    title: "Đặt lịch Booking Talent | Onstage VN",
    description: "Trang đặt lịch làm việc, biểu diễn và hợp tác trực tiếp với các Model, KOL, Idol hàng đầu tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đặt lịch Booking Talent | Onstage VN",
    description: "Trang đặt lịch làm việc, biểu diễn và hợp tác trực tiếp với các Model, KOL, Idol hàng đầu tại Onstage VN.",
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
