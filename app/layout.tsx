import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Trading Space",
  description: "Smart Trading Space - a trading news and signals dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden flex flex-col bg-[radial-gradient(circle_at_top_left,#fff9df_0%,#f7f5ee_32%,#eef2ff_100%)] text-slate-900">
        {children}
      </body>
    </html>
  );
}
