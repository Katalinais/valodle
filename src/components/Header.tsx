"use client";

import Link from "next/link";
import { useState } from "react";
import { config } from "@/config";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { SettingsModal } from "./SettingsModal";
import { StatsModal } from "./StatsModal";

export function Header() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState<"stats" | "settings" | null>(null);
  const iconBtn =
    "grid h-9 w-9 place-items-center rounded border border-val-ink-3 text-lg hover:border-val-red";
  return (
    <header className="flex items-center justify-between gap-2 border-b border-val-ink-3 py-3">
      <Link href={`/${locale}/`} className="font-display text-4xl leading-none tracking-wide">
        <span className="text-val-red">{config.siteName.slice(0, -3)}</span>
        <span>{config.siteName.slice(-3)}</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={iconBtn}
          aria-label={t("nav.stats")}
          onClick={() => setOpen("stats")}
        >
          <span aria-hidden>📊</span>
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label={t("nav.settings")}
          onClick={() => setOpen("settings")}
        >
          <span aria-hidden>⚙️</span>
        </button>
        <LanguageSwitch />
      </div>
      <StatsModal open={open === "stats"} onClose={() => setOpen(null)} />
      <SettingsModal open={open === "settings"} onClose={() => setOpen(null)} />
    </header>
  );
}
