import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shubham Bhatt | Full-Stack Developer",
  description:
    "Portfolio of Shubham Bhatt, a full-stack software engineer specializing in modern web architecture, React, Next.js, and TypeScript.",
  openGraph: {
    title: "Shubham Bhatt | Full-Stack Developer",
    description:
      "Architecting high-performance web applications and scalable software.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-950 text-zinc-50 antialiased selection:bg-zinc-800 selection:text-zinc-100`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}