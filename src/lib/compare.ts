import { TODO, type Agent } from "@/data/schema";

export type CellStatus = "hit" | "partial" | "miss" | "unknown";
export type Arrow = "up" | "down";
export type Cell = { status: CellStatus; arrow?: Arrow };

export const CLASSIC_COLUMNS = [
  "gender",
  "role",
  "species",
  "origin",
  "affiliation",
  "ultPoints",
  "releaseYear",
] as const;
export type ClassicColumn = (typeof CLASSIC_COLUMNS)[number];

export type ClassicResult = { agent: Cell } & Record<ClassicColumn, Cell>;

const isTodo = (v: unknown) => v === TODO;

function single<T>(guess: T, answer: T): Cell {
  if (isTodo(guess) || isTodo(answer)) return { status: "unknown" };
  return { status: guess === answer ? "hit" : "miss" };
}

/** Campos con varios valores: verde si coinciden todos, naranja si alguno, rojo si ninguno. */
export function compareSets(
  guess: readonly string[] | typeof TODO,
  answer: readonly string[] | typeof TODO,
): Cell {
  if (isTodo(guess) || isTodo(answer)) return { status: "unknown" };
  const g = new Set(guess as string[]);
  const a = new Set(answer as string[]);
  const shared = [...g].filter((v) => a.has(v)).length;
  if (shared === 0) return { status: "miss" };
  if (shared === g.size && shared === a.size) return { status: "hit" };
  return { status: "partial" };
}

/** Números: verde si es igual; si no, rojo con flecha hacia el valor correcto. */
export function compareNumbers(guess: number | typeof TODO, answer: number | typeof TODO): Cell {
  if (isTodo(guess) || isTodo(answer)) return { status: "unknown" };
  if (guess === answer) return { status: "hit" };
  return { status: "miss", arrow: (answer as number) > (guess as number) ? "up" : "down" };
}

export function compareAgents(guess: Agent, answer: Agent): ClassicResult {
  const same = guess.id === answer.id;
  const hit: Cell = { status: "hit" };
  if (same)
    return Object.fromEntries(["agent", ...CLASSIC_COLUMNS].map((k) => [k, hit])) as ClassicResult;
  return {
    agent: { status: "miss" },
    gender: single(guess.gender, answer.gender),
    role: single(guess.role.id, answer.role.id),
    species: single(guess.species, answer.species),
    origin: compareSets(guess.origin, answer.origin),
    affiliation: single(guess.affiliation, answer.affiliation),
    ultPoints: compareNumbers(guess.ultPoints, answer.ultPoints),
    releaseYear: compareNumbers(guess.releaseYear, answer.releaseYear),
  };
}

const SQUARES: Record<CellStatus, string> = { hit: "🟩", partial: "🟧", miss: "🟥", unknown: "⬛" };

export function resultToSquares(result: ClassicResult): string {
  return CLASSIC_COLUMNS.map((c) => SQUARES[result[c].status]).join("");
}
