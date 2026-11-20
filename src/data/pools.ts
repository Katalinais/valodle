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

/** Ids que forman el pool de cada modo (lo que puede salir como respuesta). */
export function poolIds(data: PoolData) {
  return {
    classic: data.agents.map((a) => a.id),
    ability: data.abilities.map((a) => a.id),
    quote: data.quotes.map(quoteId),
    emoji: data.agents
      .filter((a) => data.emojis[a.id] && !data.emojis[a.id].includes(TODO))
      .map((a) => a.id),
    skin: data.skins.map((s) => s.id),
  };
}
