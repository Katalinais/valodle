"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { MODES, modeHref } from "@/lib/modes";
import { useStoreHydrated, useToday } from "@/lib/hooks";
import { gameKey, useGameStore, visibleStreak } from "@/store/gameStore";
import { Countdown } from "@/components/Countdown";
import { challengeLabel } from "@/components/ModeShell";

export default function HomePage() {
  const { t, locale } = useI18n();
  const today = useToday();
  const hydrated = useStoreHydrated();
  const games = useGameStore((s) => s.games);
  const stats = useGameStore((s) => s.stats);

  return (
    <section className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="font-display text-4xl tracking-wide sm:text-5xl">{t("home.tagline")}</h1>
        {today && (
          <p className="mt-1 text-xs uppercase tracking-widest text-val-muted">
            {challengeLabel(t, today.dayIndex)}
          </p>
        )}
      </div>

      <ul className="grid w-full max-w-md gap-3">
        {MODES.map((m) => {
          const game = today && hydrated ? games[gameKey(m.id, today.dateKey)] : undefined;
          const status = game?.won ? "done" : game?.guesses.length ? "playing" : "new";
          const streak = today && hydrated ? visibleStreak(stats[m.id], today.dayIndex) : 0;
          return (
            <li key={m.id}>
              <Link
                href={modeHref(locale, m.id)}
                data-testid={`mode-card-${m.id}`}
                data-status={status}
                className={`group flex items-center gap-4 rounded-lg border-2 bg-val-ink-2 p-4 transition hover:-translate-y-0.5 hover:border-val-red ${
                  status === "done" ? "border-hit/70" : "border-val-ink-3"
                }`}
              >
                <span
                  aria-hidden
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-val-ink text-3xl"
                >
                  {m.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-3xl leading-none tracking-wide group-hover:text-val-red">
                    {t(`modes.${m.id}.title`)}
                  </span>
                  <span className="block text-sm text-val-muted">{t(`modes.${m.id}.desc`)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      status === "done"
                        ? "bg-hit text-white"
                        : status === "playing"
                          ? "bg-partial text-black"
                          : "bg-val-ink-3 text-val-muted"
                    }`}
                  >
                    {status === "done" ? "✔ " : ""}
                    {t(`home.status.${status}`)}
                  </span>
                  {streak > 0 && (
                    <span className="text-val-muted">
                      🔥 {t("home.streak")}: {streak}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Countdown />
    </section>
  );
}
