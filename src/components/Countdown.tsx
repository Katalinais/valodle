"use client";

import { useEffect, useState } from "react";
import { msUntilNextDay } from "@/lib/daily";
import { useI18n } from "@/i18n/I18nProvider";

function parts(ms: number): string[] {
  const total = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((n) =>
    String(n).padStart(2, "0"),
  );
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
  const [h, m, s] = ms === null ? ["--", "--", "--"] : parts(ms);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="tag">{t("countdown.next")}</span>
      <time className="flex items-baseline gap-1 font-display text-4xl tracking-wider tabular-nums text-val-cream">
        <span>{h}</span>
        <span className="animate-pulse text-val-red">:</span>
        <span>{m}</span>
        <span className="animate-pulse text-val-red">:</span>
        <span>{s}</span>
      </time>
    </div>
  );
}
