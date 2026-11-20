import mapsJson from "./generated/maps.json";
import type { GameMap } from "./schema";

export const maps = mapsJson as GameMap[];
export const mapById = new Map(maps.map((m) => [m.id, m]));
