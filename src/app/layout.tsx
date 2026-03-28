import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const GeistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const GeistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MechKeys — Precision Crafted Keyboards",
  description:
    "An immersive 3D experience exploring mechanical keyboard craftsmanship.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
