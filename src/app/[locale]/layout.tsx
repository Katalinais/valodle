import { notFound } from "next/navigation";
import { config, isLocale } from "@/config";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HtmlLang } from "@/components/HtmlLang";
import { StoreHydrator } from "@/components/StoreHydrator";

export const dynamicParams = false;

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <I18nProvider locale={locale}>
      <HtmlLang />
      <StoreHydrator />
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4">
        <Header />
        <main className="flex-1 py-6">{children}</main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
