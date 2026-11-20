export type ShareInput = {
  siteName: string;
  modeLabel: string;
  challengeLabel: string;
  attemptsLabel: string;
  /** Una línea de cuadrados por intento (Clásico) o una sola línea para el resto. */
  rows: string[];
  url: string;
  extra?: string[];
};

export const SQUARE = { hit: "🟩", partial: "🟧", miss: "🟥" } as const;

const MAX_ROWS = 6;

export function buildShareText(input: ShareInput): string {
  const rows =
    input.rows.length > MAX_ROWS
      ? [...input.rows.slice(0, MAX_ROWS - 1), `… +${input.rows.length - (MAX_ROWS - 1)}`]
      : input.rows;
  return [
    `${input.siteName} · ${input.modeLabel} · ${input.challengeLabel}`,
    input.attemptsLabel,
    ...rows,
    ...(input.extra ?? []),
    input.url,
  ].join("\n");
}

/** Línea simple: fallos en rojo y el acierto en verde ("🟥🟥🟩"). */
export function simpleRow(attempts: number, max = 12): string {
  const misses = Math.max(0, attempts - 1);
  const shown = Math.min(misses, max);
  return SQUARE.miss.repeat(shown) + (misses > shown ? `+${misses - shown}` : "") + SQUARE.hit;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
