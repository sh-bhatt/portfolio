import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const SITE_URL = "https://shubham-bhatt-portfolio.vercel.app";
const TITLE = "Shubham Bhatt — Full-Stack Developer";
const DESCRIPTION =
  "Full-stack developer specializing in React, Next.js, TypeScript, and Node.js. Building scalable web applications and AI-powered products.";

// The share image comes from app/opengraph-image.tsx; Next.js adds its og:image tags automatically
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Shubham Bhatt",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-zinc-950 text-zinc-50 antialiased selection:bg-zinc-800 selection:text-zinc-100"
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}