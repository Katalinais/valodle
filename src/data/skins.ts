// Separado de ./index para que solo la página de Skin cargue este JSON (~400 KB).
import skinsJson from "./generated/skins.json";
import type { Skin } from "./schema";

export const skins = skinsJson as Skin[];
export const skinById = new Map(skins.map((s) => [s.id, s]));
