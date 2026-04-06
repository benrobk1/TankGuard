import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TankGuard - UST Compliance Tracking for Gas Stations",
  description:
    "TankGuard tracks every EPA and state compliance deadline for your underground storage tanks. Never miss an inspection, avoid $25,000/day penalties, and stay audit-ready.",
  keywords: [
    "UST compliance",
    "underground storage tank",
    "EPA compliance",
    "tank inspection",
    "gas station compliance",
    "environmental compliance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
