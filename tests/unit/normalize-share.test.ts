import { describe, expect, it } from "vitest";
import { normalize, searchOptions } from "@/lib/normalize";
import { buildShareText, simpleRow } from "@/lib/share";

describe("normalize", () => {
  it("quita tildes, mayúsculas y signos", () => {
    expect(normalize("KAY/O")).toBe("kayo");
    expect(normalize("  Écho   Vándal ")).toBe("echo vandal");
  });
  it("busca sin tildes ni mayúsculas, priorizando prefijos", () => {
    const opts = ["Phoenix", "Sage", "Raze", "Astra"];
    expect(searchOptions(opts, "a", (o) => [o])).toEqual(["Astra", "Sage", "Raze"]);
    expect(searchOptions(["Vándal Reaver", "Reaver Vandal"], "vandal", (o) => [o])).toEqual([
      "Vándal Reaver",
      "Reaver Vandal",
    ]);
    expect(searchOptions(opts, "", (o) => [o])).toEqual([]);
  });
});

describe("share", () => {
  it("genera filas simples", () => {
    expect(simpleRow(1)).toBe("🟩");
    expect(simpleRow(3)).toBe("🟥🟥🟩");
  });
  it("arma el texto con enlace y recorta filas largas", () => {
    const text = buildShareText({
      siteName: "Valorantdle",
      modeLabel: "Clásico",
      challengeLabel: "Reto #1",
      attemptsLabel: "8 intentos",
      rows: Array.from({ length: 8 }, () => "🟥🟥"),
      url: "https://x.test",
    });
    expect(text.split("\n")).toHaveLength(2 + 6 + 1);
    expect(text).toContain("… +3");
    expect(text.endsWith("https://x.test")).toBe(true);
  });
});
