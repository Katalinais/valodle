/**
 * Reto diario: fecha → día → respuesta.
 *
 * ## Cómo se elige la respuesta
 * Cada modo tiene un *registro* (`src/data/generated/registry/<modo>.json`) que asocia
 * cada elemento del pool con la fecha en que entró al juego. El registro es *append-only*:
 * `npm run data` añade los elementos nuevos con fecha = mañana (o EPOCH si aún no se ha
 * lanzado), nunca borra ni cambia fechas.
 *
 * La secuencia de respuestas se construye por ciclos a partir del día 0 (EPOCH):
 * 1. Un ciclo empieza en el día `start` con todos los elementos añadidos en o antes de `start`,
 *    barajados con mulberry32 sembrado con `hash(modo | SALT | ciclo)`.
 * 2. Si durante el ciclo entra un elemento nuevo (fecha ≤ último día del ciclo), se añade
 *    **al final** del ciclo. Como su posición siempre es posterior a su fecha de alta, ningún
 *    día ya jugado cambia.
 * 3. Al acabar el ciclo empieza otro con una baraja nueva. Dentro de un ciclo no hay repeticiones.
 *
 * Así, el día N toma la posición N de la secuencia (equivale a `N % pool.length` mientras el
 * pool no cambia) y añadir agentes/skins nunca altera respuestas pasadas.
 */
import { config } from "@/config";

export type Registry = Record<string, string>; // id → "YYYY-MM-DD" (fecha de alta)

const DAY_MS = 86_400_000;

/* ---------------- hash y PRNG ---------------- */

/** Hash de cadena de 32 bits (cyrb53 truncado): rápido y bien distribuido. */
export function hashString(str: string): number {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ h2) >>> 0;
}

/** PRNG determinista mulberry32: devuelve floats en [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Semilla del día para elecciones secundarias (rotación, frase, etc.). */
export function daySeed(dateKey: string, mode: string, salt: string = config.salt): number {
  return hashString(`${dateKey}|${mode}|${salt}`);
}

/* ---------------- fechas ---------------- */

/** "YYYY-MM-DD" de `date` en la zona horaria dada. */
export function dateKeyIn(date: Date, timeZone: string = config.timeZone): string {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function keyToDayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function dayNumberToKey(n: number): string {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

/** Días desde EPOCH (puede ser negativo antes del lanzamiento). */
export function dayIndexOf(dateKey: string, epoch: string = config.epoch): number {
  return keyToDayNumber(dateKey) - keyToDayNumber(epoch);
}

export function dateKeyOfIndex(index: number, epoch: string = config.epoch): string {
  return dayNumberToKey(keyToDayNumber(epoch) + index);
}

/** Milisegundos que faltan para la próxima medianoche en la zona horaria. */
export function msUntilNextDay(now: Date = new Date(), timeZone: string = config.timeZone): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const elapsed =
    (get("hour") * 3600 + get("minute") * 60 + get("second")) * 1000 + now.getMilliseconds();
  return DAY_MS - elapsed;
}

/* ---------------- secuencia de respuestas ---------------- */

type Entry = { id: string; added: number; tie: number };

function toEntries(mode: string, registry: Registry, epoch: string, salt: string): Entry[] {
  return Object.entries(registry)
    .map(([id, date]) => ({
      id,
      added: Math.max(0, dayIndexOf(date, epoch)),
      tie: hashString(`${mode}|${salt}|${id}`),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Construye la secuencia de respuestas desde el día 0 hasta al menos `uptoDay`. */
export function buildSequence(
  mode: string,
  registry: Registry,
  uptoDay: number,
  epoch: string = config.epoch,
  salt: string = config.salt,
): string[] {
  const entries = toEntries(mode, registry, epoch, salt);
  if (!entries.length) throw new Error(`Pool vacío para el modo ${mode}`);
  const seq: string[] = [];
  for (let cycle = 0; seq.length <= uptoDay; cycle++) {
    const start = seq.length;
    const base = entries.filter((e) => e.added <= start);
    const list = shuffle(
      base.map((e) => e.id),
      mulberry32(hashString(`${mode}|${salt}|cycle:${cycle}`)),
    );
    // Evitar que el último del ciclo anterior se repita al empezar el siguiente.
    if (list.length > 1 && list[0] === seq[seq.length - 1]) [list[0], list[1]] = [list[1], list[0]];
    // Elementos añadidos durante el ciclo: al final, en orden de alta.
    const included = new Set(list);
    for (;;) {
      const end = start + list.length - 1;
      const newcomers = entries
        .filter((e) => !included.has(e.id) && e.added <= end)
        .sort((a, b) => a.added - b.added || a.tie - b.tie);
      if (!newcomers.length) break;
      for (const e of newcomers) {
        list.push(e.id);
        included.add(e.id);
      }
    }
    seq.push(...list);
  }
  return seq;
}

const cache = new Map<string, { registry: Registry; seq: string[] }>();

/** Id de la respuesta del modo para el día `dayIndex`. */
export function answerIdForDay(mode: string, dayIndex: number, registry: Registry): string {
  if (dayIndex < 0) {
    // Antes del lanzamiento: baraja de "pretemporada" independiente.
    const ids = Object.keys(registry).sort();
    const list = shuffle(ids, mulberry32(hashString(`${mode}|${config.salt}|preseason`)));
    return list[((dayIndex % list.length) + list.length) % list.length];
  }
  let hit = cache.get(mode);
  if (!hit || hit.registry !== registry || hit.seq.length <= dayIndex) {
    const seq = buildSequence(mode, registry, Math.max(dayIndex, (hit?.seq.length ?? 0) * 2, 365));
    hit = { registry, seq };
    cache.set(mode, hit);
  }
  return hit.seq[dayIndex];
}
