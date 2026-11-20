import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  AbilitySchema,
  AgentSchema,
  EmojisSchema,
  QuotesSchema,
  SkinSchema,
  TIERS,
  TierInfoSchema,
} from "@/data/schema";
import agents from "@/data/generated/agents.json";
import abilities from "@/data/generated/abilities.json";
import skins from "@/data/generated/skins.json";
import tiers from "@/data/generated/tiers.json";
import quotes from "@/data/manual/quotes.json";
import emojis from "@/data/manual/emojis.json";

describe("datos generados", () => {
  it("validan contra los esquemas Zod", () => {
    expect(() => z.array(AgentSchema).parse(agents)).not.toThrow();
    expect(() => z.array(AbilitySchema).parse(abilities)).not.toThrow();
    expect(() => z.array(SkinSchema).parse(skins)).not.toThrow();
    expect(() => z.array(TierInfoSchema).parse(tiers)).not.toThrow();
    expect(() => QuotesSchema.parse(quotes)).not.toThrow();
    expect(() => EmojisSchema.parse(emojis)).not.toThrow();
  });

  it("todas las skins del pool tienen tier de pago", () => {
    expect(skins.length).toBeGreaterThan(0);
    for (const s of skins) {
      expect(s.tier, s.name.en).not.toBeNull();
      expect(TIERS).toContain(s.tier);
    }
  });

  it("no hay skins Standard / Random Favorite ni ids duplicados", () => {
    for (const s of skins) expect(s.name.en).not.toMatch(/^(Standard|Random Favorite)/);
    expect(new Set(skins.map((s) => s.id)).size).toBe(skins.length);
  });

  it("las skins de pase de batalla conocidas no están en el pool", () => {
    const names = new Set(skins.map((s) => s.name.en));
    for (const bp of ["Couture Bulldog", "Kingdom Phantom", ".EXE Vandal"])
      expect(names).not.toContain(bp);
  });

  it("cada agente tiene 4 habilidades (C, Q, E, X)", () => {
    for (const a of agents) {
      const keys = abilities
        .filter((x) => x.agentId === a.id)
        .map((x) => x.key)
        .sort();
      expect(keys, a.id).toEqual(["C", "E", "Q", "X"]);
    }
  });

  it("quotes y emojis referencian agentes existentes", () => {
    const ids = new Set(agents.map((a) => a.id));
    for (const q of quotes) expect(ids).toContain(q.agentId);
    for (const id of Object.keys(emojis)) expect(ids).toContain(id);
  });
});
