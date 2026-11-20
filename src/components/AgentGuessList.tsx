"use client";

import { motion } from "framer-motion";
import { agentById } from "@/data";
import { useI18n } from "@/i18n/I18nProvider";

/** Lista de intentos (más reciente arriba), en verde/rojo con icono para daltónicos. */
export function AgentGuessList({ guesses, target }: { guesses: string[]; target: string }) {
  const { locale, t } = useI18n();
  if (!guesses.length) return null;
  return (
    <ul className="mx-auto flex w-full max-w-md flex-col gap-2" data-testid="guess-list">
      {[...guesses].reverse().map((id) => {
        const agent = agentById.get(id);
        const ok = id === target;
        return (
          <motion.li
            key={id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            data-status={ok ? "hit" : "miss"}
            className={`flex items-center gap-3 rounded border-2 px-2 py-1.5 font-semibold text-white ${
              ok ? "border-hit bg-hit" : "border-miss bg-miss"
            }`}
          >
            {agent && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.icon} alt="" className="h-10 w-10 rounded bg-val-ink object-cover" />
            )}
            <span className="flex-1">{agent?.name[locale] ?? id}</span>
            <span aria-label={t(ok ? "classic.legend.hit" : "classic.legend.miss")}>
              {ok ? "✓" : "✗"}
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}
