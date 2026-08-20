import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Idol đã lưu",
  description: "Danh sách các Idol, Model và KOL được nhãn hàng lưu lại để chuẩn bị cho các chiến dịch quảng bá.",
  openGraph: {
    title: "Idol đã lưu | Onstage VN",
    description: "Danh sách các Idol, Model và KOL được nhãn hàng lưu lại để chuẩn bị cho các chiến dịch quảng bá.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Idol đã lưu | Onstage VN",
    description: "Danh sách các Idol, Model và KOL được nhãn hàng lưu lại để chuẩn bị cho các chiến dịch quảng bá.",
  },
};

export default function ShortlistsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
