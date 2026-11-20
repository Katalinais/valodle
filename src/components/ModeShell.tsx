"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { MODE_IDS, type ModeId } from "@/lib/modes";
import type { Today } from "@/lib/hooks";
import { ModeNav } from "./ModeNav";

type Props = {
  mode: ModeId;
  today: Today | null;
  /** Nombre de la respuesta de ayer (ya localizado), si existe. */
  yesterday?: string | null;
  children: React.ReactNode;
};

export function challengeLabel(
  t: (k: string, v?: Record<string, string | number>) => string,
  dayIndex: number,
) {
  return dayIndex >= 0 ? t("daily.challenge", { n: dayIndex + 1 }) : t("daily.preseason");
}

/** Marco común de cada modo: navegación, título, nº de reto y respuesta de ayer. */
export function ModeShell({ mode, today, yesterday, children }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-5">
      <ModeNav current={mode} />
      <header className="animate-float-in text-center">
        <p className="tag justify-center">
          {t("modes.label", { n: MODE_IDS.indexOf(mode) + 1, total: MODE_IDS.length })}
        </p>
        <h1 className="mt-1 font-display text-6xl leading-none tracking-wide drop-shadow-[0_2px_12px_rgb(255_70_85/0.25)]">
          {t(`modes.${mode}.title`)}
        </h1>
        <p className="mt-1 text-val-muted">{t(`modes.${mode}.prompt`)}</p>
        {today && (
          <p
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-val-muted"
            data-testid="challenge-number"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-val-red" aria-hidden />
            {challengeLabel(t, today.dayIndex)}
          </p>
        )}
      </header>
      {today ? children : <div className="panel h-48 animate-pulse" aria-busy="true" />}
      {yesterday && (
        <p className="text-center text-sm text-val-muted">
          {t("daily.yesterday")} <strong className="text-val-cream">{yesterday}</strong>
        </p>
      )}
    </div>
  );
}
