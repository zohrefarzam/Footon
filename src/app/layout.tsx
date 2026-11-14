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
 * Yekan Bakh (Fontiran, licensed), variable: one file for every weight, the
 * app's typeface for Persian and Latin. Its `ss01` feature (on in globals.css)
 * draws every digit as Persian (۰–۹). The file carries an axis map so CSS
 * weights mean what they say: 400 = Regular, 600 = SemiBold, 700 = Bold
 * (the font's own scale puts them at 325, 450 and 600).
 */
const yekanBakh = localFont({
  variable: "--font-yekan-bakh",
  display: "swap",
  src: [{ path: "../fonts/yekan-bakh-vf.woff2", weight: "1 1000", style: "normal" }],
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
