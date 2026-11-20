"use client";

import { motion } from "framer-motion";
import { BulbIcon, LockIcon } from "./icons";

/** Pista desbloqueable tras `total` fallos; los puntos muestran cuánto falta. */
export function HintBox({
  unlocked,
  lockedText,
  children,
  testId,
  progress = 0,
  total = 0,
}: {
  unlocked: boolean;
  lockedText: string;
  children: React.ReactNode;
  testId?: string;
  progress?: number;
  total?: number;
}) {
  return (
    <div
      data-testid={testId}
      data-unlocked={unlocked}
      className={`relative overflow-hidden rounded-xl border px-3 py-2.5 text-sm transition-colors duration-500 ${
        unlocked
          ? "border-partial/50 bg-partial/10 text-val-cream"
          : "border-dashed border-white/15 bg-black/10 text-val-muted"
      }`}
    >
      {unlocked ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="flex items-center justify-center gap-2 text-center font-medium"
        >
          <BulbIcon className="h-4 w-4 shrink-0 text-partial" />
          <span>{children}</span>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="flex items-center gap-1.5">
            <LockIcon className="h-3.5 w-3.5 shrink-0" />
            {lockedText}
          </span>
          {total > 0 && (
            <span className="flex gap-1" aria-hidden>
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-4 rounded-full transition-colors ${i < progress ? "bg-partial" : "bg-white/10"}`}
                />
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
