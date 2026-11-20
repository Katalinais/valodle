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
      className="rounded border border-val-ink-3 px-2 py-1 text-sm font-semibold uppercase hover:border-val-red"
    >
      {other}
    </Link>
  );
}
