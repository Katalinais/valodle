"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();
  return (
    <section className="text-center">
      <p className="text-val-muted">{t("home.tagline")}</p>
    </section>
  );
}
