import { describe, expect, it } from "vitest";
import {
  answerIdForDay,
  buildSequence,
  dateKeyIn,
  dateKeyOfIndex,
  dayIndexOf,
  hashString,
  msUntilNextDay,
  mulberry32,
  shuffle,
  type Registry,
} from "@/lib/daily";
import classicRegistry from "@/data/generated/registry/classic.json";
import skinRegistry from "@/data/generated/registry/skin.json";

const EPOCH = "2026-12-01";
const reg = (ids: string[], date = EPOCH): Registry =>
  Object.fromEntries(ids.map((id) => [id, date]));
const ids = (n: number, prefix = "a") =>
  Array.from({ length: n }, (_, i) => `${prefix}${String(i).padStart(3, "0")}`);

describe("PRNG y hash", () => {
  it("mulberry32 es determinista", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("shuffle es una permutación", () => {
    const items = ids(50);
    expect(shuffle(items, mulberry32(1)).sort()).toEqual(items);
  });
  it("hashString distingue entradas", () => {
    expect(hashString("2026-12-01|classic")).not.toBe(hashString("2026-12-01|emoji"));
  });
});

describe("fechas", () => {
  it("usa la zona horaria de Bogotá (UTC-5)", () => {
    // 2026-12-02 03:00 UTC = 2026-12-01 22:00 en Bogotá
    expect(dateKeyIn(new Date("2026-12-02T03:00:00Z"), "America/Bogota")).toBe("2026-12-01");
    expect(dateKeyIn(new Date("2026-12-02T05:00:00Z"), "America/Bogota")).toBe("2026-12-02");
  });
  it("calcula índices de día respecto al EPOCH", () => {
    expect(dayIndexOf("2026-12-01", EPOCH)).toBe(0);
    expect(dayIndexOf("2027-01-01", EPOCH)).toBe(31);
    expect(dayIndexOf("2026-11-30", EPOCH)).toBe(-1);
    expect(dateKeyOfIndex(31, EPOCH)).toBe("2027-01-01");
  });
  it("cuenta el tiempo hasta medianoche de Bogotá", () => {
    // 23:00 en Bogotá → falta 1 h
    expect(msUntilNextDay(new Date("2026-12-02T04:00:00.000Z"), "America/Bogota")).toBe(3_600_000);
  });
});

describe("secuencia diaria", () => {
  const registry = reg(ids(30));

  it("mismo día → misma respuesta", () => {
    expect(answerIdForDay("classic", 10, registry)).toBe(answerIdForDay("classic", 10, registry));
  });

  it("días consecutivos → respuestas distintas", () => {
    const seq = buildSequence("classic", registry, 300);
    for (let d = 1; d <= 300; d++) expect(seq[d], `día ${d}`).not.toBe(seq[d - 1]);
  });

  it("sin repeticiones dentro de un ciclo y el ciclo recorre todo el pool", () => {
    const seq = buildSequence("classic", registry, 89);
    for (let c = 0; c < 3; c++) {
      const cycle = seq.slice(c * 30, c * 30 + 30);
      expect(new Set(cycle).size).toBe(30);
    }
  });

  it("modos distintos usan barajas distintas", () => {
    const a = buildSequence("classic", registry, 29);
    const b = buildSequence("emoji", registry, 29);
    expect(a).not.toEqual(b);
  });

  it("añadir elementos nuevos no cambia las respuestas pasadas", () => {
    const before = buildSequence("skin", registry, 200);
    // El día 45 (a mitad del segundo ciclo) se añaden 3 elementos nuevos con alta el día 46.
    const extended = { ...registry, ...reg(ids(3, "new"), dateKeyOfIndex(46, EPOCH)) };
    const after = buildSequence("skin", extended, 200);
    expect(after.slice(0, 46)).toEqual(before.slice(0, 46));
    // Se añaden al final del ciclo en curso (días 60..62), después de su fecha de alta.
    expect(after.slice(46, 60)).toEqual(before.slice(46, 60));
    expect(after.slice(60, 63).sort()).toEqual(ids(3, "new"));
    // El ciclo siguiente ya incluye todo el pool ampliado sin repeticiones.
    expect(new Set(after.slice(63, 96)).size).toBe(33);
  });

  it("un elemento nunca sale antes de su fecha de alta", () => {
    const extended = { ...registry, late: dateKeyOfIndex(100, EPOCH) };
    const seq = buildSequence("classic", extended, 400);
    expect(seq.indexOf("late")).toBeGreaterThanOrEqual(100);
  });

  it("antes del lanzamiento devuelve una respuesta válida (pretemporada)", () => {
    expect(Object.keys(registry)).toContain(answerIdForDay("classic", -5, registry));
  });

  it("funciona con los registros reales", () => {
    expect(Object.keys(classicRegistry)).toContain(answerIdForDay("classic", 0, classicRegistry));
    expect(Object.keys(skinRegistry)).toContain(answerIdForDay("skin", 1000, skinRegistry));
  });
});
