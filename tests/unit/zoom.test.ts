import { describe, expect, it } from "vitest";
import skins from "@/data/generated/skins.json";
import masks from "../fixtures/skin-masks.json";
import { mulberry32, shuffle } from "@/lib/daily";
import { ZOOM_STEPS, visibleRect, zoomForMisses, zoomLayout } from "@/lib/zoom";

const maskById = new Map(masks.map((m) => [m.id, m]));

/** Fracción de celdas opacas entre las que caen dentro del rectángulo visible. */
function opaqueFraction(rows: string[], rect: ReturnType<typeof visibleRect>) {
  const grid = rows.length;
  let total = 0;
  let opaque = 0;
  for (let y = 0; y < grid; y++)
    for (let x = 0; x < grid; x++) {
      const cx = (x + 0.5) / grid;
      const cy = (y + 0.5) / grid;
      if (cx < rect.x0 || cx > rect.x1 || cy < rect.y0 || cy > rect.y1) continue;
      total++;
      if (rows[y][x] === "1") opaque++;
    }
  return total ? opaque / total : 0;
}

describe("zoom de skins", () => {
  it("la secuencia de zoom va de 4x a 1x", () => {
    expect(ZOOM_STEPS.map((_, i) => zoomForMisses(i, false))).toEqual([4, 3, 2.3, 1.7, 1.3, 1]);
    expect(zoomForMisses(20, false)).toBe(1);
    expect(zoomForMisses(0, true)).toBe(1);
  });

  it("a 1x se ve la imagen completa y centrada", () => {
    const l = zoomLayout({ x: 0.2, y: 0.8 }, 1, 4);
    expect(visibleRect(l)).toEqual({ x0: 0, x1: 1, y0: 0, y1: 1 });
  });

  it("el recorte nunca es transparente (50 skins al azar, todos los niveles)", () => {
    const sample = shuffle(skins, mulberry32(2026)).slice(0, 50);
    for (const skin of sample) {
      const mask = maskById.get(skin.id);
      expect(mask, skin.name.en).toBeDefined();
      for (const z of ZOOM_STEPS) {
        const rect = visibleRect(zoomLayout(skin.poi, z, skin.aspect));
        const frac = opaqueFraction(mask!.rows, rect);
        // Nunca un recorte vacío; y el zoom inicial (4x) muestra una zona claramente opaca.
        expect(frac, `${skin.name.en} @${z}x`).toBeGreaterThan(z === 4 ? 0.2 : 0.05);
      }
    }
  });

  it("todas las skins tienen un POI con píxeles opacos a 4x", () => {
    const empty = skins.filter((s) => {
      const rect = visibleRect(zoomLayout(s.poi, 4, s.aspect));
      return opaqueFraction(maskById.get(s.id)!.rows, rect) === 0;
    });
    expect(empty.map((s) => s.name.en)).toEqual([]);
  });
});
