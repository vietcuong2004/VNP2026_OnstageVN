import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Idol",
  description: "Quản lý danh sách đội ngũ Idol, Model độc quyền và theo dõi hiệu suất hợp tác của nhãn hàng tại Onstage VN.",
  openGraph: {
    title: "Quản lý Idol | Onstage VN",
    description: "Quản lý danh sách đội ngũ Idol, Model độc quyền và theo dõi hiệu suất hợp tác của nhãn hàng tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quản lý Idol | Onstage VN",
    description: "Quản lý danh sách đội ngũ Idol, Model độc quyền và theo dõi hiệu suất hợp tác của nhãn hàng tại Onstage VN.",
  },
};

export default function MyTalentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
