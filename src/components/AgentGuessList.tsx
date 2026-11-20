"use client";

import { AnimatePresence, motion } from "framer-motion";
import { agentById } from "@/data";
import { useI18n } from "@/i18n/I18nProvider";
import { CheckIcon, CrossIcon } from "./icons";
import { SafeImg } from "./SafeImg";

/** Lista de intentos (más reciente arriba), en verde/rojo con icono para daltónicos. */
export function AgentGuessList({ guesses, target }: { guesses: string[]; target: string }) {
  const { locale, t } = useI18n();
  if (!guesses.length) return null;
  return (
    <ul className="mx-auto flex w-full max-w-md flex-col gap-2" data-testid="guess-list">
      <AnimatePresence initial={false}>
        {[...guesses].reverse().map((id) => {
          const agent = agentById.get(id);
          const ok = id === target;
          const name = agent?.name[locale] ?? id;
          return (
            <motion.li
              key={id}
              layout
              initial={{ opacity: 0, x: ok ? 0 : -16, scale: ok ? 0.9 : 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              data-status={ok ? "hit" : "miss"}
              className={`flex items-center gap-3 overflow-hidden rounded-xl border p-1.5 pr-3 font-semibold ${
                ok
                  ? "border-hit/60 bg-gradient-to-r from-hit/35 to-hit/10 text-white"
                  : "border-miss/40 bg-gradient-to-r from-miss/25 to-transparent text-val-cream"
              }`}
            >
              {agent && (
                <SafeImg
                  src={agent.icon}
                  alt=""
                  fallback={name}
                  className="h-11 w-11 shrink-0 rounded-lg bg-val-ink object-cover text-base"
                />
              )}
              <span className="flex-1 truncate">{name}</span>
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${ok ? "bg-hit" : "bg-miss/80"} text-white`}
                aria-label={t(ok ? "classic.legend.hit" : "classic.legend.miss")}
              >
                {ok ? <CheckIcon className="h-4 w-4" /> : <CrossIcon className="h-3.5 w-3.5" />}
              </span>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
