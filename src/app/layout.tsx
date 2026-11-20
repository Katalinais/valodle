import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { config } from "@/config";
import { dictionaries } from "@/i18n";
import "./globals.css";

const bebas = Bebas_Neue({ variable: "--font-bebas", weight: "400", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: { default: config.siteName, template: `%s · ${config.siteName}` },
  description: dictionaries[config.defaultLocale].meta.description,
};

export const viewport: Viewport = {
  themeColor: "#0f1923",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={config.defaultLocale} suppressHydrationWarning>
      <body className={`${bebas.variable} ${inter.variable} bg-stripes min-h-dvh antialiased`}>
        {children}
      </body>
    </html>
  );
}
