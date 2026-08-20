import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hợp tác Nhãn hàng",
  description: "Khám phá và kết nối hợp tác với các thương hiệu thời trang, mỹ phẩm và doanh nghiệp hàng đầu tại Onstage VN.",
  openGraph: {
    title: "Hợp tác Nhãn hàng | Onstage VN",
    description: "Khám phá và kết nối hợp tác với các thương hiệu thời trang, mỹ phẩm và doanh nghiệp hàng đầu tại Onstage VN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hợp tác Nhãn hàng | Onstage VN",
    description: "Khám phá và kết nối hợp tác với các thương hiệu thời trang, mỹ phẩm và doanh nghiệp hàng đầu tại Onstage VN.",
  },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
