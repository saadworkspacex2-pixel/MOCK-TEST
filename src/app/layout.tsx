import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSettings, brandingFrom } from "@/lib/settings";
import { buildThemeCss } from "@/lib/themeCss";
import InjectCode from "@/components/InjectCode";
import { BrandProvider } from "@/components/BrandProvider";

// Self-hosted fonts (bundled with the app, no external CDN requests).
// This keeps Bangla + English typography working in every deploy environment.
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/hind-siliguri/300.css";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.seo_title,
    description: s.seo_description,
    keywords: s.seo_keywords,
    applicationName: s.site_name,
    icons: {
      icon: [{ url: "/api/favicon" }],
      shortcut: [{ url: "/api/favicon" }],
      apple: [{ url: "/api/favicon" }],
    },
    openGraph: {
      title: s.seo_title,
      description: s.seo_description,
      siteName: s.site_name,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const s = await getSettings();
  return (
    <html lang="bn">
      <body className="bg-[#F8F9FA] text-[#1A1A1A] antialiased">
        <style
          id="lhbd-theme"
          dangerouslySetInnerHTML={{ __html: buildThemeCss(s) }}
        />
        <InjectCode html={s.header_code ?? ""} target="head" />
        <BrandProvider value={brandingFrom(s)}>{children}</BrandProvider>
        <InjectCode html={s.footer_code ?? ""} target="body" />
      </body>
    </html>
  );
}
