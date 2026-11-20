"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { MODES, type ModeId } from "@/lib/modes";
import { useToday } from "@/lib/hooks";
import { HISTOGRAM_MAX, useGameStore, visibleStreak } from "@/store/gameStore";
import { Modal } from "./Modal";

export function StatsModal({
  open,
  onClose,
  initialMode,
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: ModeId;
}) {
  const { t } = useI18n();
  const today = useToday();
  const [mode, setMode] = useState<ModeId>(initialMode ?? "classic");
  const stats = useGameStore((s) => s.stats[mode]);
  const streak = today ? visibleStreak(stats, today.dayIndex) : stats.currentStreak;
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const buckets = Array.from({ length: HISTOGRAM_MAX }, (_, i) => String(i + 1));
  const max = Math.max(1, ...buckets.map((b) => stats.histogram[b] ?? 0));

  return (
    <Modal open={open} onClose={onClose} title={t("stats.title")} closeLabel={t("stats.close")}>
      <div role="tablist" className="mb-4 flex justify-between gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            type="button"
            aria-selected={mode === m.id}
            title={t(`modes.${m.id}.title`)}
            onClick={() => setMode(m.id)}
            className={`flex-1 rounded px-1 py-2 text-xl ${mode === m.id ? "bg-val-ink-3" : "hover:bg-val-ink"}`}
          >
            <span aria-hidden>{m.icon}</span>
            <span className="sr-only">{t(`modes.${m.id}.title`)}</span>
          </button>
        ))}
      </div>
      <p className="mb-3 text-center font-display text-2xl tracking-wide">
        {t(`modes.${mode}.title`)}
      </p>
      <dl className="mb-5 grid grid-cols-4 gap-2 text-center" data-testid="stats-summary">
        {[
          [t("stats.played"), stats.played],
          [t("stats.winRate"), winRate],
          [t("stats.streak"), streak],
          [t("stats.maxStreak"), stats.maxStreak],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dd className="font-display text-4xl">{value}</dd>
            <dt className="text-[11px] leading-tight text-val-muted">{label}</dt>
          </div>
        ))}
      </dl>
      <h3 className="mb-2 text-sm font-semibold">{t("stats.histogram")}</h3>
      <ol className="space-y-1">
        {buckets.map((b) => {
          const n = stats.histogram[b] ?? 0;
          return (
            <li key={b} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-right tabular-nums text-val-muted">
                {b === String(HISTOGRAM_MAX) ? `${b}+` : b}
              </span>
              <span
                className={`rounded-sm px-1.5 text-right text-xs font-semibold leading-5 ${n ? "bg-val-red text-white" : "bg-val-ink-3 text-val-muted"}`}
                style={{ width: `${Math.max(8, (n / max) * 100)}%` }}
              >
                {n}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-center text-xs text-val-muted">{t("stats.local")}</p>
    </Modal>
  );
}
