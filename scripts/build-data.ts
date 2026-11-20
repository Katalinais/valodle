/**
 * Genera los JSON normalizados de src/data/generated/ a partir de valorant-api.com
 * y de los datos manuales de src/data/manual/.
 *
 *   npm run data
 *
 * Los JSON generados se commitean: el build del sitio no depende de la API.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import {
  AbilitySchema,
  AgentSchema,
  AgentsManualSchema,
  EmojisSchema,
  QuotesSchema,
  SkinMaskSchema,
  SkinSchema,
  TIERS,
  TODO,
  TierInfoSchema,
  type Ability,
  type AbilityKey,
  type Agent,
  type Skin,
  type SkinMask,
  type Tier,
  type TierInfo,
} from "../src/data/schema";
import { excludeReason, pickSkinImage, type ExcludeReason, type RawSkin } from "./lib/skins-filter";
import { MASK_GRID, computePoi } from "./lib/poi";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "src/data/generated");
const MANUAL = path.join(ROOT, "src/data/manual");
const CACHE = path.join(ROOT, ".cache/images");
const API = "https://valorant-api.com/v1";

type Lang = "en-US" | "es-MX";

async function api<T>(endpoint: string, lang?: Lang): Promise<T> {
  const url = `${API}/${endpoint}${lang ? `${endpoint.includes("?") ? "&" : "?"}language=${lang}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const json = (await res.json()) as { status: number; data: T };
  return json.data;
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(path.join(MANUAL, file), "utf8"));
}

async function writeJson(file: string, data: unknown) {
  await writeFile(path.join(OUT, file), JSON.stringify(data, null, 2) + "\n");
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/* ---------------- API types (solo lo que usamos) ---------------- */

type RawAbility = { slot: string; displayName: string; displayIcon: string | null };
type RawAgent = {
  uuid: string;
  displayName: string;
  displayIcon: string;
  fullPortrait: string | null;
  role: { uuid: string; displayName: string; displayIcon: string } | null;
  abilities: RawAbility[];
};
type RawWeapon = {
  uuid: string;
  displayName: string;
  category: string;
  skins: RawSkin[];
};
type RawTier = {
  uuid: string;
  devName: string;
  rank: number;
  highlightColor: string;
  displayIcon: string;
};
type RawReward = { type: string; uuid: string } | null;
type RawContract = {
  content: { chapters: { levels: { reward: RawReward }[]; freeRewards: RawReward[] | null }[] };
};

const SLOT_TO_KEY: Record<string, AbilityKey> = {
  Grenade: "C",
  Ability1: "Q",
  Ability2: "E",
  Ultimate: "X",
};

/* ---------------- agentes y habilidades ---------------- */

async function buildAgents() {
  const [en, es] = await Promise.all([
    api<RawAgent[]>("agents?isPlayableCharacter=true", "en-US"),
    api<RawAgent[]>("agents?isPlayableCharacter=true", "es-MX"),
  ]);
  const esById = new Map(es.map((a) => [a.uuid, a]));
  const manual = AgentsManualSchema.parse(await readJson("agents.manual.json"));

  // Deduplicar por uuid por si la API vuelve a traer duplicados.
  const unique = [...new Map(en.map((a) => [a.uuid, a])).values()];

  const missing = unique.filter((a) => !manual[slugify(a.displayName)]);
  if (missing.length) {
    throw new Error(
      `Faltan datos manuales para: ${missing.map((a) => `"${slugify(a.displayName)}" (${a.displayName})`).join(", ")}.\n` +
        `Añádelos a src/data/manual/agents.manual.json (usa "TODO" en lo que no puedas verificar).`,
    );
  }
  const orphan = Object.keys(manual).filter(
    (id) => !unique.some((a) => slugify(a.displayName) === id),
  );
  if (orphan.length) console.warn(`⚠ Datos manuales sin agente en la API: ${orphan.join(", ")}`);

  const agents: Agent[] = [];
  const abilities: Ability[] = [];
  for (const a of unique) {
    const id = slugify(a.displayName);
    const aEs = esById.get(a.uuid) ?? a;
    if (!a.role) throw new Error(`El agente ${a.displayName} no tiene rol en la API`);
    agents.push(
      AgentSchema.parse({
        id,
        uuid: a.uuid,
        name: { en: a.displayName, es: aEs.displayName },
        role: {
          id: slugify(a.role.displayName),
          name: { en: a.role.displayName, es: aEs.role?.displayName ?? a.role.displayName },
          icon: a.role.displayIcon,
        },
        icon: a.displayIcon,
        portrait: a.fullPortrait,
        ...manual[id],
      }),
    );
    for (const ab of a.abilities) {
      const key = SLOT_TO_KEY[ab.slot];
      if (!key) continue; // pasivas fuera
      if (!ab.displayIcon) {
        console.warn(`⚠ ${a.displayName} ${key} sin icono, se omite`);
        continue;
      }
      const abEs = aEs.abilities.find((x) => x.slot === ab.slot);
      abilities.push(
        AbilitySchema.parse({
          id: `${id}-${key}`,
          agentId: id,
          key,
          name: { en: ab.displayName, es: abEs?.displayName ?? ab.displayName },
          icon: ab.displayIcon,
        }),
      );
    }
  }
  agents.sort((x, y) => x.id.localeCompare(y.id));
  abilities.sort((x, y) => x.id.localeCompare(y.id));

  const todos = agents.flatMap((a) =>
    Object.entries(a)
      .filter(([, v]) => v === TODO)
      .map(([k]) => `${a.id}.${k}`),
  );
  return { agents, abilities, todos };
}

/* ---------------- tiers ---------------- */

async function buildTiers() {
  const raw = await api<RawTier[]>("contenttiers");
  const tiers: TierInfo[] = raw
    .filter((t) => (TIERS as readonly string[]).includes(t.devName))
    .map((t) =>
      TierInfoSchema.parse({
        id: t.uuid,
        name: t.devName,
        rank: t.rank,
        icon: t.displayIcon,
        color: `#${t.highlightColor.slice(0, 6)}`,
      }),
    )
    .sort((a, b) => a.rank - b.rank);
  if (tiers.length !== TIERS.length)
    throw new Error(`Se esperaban ${TIERS.length} tiers, hay ${tiers.length}`);
  return tiers;
}

/* ---------------- máscaras de opacidad (sharp) ---------------- */

async function loadImage(url: string): Promise<Buffer> {
  const file = path.join(CACHE, createHash("sha1").update(url).digest("hex") + ".png");
  if (existsSync(file)) return readFile(file);
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(file, buf);
      return buf;
    } catch (err) {
      if (attempt >= 3) throw new Error(`No se pudo descargar ${url}: ${String(err)}`);
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

async function opacityMask(buf: Buffer) {
  const img = sharp(buf).ensureAlpha();
  const meta = await img.metadata();
  const { data } = await img
    .resize(MASK_GRID, MASK_GRID, { fit: "fill", kernel: "cubic" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const mask: boolean[][] = [];
  for (let y = 0; y < MASK_GRID; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < MASK_GRID; x++) row.push(data[(y * MASK_GRID + x) * 4 + 3] >= 128);
    mask.push(row);
  }
  return { mask, aspect: (meta.width ?? 1) / (meta.height ?? 1) };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
        if (++done % 100 === 0) process.stdout.write(`  … ${done}/${items.length} imágenes\n`);
      }
    }),
  );
  return out;
}

/* ---------------- skins (solo de pago) ---------------- */

async function buildSkins(tiers: TierInfo[]) {
  const [weaponsEn, weaponsEs, contracts] = await Promise.all([
    api<RawWeapon[]>("weapons", "en-US"),
    api<RawWeapon[]>("weapons", "es-MX"),
    api<RawContract[]>("contracts"),
  ]);

  // Todo lo que se entrega en un contrato (pase de batalla, de agente o de evento) es gratis.
  const contractRewardIds = new Set<string>();
  for (const c of contracts)
    for (const ch of c.content.chapters ?? [])
      for (const r of [...(ch.levels ?? []).map((l) => l.reward), ...(ch.freeRewards ?? [])])
        if (r && r.type === "EquippableSkinLevel") contractRewardIds.add(r.uuid);

  const tierById = new Map(tiers.map((t) => [t.id, t.name] as [string, Tier]));
  const weaponEsById = new Map(weaponsEs.map((w) => [w.uuid, w]));
  const skinEsById = new Map(weaponsEs.flatMap((w) => w.skins).map((s) => [s.uuid, s]));

  const stats: Record<ExcludeReason, number> = {
    noTier: 0,
    standardOrRandom: 0,
    contractReward: 0,
    noImage: 0,
    duplicate: 0,
  };
  const seen = new Set<string>();
  type Candidate = Omit<Skin, "aspect" | "poi">;
  const candidates: Candidate[] = [];
  let total = 0;

  for (const w of weaponsEn) {
    const category = w.category.replace(/^EEquippableCategory::/, "");
    const wEs = weaponEsById.get(w.uuid);
    for (const s of w.skins) {
      total++;
      const sEs = skinEsById.get(s.uuid);
      const reason = excludeReason(s, contractRewardIds, seen, sEs ? [sEs.displayName] : []);
      if (reason) {
        stats[reason]++;
        continue;
      }
      const tier = tierById.get(s.contentTierUuid!);
      if (!tier) throw new Error(`Tier desconocido ${s.contentTierUuid} en ${s.displayName}`);
      candidates.push({
        id: s.uuid,
        name: { en: s.displayName.trim(), es: (sEs?.displayName ?? s.displayName).trim() },
        weapon: w.displayName,
        weaponName: { en: w.displayName, es: wEs?.displayName ?? w.displayName },
        weaponCategory: category,
        tier,
        image: pickSkinImage(s)!,
        isMelee: category === "Melee",
      });
    }
  }

  await mkdir(CACHE, { recursive: true });
  console.log(`Analizando opacidad de ${candidates.length} imágenes (con caché en .cache/)…`);
  const masks: SkinMask[] = [];
  const skins: Skin[] = await mapLimit(candidates, 12, async (c) => {
    const { mask, aspect } = await opacityMask(await loadImage(c.image));
    masks.push(
      SkinMaskSchema.parse({
        id: c.id,
        grid: MASK_GRID,
        rows: mask.map((row) => row.map((b) => (b ? "1" : "0")).join("")),
      }),
    );
    return SkinSchema.parse({
      ...c,
      aspect: Math.round(aspect * 1000) / 1000,
      poi: computePoi(mask, c.id),
    });
  });

  skins.sort((a, b) => a.name.en.localeCompare(b.name.en) || a.id.localeCompare(b.id));
  masks.sort((a, b) => a.id.localeCompare(b.id));
  return { skins, masks, stats, total };
}

/* ---------------- main ---------------- */

async function main() {
  await mkdir(OUT, { recursive: true });

  const { agents, abilities, todos } = await buildAgents();
  const agentIds = new Set(agents.map((a) => a.id));

  const quotes = QuotesSchema.parse(await readJson("quotes.json"));
  const badQuotes = quotes.filter((q) => !agentIds.has(q.agentId));
  if (badQuotes.length)
    throw new Error(
      `quotes.json: agentId desconocido: ${badQuotes.map((q) => q.agentId).join(", ")}`,
    );
  const emojis = EmojisSchema.parse(await readJson("emojis.json"));
  const missingEmojis = agents.filter((a) => !emojis[a.id]).map((a) => a.id);
  if (missingEmojis.length)
    throw new Error(`emojis.json: faltan agentes: ${missingEmojis.join(", ")}`);

  const tiers = await buildTiers();
  const { skins, masks, stats, total } = await buildSkins(tiers);

  await writeJson("agents.json", agents);
  await writeJson("abilities.json", abilities);
  await writeJson("tiers.json", tiers);
  await writeJson("skins.json", skins);
  await writeFile(
    path.join(ROOT, "tests/fixtures/skin-masks.json"),
    JSON.stringify(z.array(SkinMaskSchema).parse(masks)) + "\n",
  );

  const quotesPerAgent = new Map<string, number>();
  for (const q of quotes) quotesPerAgent.set(q.agentId, (quotesPerAgent.get(q.agentId) ?? 0) + 1);
  const fewQuotes = agents
    .filter((a) => (quotesPerAgent.get(a.id) ?? 0) < 3)
    .map((a) => `${a.id}(${quotesPerAgent.get(a.id) ?? 0})`);
  const todoEmojis = Object.entries(emojis)
    .filter(([, e]) => e.includes(TODO))
    .map(([id]) => id);

  console.log("\n================ RESUMEN ================");
  console.log(
    `Agentes: ${agents.length} · Habilidades: ${abilities.length} · Tiers: ${tiers.length}`,
  );
  console.log(`Skins totales en la API: ${total}`);
  console.log(
    `Skins de pago incluidas: ${skins.length} (melee: ${skins.filter((s) => s.isMelee).length})`,
  );
  console.log("Descartadas:");
  console.log(`  · sin tier (contentTierUuid null): ${stats.noTier}`);
  console.log(`  · Standard / Random Favorite:      ${stats.standardOrRandom}`);
  console.log(`  · recompensa de contrato/pase:     ${stats.contractReward}`);
  console.log(`  · sin imagen:                      ${stats.noImage}`);
  console.log(`  · duplicadas:                      ${stats.duplicate}`);
  console.log(
    `Por tier: ${TIERS.map((t) => `${t} ${skins.filter((s) => s.tier === t).length}`).join(" · ")}`,
  );
  console.log("\nPENDIENTES (TODO):");
  console.log(`  · agents.manual.json (${todos.length}): ${todos.join(", ") || "ninguno"}`);
  console.log(`  · emojis.json: ${todoEmojis.join(", ") || "ninguno"}`);
  console.log(`  · quotes.json, agentes con < 3 frases: ${fewQuotes.join(", ") || "ninguno"}`);
  console.log("=========================================");
}

main().catch((err) => {
  console.error(`\n✖ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
