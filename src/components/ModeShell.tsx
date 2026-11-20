"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { ModeId } from "@/lib/modes";
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
      <header className="text-center">
        <h1 className="font-display text-5xl tracking-wide">{t(`modes.${mode}.title`)}</h1>
        <p className="text-val-muted">{t(`modes.${mode}.prompt`)}</p>
        {today && (
          <p
            className="mt-1 text-xs uppercase tracking-widest text-val-muted"
            data-testid="challenge-number"
          >
            {challengeLabel(t, today.dayIndex)}
          </p>
        )}
      </header>
      {today ? (
        children
      ) : (
        <div className="h-40 animate-pulse rounded-lg bg-val-ink-2" aria-busy="true" />
      )}
      {yesterday && (
        <p className="text-center text-sm text-val-muted">
          {t("daily.yesterday")} <strong className="text-val-cream">{yesterday}</strong>
        </p>
      )}
    </div>
  );
}
