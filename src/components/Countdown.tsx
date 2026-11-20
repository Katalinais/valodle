"use client";

import { useEffect, useState } from "react";
import { msUntilNextDay } from "@/lib/daily";
import { useI18n } from "@/i18n/I18nProvider";

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function Countdown() {
  const { t } = useI18n();
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setMs(msUntilNextDay());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="text-sm text-val-muted">
      {t("countdown.next")}{" "}
      <time className="font-display text-2xl tracking-wider text-val-cream tabular-nums">
        {ms === null ? "--:--:--" : format(ms)}
      </time>
    </p>
  );
}
