"use client";

import { config } from "@/config";
import { useI18n } from "@/i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();
  const [before, after] = t("footer.credits", { api: "\u0000" }).split("\u0000");
  return (
    <footer className="mt-6 space-y-2 border-t border-white/5 py-6 text-center text-[11px] leading-relaxed text-val-muted/80">
      <p className="font-semibold text-val-muted">
        {t("footer.fanProject")} · {before}
        <a
          href="https://valorant-api.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-val-red/50 underline-offset-2 hover:text-val-cream"
        >
          valorant-api.com
        </a>
        {after}
      </p>
      <p className="mx-auto max-w-xl">{t("footer.disclaimer", { site: config.siteName })}</p>
    </footer>
  );
}
