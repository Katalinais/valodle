import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { COLORS_HINT_AT, COORDS_HINT_AT, MapGameView } from "@/components/modes/MapGame";
import { I18nProvider } from "@/i18n/I18nProvider";
import { answerIdForDay, dateKeyOfIndex, type Registry } from "@/lib/daily";
import { mapZone } from "@/lib/mapZone";
import { visibleRect, zoomLayout } from "@/lib/zoom";
import { useGameStore } from "@/store/gameStore";
import { MapSchema, type GameMap } from "@/data/schema";
import mapsJson from "@/data/generated/maps.json";
import mapMasks from "../fixtures/map-masks.json";

const NAMES = ["Ascent", "Bind", "Haven", "Split", "Icebox", "Breeze", "Lotus", "Sunset"];
const fixture: GameMap[] = NAMES.map((n) => ({
  id: n.toLowerCase(),
  uuid: n,
  name: { en: n, es: n },
  minimap: `/img/minimaps/${n.toLowerCase()}.webp`,
  aspect: 1,
  zones: [
    { x: 0.3, y: 0.3 },
    { x: 0.7, y: 0.6 },
  ],
  thumb: `/img/mapthumbs/${n.toLowerCase()}.webp`,
  coordinates: { en: `${n} coords`, es: `coords de ${n}` },
}));
const registry: Registry = Object.fromEntries(fixture.map((m) => [m.id, "2026-12-01"]));
const DAY = 4; // 2026-12-05

/** Fracción de celdas opacas dentro del rectángulo visible. */
function opaqueFraction(rows: string[], r: ReturnType<typeof visibleRect>) {
  const grid = rows.length;
  let total = 0;
  let opaque = 0;
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      const cx = (x + 0.5) / grid;
      const cy = (y + 0.5) / grid;
      if (cx < r.x0 || cx > r.x1 || cy < r.y0 || cy > r.y1) return;
      total++;
      if (c === "1") opaque++;
    }),
  );
  return total ? opaque / total : 0;
}

describe("datos de mapas", () => {
  it("maps.json valida contra el esquema", () => {
    expect(() => z.array(MapSchema).parse(mapsJson)).not.toThrow();
  });

  it("todas las zonas de todos los mapas muestran silueta a 4x (nunca un recorte vacío)", () => {
    const maskById = new Map(mapMasks.map((m) => [m.id, m.rows]));
    for (const map of mapsJson as GameMap[]) {
      const rows = maskById.get(map.id);
      expect(rows, map.id).toBeDefined();
      for (const zone of map.zones) {
        const frac = opaqueFraction(rows!, visibleRect(zoomLayout(zone, 4, map.aspect, 1)));
        expect(frac, `${map.id} @ ${zone.x},${zone.y}`).toBeGreaterThanOrEqual(0.4);
      }
    }
  });
});

describe("mapZone", () => {
  const zones = [
    { x: 0.2, y: 0.2 },
    { x: 0.5, y: 0.5 },
    { x: 0.8, y: 0.8 },
  ];
  it("es determinista por día y recorre varias zonas", () => {
    expect(mapZone(zones, "2026-12-05")).toEqual(mapZone(zones, "2026-12-05"));
    const seen = new Set(Array.from({ length: 30 }, (_, d) => mapZone(zones, dateKeyOfIndex(d)).x));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("MapGameView", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-12-05T17:00:00Z"));
    localStorage.clear();
    useGameStore.getState().reset();
    await useGameStore.persist.rehydrate();
  });
  afterEach(() => vi.useRealTimers());

  const renderView = (maps: GameMap[], reg: Registry) =>
    render(
      <I18nProvider locale="es">
        <MapGameView maps={maps} registry={reg} />
      </I18nProvider>,
    );

  async function guess(name: string) {
    await userEvent.type(screen.getByRole("combobox"), name);
    await userEvent.keyboard("{Enter}");
  }

  it("muestra 'Próximamente' si no hay mapas", async () => {
    renderView([], {});
    expect(await screen.findByTestId("map-soon")).toHaveTextContent("Próximamente");
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("silueta con zoom que se aleja, pistas de coordenadas y colores, y victoria", async () => {
    const answer = fixture.find((m) => m.id === answerIdForDay("map", DAY, registry))!;
    const wrong = fixture.filter((m) => m.id !== answer.id);
    renderView(fixture, registry);

    const zoom = await screen.findByTestId("map-zoom");
    expect(zoom).toHaveAttribute("data-zoom", "4");
    expect(zoom).toHaveAttribute("data-silhouette", "true");
    expect(screen.getByRole("img", { name: /silueta/ })).toHaveAttribute("src", answer.minimap);

    for (const m of wrong.slice(0, COORDS_HINT_AT)) await act(() => guess(m.name.es));
    expect(screen.getByTestId("map-zoom")).toHaveAttribute("data-zoom", "1.7");
    expect(screen.getByTestId("hint-coords")).toHaveTextContent(`coords de ${answer.name.es}`);
    expect(screen.getByTestId("map-zoom")).toHaveAttribute("data-silhouette", "true");

    for (const m of wrong.slice(COORDS_HINT_AT, COLORS_HINT_AT)) await act(() => guess(m.name.es));
    expect(screen.getByTestId("hint-colors")).toHaveAttribute("data-unlocked", "true");
    expect(screen.getByTestId("map-zoom")).toHaveAttribute("data-silhouette", "false");

    await act(() => guess(answer.name.es));
    expect(await screen.findByTestId("win-panel")).toHaveTextContent(answer.name.es);
    expect(screen.getByTestId("map-zoom")).toHaveAttribute("data-zoom", "1");
  });
});
