/**
 * Lógica pura del filtro "solo skins de pago". Separada del script para poder testearla.
 */

export type RawSkin = {
  uuid: string;
  displayName: string;
  contentTierUuid: string | null;
  displayIcon: string | null;
  chromas: { fullRender: string | null; displayIcon?: string | null }[];
  levels: { uuid: string; displayIcon: string | null }[];
};

export type ExcludeReason =
  "noTier" | "standardOrRandom" | "contractReward" | "noImage" | "duplicate";

const EXCLUDED_NAME = [
  /^standard\b/i,
  /^estándar\b/i,
  /^estandar\b/i,
  /^random favorite skin$/i,
  /^skin favorita aleatoria$/i,
  /^aspecto favorito aleatorio$/i,
  /^melee$/i,
  /^cuerpo a cuerpo$/i,
];

export function pickSkinImage(skin: RawSkin): string | null {
  return skin.displayIcon ?? skin.chromas[0]?.fullRender ?? skin.levels[0]?.displayIcon ?? null;
}

/**
 * Devuelve `null` si la skin entra al pool, o el motivo de exclusión.
 * @param contractRewardIds uuids de niveles/skins que se entregan en contratos
 *   (pases de batalla, contratos de agente, pases de evento): son gratis.
 * @param altNames nombres de la skin en otros idiomas (para el filtro por nombre)
 */
export function excludeReason(
  skin: RawSkin,
  contractRewardIds: ReadonlySet<string>,
  seen: Set<string>,
  altNames: string[] = [],
): ExcludeReason | null {
  if (seen.has(skin.uuid)) return "duplicate";
  if (skin.contentTierUuid === null) return "noTier";
  const names = [skin.displayName, ...altNames].map((n) => n.trim());
  if (names.some((n) => EXCLUDED_NAME.some((re) => re.test(n)))) return "standardOrRandom";
  if (contractRewardIds.has(skin.uuid) || skin.levels.some((l) => contractRewardIds.has(l.uuid))) {
    return "contractReward";
  }
  if (!pickSkinImage(skin)) return "noImage";
  seen.add(skin.uuid);
  return null;
}
