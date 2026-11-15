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
 * Yekan Bakh (Fontiran, licensed): the app's typeface for Persian and Latin.
 * Static files, one per weight (400 Regular … 900 Black), cut from the
 * variable master with the `ss01` digits baked in, so every digit draws as
 * Persian (۰–۹) and every weight renders the same in every browser. The
 * variable file relied on an `avar` remap that Chrome on macOS ignores, which
 * left weights wrong there.
 */
const yekanBakh = localFont({
  variable: "--font-yekan-bakh",
  display: "swap",
  src: [
    { path: "../fonts/yekan-bakh-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/yekan-bakh-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/yekan-bakh-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/yekan-bakh-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/yekan-bakh-800.woff2", weight: "800", style: "normal" },
    { path: "../fonts/yekan-bakh-900.woff2", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "لاکی فن: بازی را زنده با دوستات پیش‌بینی کن",
  description: "فوتبال رو زنده با دوستات پیش‌بینی کن. رایگانه.",
};

export const viewport: Viewport = {
  themeColor: "#06140f",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`dark ${yekanBakh.variable} ${GeistSans.variable} ${GeistMono.variable} ${barlow.variable} h-full`}>
      <body className="min-h-full">
        <SplashGate>
          <Providers>{children}</Providers>
        </SplashGate>
      </body>
    </html>
  );
}
