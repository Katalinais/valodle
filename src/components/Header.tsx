"use client";

import Link from "next/link";
import { useState } from "react";
import { config } from "@/config";
import { useI18n } from "@/i18n/I18nProvider";
import { CrosshairIcon, SettingsIcon, StatsIcon } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";
import { SettingsModal } from "./SettingsModal";
import { StatsModal } from "./StatsModal";

export function Header() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState<"stats" | "settings" | null>(null);
  const iconBtn =
    "grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-val-muted transition hover:border-val-red/60 hover:text-val-cream";
  return (
    <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-2 border-b border-white/5 bg-val-ink/80 px-4 py-3 backdrop-blur-md">
      <Link href={`/${locale}/`} className="group flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-val-red text-white shadow-[0_0_18px_-2px_rgb(255_70_85/0.7)] transition group-hover:rotate-90">
          <CrosshairIcon className="h-6 w-6" />
        </span>
        <span className="font-display text-3xl leading-none tracking-wide">
          <span className="text-val-red">{config.siteName.slice(0, -3)}</span>
          <span>{config.siteName.slice(-3)}</span>
        </span>
      </Link>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={iconBtn}
          aria-label={t("nav.stats")}
          onClick={() => setOpen("stats")}
        >
          <StatsIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label={t("nav.settings")}
          onClick={() => setOpen("settings")}
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
        <LanguageSwitch />
      </div>
      <StatsModal open={open === "stats"} onClose={() => setOpen(null)} />
      <SettingsModal open={open === "settings"} onClose={() => setOpen(null)} />
    </header>
  );
}
