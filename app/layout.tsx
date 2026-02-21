import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "莎拉型態學 AI 看盤系統",
  description: "K線 x 均線 x 停損停利 - AI股票分析工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
