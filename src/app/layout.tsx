import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  description:
    "Analytics dashboard for Sablier protocol metrics - token distribution, vesting, payroll, airdrops, grants and more.",
  title: "Sablier Analytics Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
