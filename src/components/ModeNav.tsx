"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { MODES, modeHref, type ModeId } from "@/lib/modes";
import { gameKey, useGameStore } from "@/store/gameStore";
import { useToday } from "@/lib/hooks";

export function ModeNav({ current }: { current?: ModeId }) {
  const { t, locale } = useI18n();
  const today = useToday();
  const games = useGameStore((s) => s.games);
  return (
    <nav aria-label={t("nav.modes")} className="flex justify-center gap-2">
      {MODES.map((m) => {
        const won = today ? games[gameKey(m.id, today.dateKey)]?.won : false;
        const isCurrent = m.id === current;
        return (
          <Link
            key={m.id}
            href={modeHref(locale, m.id)}
            aria-current={isCurrent ? "page" : undefined}
            title={t(`modes.${m.id}.title`)}
            className={`relative grid h-12 w-12 place-items-center rounded-full border-2 text-2xl transition ${
              isCurrent
                ? "border-val-red bg-val-ink-3"
                : "border-val-ink-3 bg-val-ink-2 hover:border-val-cream"
            }`}
          >
            <span aria-hidden>{m.icon}</span>
            <span className="sr-only">
              {t(`modes.${m.id}.title`)}
              {won ? ` (${t("home.status.done")})` : ""}
            </span>
            {won && (
              <span
                aria-hidden
                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-hit text-xs text-white"
              >
                ✓
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
