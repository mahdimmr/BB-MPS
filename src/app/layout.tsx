import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

import { getTranslations } from "@/lib/i18n/server";

import "./globals.css";

/// Self-hosted at build time so the app also works on an internal network.
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();

  return {
    title: `${t.app.shortName} — ${t.app.name}`,
    description: t.app.tagline,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getTranslations();

  return (
    <html lang={locale} dir={dir} className={vazirmatn.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
