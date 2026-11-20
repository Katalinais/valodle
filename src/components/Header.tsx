"use client";

import Link from "next/link";
import { config } from "@/config";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitch } from "./LanguageSwitch";

export function Header() {
  const { locale } = useI18n();
  return (
    <header className="flex items-center justify-between gap-2 border-b border-val-ink-3 py-3">
      <Link href={`/${locale}/`} className="font-display text-4xl leading-none tracking-wide">
        <span className="text-val-red">{config.siteName.slice(0, -3)}</span>
        <span>{config.siteName.slice(-3)}</span>
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitch />
      </div>
    </header>
  );
}
