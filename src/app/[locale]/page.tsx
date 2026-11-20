"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { MODES, modeHref } from "@/lib/modes";
import { useStoreHydrated, useToday } from "@/lib/hooks";
import { gameKey, useGameStore, visibleStreak } from "@/store/gameStore";
import { Countdown } from "@/components/Countdown";
import { challengeLabel } from "@/components/ModeShell";
import { ArrowRightIcon, CheckIcon, FlameIcon, ModeIcon } from "@/components/icons";
import mapRegistry from "@/data/generated/registry/map.json";

/** Modos sin datos todavía (pool vacío): se muestran como "Próximamente". */
const SOON = new Set<string>(Object.keys(mapRegistry).length ? [] : ["map"]);

export default function HomePage() {
  const { t, locale } = useI18n();
  const today = useToday();
  const hydrated = useStoreHydrated();
  const games = useGameStore((s) => s.games);
  const stats = useGameStore((s) => s.stats);
  const ready = today !== null && hydrated;

  const statuses = MODES.map((m) => {
    const game = ready ? games[gameKey(m.id, today.dateKey)] : undefined;
    if (SOON.has(m.id)) return "soon";
    return game?.won ? "done" : game?.guesses.length ? "playing" : "new";
  });
  const done = statuses.filter((s) => s === "done").length;
  const playable = statuses.filter((s) => s !== "soon").length;

  return (
    <section className="flex flex-col items-center gap-7">
      <div className="animate-float-in text-center">
        <p className="tag justify-center">
          {today ? challengeLabel(t, today.dayIndex) : t("home.today")}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-[0.95] tracking-wide sm:text-6xl">
          {t("home.tagline")}
        </h1>
      </div>

      {/* Progreso del día */}
      <div className="w-full max-w-md" aria-live="polite">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-val-muted">
          <span>{t("home.today")}</span>
          <span data-testid="daily-progress">{t("home.progress", { done, total: playable })}</span>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {statuses.map((s, i) =>
            s === "soon" ? null : (
              <span
                key={MODES[i].id}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  s === "done"
                    ? "bg-hit shadow-[0_0_8px_rgb(63_163_77/0.7)]"
                    : s === "playing"
                      ? "bg-partial"
                      : "bg-white/10"
                }`}
              />
            ),
          )}
        </div>
      </div>

      <ul className="grid w-full max-w-md gap-3">
        {MODES.map((m, i) => {
          const status = statuses[i];
          const streak = ready ? visibleStreak(stats[m.id], today.dayIndex) : 0;
          return (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
            >
              <Link
                href={modeHref(locale, m.id)}
                data-testid={`mode-card-${m.id}`}
                data-status={status}
                className={`panel group flex items-center gap-4 p-4 transition duration-200 ${status === "soon" ? "opacity-60" : ""} hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgb(255_70_85/0.45)]`}
              >
                <span
                  className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-xl transition ${
                    status === "done"
                      ? "bg-hit/15 text-hit"
                      : "bg-val-red/10 text-val-red group-hover:bg-val-red group-hover:text-white"
                  }`}
                >
                  <ModeIcon mode={m.id} className="h-7 w-7" />
                  {status === "done" && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-val-ink-2 bg-hit text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-3xl leading-none tracking-wide">
                    {t(`modes.${m.id}.title`)}
                  </span>
                  <span className="mt-0.5 block text-sm text-val-muted">
                    {t(`modes.${m.id}.desc`)}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        status === "done"
                          ? "bg-hit/15 text-hit"
                          : status === "playing"
                            ? "bg-partial/15 text-partial"
                            : "bg-white/5 text-val-muted"
                      }`}
                    >
                      {t(`home.status.${status}`)}
                    </span>
                    {streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-partial">
                        <FlameIcon className="h-3.5 w-3.5" />
                        {t("home.streak")}: {streak}
                      </span>
                    )}
                  </span>
                </span>
                <ArrowRightIcon className="h-5 w-5 shrink-0 text-val-muted transition group-hover:translate-x-1 group-hover:text-val-red" />
              </Link>
            </motion.li>
          );
        })}
      </ul>
      <Countdown />
    </section>
  );
}
