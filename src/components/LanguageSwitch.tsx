"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

export function LanguageSwitch() {
  const { locale, t } = useI18n();
  const pathname = usePathname() ?? `/${locale}/`;
  const other = locale === "es" ? "en" : "es";
  const target = pathname.replace(/^\/(es|en)(?=\/|$)/, `/${other}`);
  return (
    <Link
      href={target}
      hrefLang={other}
      aria-label={`${t("nav.language")}: ${t("nav.switchTo")}`}
      className="grid h-10 min-w-10 place-items-center rounded-lg border border-white/10 bg-white/5 px-2 text-xs font-bold uppercase tracking-widest text-val-muted transition hover:border-val-red/60 hover:text-val-cream"
    >
      {other}
    </Link>
  );
}
