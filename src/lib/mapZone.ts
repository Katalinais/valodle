import { daySeed } from "./daily";

/**
 * Zona del minimapa a mostrar hoy (igual para todos): una de las zonas jugables precalculadas
 * por `npm run data`, elegida con la semilla del día.
 */
export function mapZone(zones: readonly { x: number; y: number }[], dateKey: string) {
  return zones[daySeed(dateKey, "map") % zones.length];
}
