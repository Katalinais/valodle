"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import type { Agent } from "@/data/schema";
import { CLASSIC_COLUMNS, compareAgents, type Cell } from "@/lib/compare";
import { formatAgentValue } from "@/lib/agentFormat";
import { SafeImg } from "./SafeImg";

const FLIP_MS = 300;

const STATUS_CLASS: Record<Cell["status"], string> = {
  hit: "bg-gradient-to-b from-[#4cbf5c] to-hit border-[#6fd27d]/60 shadow-[0_4px_14px_-6px_rgb(63_163_77/0.9)]",
  partial:
    "bg-gradient-to-b from-[#f2a03a] to-partial border-[#f7bd6e]/60 shadow-[0_4px_14px_-6px_rgb(224_138_30/0.9)]",
  miss: "bg-gradient-to-b from-[#d94452] to-miss border-[#e66f7a]/50",
  unknown: "bg-val-ink-3 border-white/10",
};

/** Icono no cromático para personas daltónicas. */
const STATUS_ICON: Record<Cell["status"], string> = {
  hit: "✓",
  partial: "~",
  miss: "✗",
  unknown: "?",
};

type Props = {
  guesses: Agent[];
  answer: Agent;
  /** Índice (en orden de intento) a partir del cual las filas se animan. */
  animateFrom: number;
};

function CellBox({
  cell,
  label,
  delay,
  animate,
  children,
  image,
}: {
  image?: React.ReactNode;
  cell: Cell;
  label: string;
  delay: number;
  animate: boolean;
  children: React.ReactNode;
}) {
  const statusText = `${label}`;
  return (
    <motion.div
      role="cell"
      aria-label={statusText}
      initial={animate ? { rotateY: 90, opacity: 0 } : false}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: FLIP_MS / 1000, delay }}
      data-status={cell.status}
      className={`relative flex h-16 w-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border p-1 text-center text-[11px] font-semibold leading-tight text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)] ${STATUS_CLASS[cell.status]}`}
    >
      {cell.arrow && (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center text-5xl font-black text-black/25"
        >
          {cell.arrow === "up" ? "▲" : "▼"}
        </span>
      )}
      {image}
      <span className="relative line-clamp-3 break-words">{children}</span>
      <span aria-hidden className="absolute bottom-0 right-1 text-[10px] opacity-90">
        {STATUS_ICON[cell.status]}
        {cell.arrow === "up" ? "↑" : cell.arrow === "down" ? "↓" : ""}
      </span>
    </motion.div>
  );
}

export function ClassicGrid({ guesses, answer, animateFrom }: Props) {
  const { t, locale } = useI18n();
  if (!guesses.length) return null;
  const columns = ["agent", ...CLASSIC_COLUMNS] as const;
  const statusWord = (c: Cell) =>
    `${t(`classic.legend.${c.status}`)}${c.arrow ? `, ${t(`classic.legend.${c.arrow === "up" ? "higher" : "lower"}`)}` : ""}`;

  // El intento más reciente arriba.
  const rows = guesses.map((g, i) => ({ g, i })).reverse();

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2" data-testid="classic-grid">
      <div
        role="table"
        aria-label={t("modes.classic.title")}
        className="mx-auto w-max space-y-1.5 [perspective:800px]"
      >
        <div role="row" className="flex gap-1.5">
          {columns.map((c) => (
            <div
              key={c}
              role="columnheader"
              className="w-16 shrink-0 border-b-2 border-val-red/40 pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-val-muted"
            >
              {t(`classic.columns.${c}`)}
            </div>
          ))}
        </div>
        {rows.map(({ g, i }) => {
          const result = compareAgents(g, answer);
          const animate = i >= animateFrom;
          return (
            <div role="row" key={g.id} className="flex gap-1.5" data-testid="classic-row">
              <CellBox
                cell={result.agent}
                label={`${g.name[locale]}: ${statusWord(result.agent)}`}
                delay={0}
                animate={animate}
                image={
                  <SafeImg
                    src={g.icon}
                    alt={g.name[locale]}
                    fallback={g.name[locale]}
                    className="absolute inset-0 h-full w-full object-cover text-xl"
                  />
                }
              >
                {null}
              </CellBox>
              {CLASSIC_COLUMNS.map((c, ci) => {
                const value = formatAgentValue(g, c, locale, t);
                return (
                  <CellBox
                    key={c}
                    cell={result[c]}
                    label={`${t(`classic.columns.${c}`)}: ${value}, ${statusWord(result[c])}`}
                    delay={animate ? ((ci + 1) * FLIP_MS) / 1000 : 0}
                    animate={animate}
                  >
                    {value}
                  </CellBox>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClassicLegend() {
  const { t } = useI18n();
  const items: [Cell["status"], string][] = [
    ["hit", t("classic.legend.hit")],
    ["partial", t("classic.legend.partial")],
    ["miss", t("classic.legend.miss")],
    ["unknown", t("classic.legend.unknown")],
  ];
  return (
    <ul className="flex flex-wrap justify-center gap-3 text-xs text-val-muted">
      {items.map(([s, label]) => (
        <li key={s} className="flex items-center gap-1">
          <span
            aria-hidden
            className={`grid h-4 w-4 place-items-center rounded-sm border text-[9px] text-white ${STATUS_CLASS[s]}`}
          >
            {STATUS_ICON[s]}
          </span>
          {label}
        </li>
      ))}
      <li className="flex items-center gap-1">▲ {t("classic.legend.higher")}</li>
      <li className="flex items-center gap-1">▼ {t("classic.legend.lower")}</li>
    </ul>
  );
}
