import { describe, expect, it } from "vitest";
import { compareAgents, compareNumbers, compareSets, resultToSquares } from "@/lib/compare";
import type { Agent } from "@/data/schema";

const agent = (over: Partial<Agent>): Agent => ({
  id: "a",
  uuid: "u",
  name: { es: "A", en: "A" },
  role: { id: "duelist", name: { es: "Duelista", en: "Duelist" }, icon: "https://x/r.png" },
  icon: "https://x/i.png",
  portrait: null,
  gender: "female",
  species: "radiant",
  origin: ["KR"],
  releaseYear: 2020,
  releaseEpisode: "Beta",
  ultPoints: 8,
  affiliation: "protocol",
  ...over,
});

const jett = agent({ id: "jett" });
const sova = agent({
  id: "sova",
  gender: "male",
  role: { id: "initiator", name: { es: "Iniciador", en: "Initiator" }, icon: "https://x/r.png" },
  species: "human",
  origin: ["RU"],
  ultPoints: 8,
  releaseYear: 2020,
});
const neon = agent({ id: "neon", origin: ["PH"], ultPoints: 7, releaseYear: 2022 });

describe("compareAgents (Clásico)", () => {
  it("todo verde si es el mismo agente", () => {
    const r = compareAgents(jett, jett);
    expect(Object.values(r).every((c) => c.status === "hit")).toBe(true);
    expect(resultToSquares(r)).toBe("🟩".repeat(7));
  });

  it("agente: rojo si es otro", () => {
    expect(compareAgents(sova, jett).agent.status).toBe("miss");
  });

  it("género", () => {
    expect(compareAgents(sova, jett).gender.status).toBe("miss");
    expect(compareAgents(neon, jett).gender.status).toBe("hit");
  });

  it("rol", () => {
    expect(compareAgents(sova, jett).role.status).toBe("miss");
    expect(compareAgents(neon, jett).role.status).toBe("hit");
  });

  it("especie", () => {
    expect(compareAgents(sova, jett).species.status).toBe("miss");
    expect(compareAgents(neon, jett).species.status).toBe("hit");
  });

  it("origen: verde, naranja (parcial) y rojo", () => {
    expect(compareSets(["KR"], ["KR"]).status).toBe("hit");
    expect(compareSets(["KR", "US"], ["KR"]).status).toBe("partial");
    expect(compareSets(["KR"], ["KR", "US"]).status).toBe("partial");
    expect(compareAgents(neon, jett).origin.status).toBe("miss");
  });

  it("afiliación", () => {
    expect(compareAgents(neon, jett).affiliation.status).toBe("hit");
    expect(
      compareAgents(agent({ id: "k", affiliation: "alpha-omega" }), jett).affiliation.status,
    ).toBe("miss");
  });

  it("puntos de ulti: flecha hacia el valor correcto", () => {
    expect(compareAgents(neon, jett).ultPoints).toEqual({ status: "miss", arrow: "up" });
    expect(compareAgents(jett, neon).ultPoints).toEqual({ status: "miss", arrow: "down" });
    expect(compareAgents(sova, jett).ultPoints).toEqual({ status: "hit" });
  });

  it("año de lanzamiento: flecha", () => {
    expect(compareAgents(neon, jett).releaseYear).toEqual({ status: "miss", arrow: "down" });
    expect(compareNumbers(2020, 2024)).toEqual({ status: "miss", arrow: "up" });
  });

  it("datos TODO → desconocido (gris), nunca verde/rojo inventado", () => {
    const r = compareAgents(agent({ id: "x", ultPoints: "TODO", origin: "TODO" }), jett);
    expect(r.ultPoints.status).toBe("unknown");
    expect(r.origin.status).toBe("unknown");
    expect(resultToSquares(r)).toContain("⬛");
  });
});
