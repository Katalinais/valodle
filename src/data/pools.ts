import { TODO, type Ability, type Agent, type Quote, type Skin } from "./schema";

/** Id estable de una frase: agente + slug del texto en inglés. */
export function quoteId(q: Pick<Quote, "agentId" | "text">): string {
  const slug = q.text.en
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${q.agentId}:${slug}`;
}

export type PoolData = {
  agents: Agent[];
  abilities: Ability[];
  quotes: Quote[];
  emojis: Record<string, string[]>;
  skins: Skin[];
};

/**
 * Un agente entra en el pool del Clásico solo si tiene datos suficientes para dar pistas:
 * género y año conocidos y como mucho un TODO más (sin contar los puntos de ulti).
 */
export function isClassicReady(a: Agent): boolean {
  if (a.gender === TODO || a.releaseYear === TODO) return false;
  const others = [a.species, a.origin, a.affiliation].filter((v) => v === TODO).length;
  return others <= 1;
}

/** Ids que forman el pool de cada modo (lo que puede salir como respuesta). */
export function poolIds(data: PoolData) {
  return {
    classic: data.agents.filter(isClassicReady).map((a) => a.id),
    ability: data.abilities.map((a) => a.id),
    quote: data.quotes.map(quoteId),
    emoji: data.agents
      .filter((a) => data.emojis[a.id] && !data.emojis[a.id].includes(TODO))
      .map((a) => a.id),
    skin: data.skins.map((s) => s.id),
  };
}
