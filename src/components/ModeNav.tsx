"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { MODES, modeHref, type ModeId } from "@/lib/modes";
import { gameKey, useGameStore } from "@/store/gameStore";
import { useToday } from "@/lib/hooks";
import { CheckIcon, ModeIcon } from "./icons";

export function ModeNav({ current }: { current?: ModeId }) {
  const { t, locale } = useI18n();
  const today = useToday();
  const games = useGameStore((s) => s.games);
  return (
    <nav aria-label={t("nav.modes")} className="flex justify-center">
      <ul className="flex gap-1 rounded-2xl border border-white/10 bg-black/20 p-1.5">
        {MODES.map((m) => {
          const won = today ? games[gameKey(m.id, today.dateKey)]?.won : false;
          const isCurrent = m.id === current;
          return (
            <li key={m.id}>
              <Link
                href={modeHref(locale, m.id)}
                aria-current={isCurrent ? "page" : undefined}
                title={t(`modes.${m.id}.title`)}
                className={`relative grid h-12 w-12 place-items-center rounded-xl transition sm:h-14 sm:w-14 ${
                  isCurrent
                    ? "bg-val-red text-white shadow-[0_0_20px_-4px_rgb(255_70_85/0.8)]"
                    : "text-val-muted hover:bg-white/5 hover:text-val-cream"
                }`}
              >
                <ModeIcon mode={m.id} className="h-6 w-6" />
                <span className="sr-only">
                  {t(`modes.${m.id}.title`)}
                  {won ? ` (${t("home.status.done")})` : ""}
                </span>
                {won && (
                  <span
                    aria-hidden
                    className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-val-ink bg-hit text-white"
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
