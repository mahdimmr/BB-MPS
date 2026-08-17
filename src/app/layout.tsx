import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

import { fa } from "@/lib/i18n/dictionaries/fa";
import { DEFAULT_LOCALE, directionOf } from "@/lib/i18n/config";

import "./globals.css";

/// Self-hosted at build time so the app also works on an internal network.
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${fa.app.shortName} — ${fa.app.name}`,
  description: fa.app.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} dir={directionOf(DEFAULT_LOCALE)} className={vazirmatn.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
