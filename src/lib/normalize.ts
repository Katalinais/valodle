/** Minúsculas, sin tildes ni signos: "KAY/O" → "kayo", "Écho Vándal" → "echo vandal". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Filtra y ordena opciones por consulta: primero las que empiezan por la consulta,
 * luego las que tienen una palabra que empieza por ella, luego las que la contienen.
 */
export function searchOptions<T>(
  options: readonly T[],
  query: string,
  getTexts: (o: T) => string[],
  limit = 8,
): T[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: { o: T; score: number; i: number }[] = [];
  options.forEach((o, i) => {
    let best = Infinity;
    for (const raw of getTexts(o)) {
      const t = normalize(raw);
      const compact = t.replace(/ /g, "");
      if (t.startsWith(q) || compact.startsWith(q.replace(/ /g, ""))) best = Math.min(best, 0);
      else if (t.split(" ").some((w) => w.startsWith(q))) best = Math.min(best, 1);
      else if (t.includes(q)) best = Math.min(best, 2);
    }
    if (best < Infinity) scored.push({ o, score: best, i });
  });
  return scored
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .slice(0, limit)
    .map((s) => s.o);
}
