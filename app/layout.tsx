import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Trading Space",
  description: "Smart Trading Space - a cinematic market news, signals, and dimensions board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-x-hidden overflow-y-auto">{children}</body>
    </html>
  );
}
