"use client";

/** Pista desbloqueable tras N fallos. */
export function HintBox({
  unlocked,
  lockedText,
  children,
  testId,
}: {
  unlocked: boolean;
  lockedText: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      data-unlocked={unlocked}
      className={`rounded border px-3 py-2 text-center text-sm ${
        unlocked
          ? "border-val-red/60 bg-val-red/10 text-val-cream"
          : "border-dashed border-val-ink-3 text-val-muted"
      }`}
    >
      {unlocked ? children : `🔒 ${lockedText}`}
    </div>
  );
}
