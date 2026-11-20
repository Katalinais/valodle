"use client";

import { config } from "@/config";
import { useI18n } from "@/i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();
  const [before, after] = t("footer.credits", { api: "\u0000" }).split("\u0000");
  return (
    <footer className="space-y-2 border-t border-val-ink-3 py-6 text-center text-xs text-val-muted">
      <p>{t("footer.fanProject")}</p>
      <p>
        {before}
        <a
          href="https://valorant-api.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-val-cream"
        >
          valorant-api.com
        </a>
        {after}
      </p>
      <p className="mx-auto max-w-xl leading-relaxed">
        {t("footer.disclaimer", { site: config.siteName })}
      </p>
    </footer>
  );
}
