import agentsJson from "./generated/agents.json";
import abilitiesJson from "./generated/abilities.json";
import tiersJson from "./generated/tiers.json";
import quotesJson from "./manual/quotes.json";
import emojisJson from "./manual/emojis.json";
import { TODO, type Ability, type Agent, type Quote, type TierInfo } from "./schema";

export const agents = agentsJson as Agent[];
export const abilities = abilitiesJson as Ability[];
export const tiers = tiersJson as TierInfo[];
export const quotes = quotesJson as Quote[];
export const emojis = emojisJson as Record<string, string[]>;

export const agentById = new Map(agents.map((a) => [a.id, a]));

/** Agentes jugables en el modo Emoji (sin pistas pendientes). */
export const emojiAgentIds = agents
  .filter((a) => emojis[a.id] && !emojis[a.id].includes(TODO))
  .map((a) => a.id);
