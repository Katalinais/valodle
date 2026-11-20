import { describe, expect, it } from "vitest";
import es from "@/i18n/es.json";
import en from "@/i18n/en.json";
import { translate } from "@/i18n";

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("i18n", () => {
  it("es y en tienen exactamente las mismas claves", () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it("sustituye variables", () => {
    expect(translate(es, "footer.credits", { api: "X" })).toBe("Datos e imágenes vía X.");
  });

  it("devuelve la clave si no existe", () => {
    expect(translate(es, "nope.missing")).toBe("nope.missing");
  });
});
