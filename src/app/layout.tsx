import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SplashGate } from "@/components/footon/splash-gate";
import { Providers } from "./providers";
import "./globals.css";

const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  src: [
    { path: "../fonts/barlow-condensed-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/barlow-condensed-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/barlow-condensed-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
});

/**
 * Persian text, and every digit drawn as a Persian digit (۰–۹): a "FaNum" build
 * of Vazirmatn (scripts/build-fanum-font.py). It holds no Latin letters, so
 * Latin falls through to Geist (UI) and Barlow Condensed (display).
 */
const vazirmatn = localFont({
  variable: "--font-vazirmatn",
  display: "swap",
  src: [
    { path: "../fonts/vazirmatn-fd-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/vazirmatn-fd-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/vazirmatn-fd-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/vazirmatn-fd-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/vazirmatn-fd-800.woff2", weight: "800", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "فوتون — بازی را زنده با دوستانت پیش‌بینی کن",
  description: "پیش‌بینی زندهٔ فوتبال با دوستان، رایگان.",
};

export const viewport: Viewport = {
  themeColor: "#06140f",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`dark ${vazirmatn.variable} ${GeistSans.variable} ${GeistMono.variable} ${barlow.variable} h-full`}>
      <body className="min-h-full">
        <SplashGate>
          <Providers>{children}</Providers>
        </SplashGate>
      </body>
    </html>
  );
}
