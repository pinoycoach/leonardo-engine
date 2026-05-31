import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leonardo Engine | Renaissance AI Creative Direction",
  description: "Multi-agent AI system analyzing images through Leonardo da Vinci's mathematical principles and 30 years of photography expertise. Built for Google Gemini Hackathon 2026.",
  keywords: ["AI", "photography", "creative direction", "Leonardo da Vinci", "Gemini", "fashion photography"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
