/**
 * Autoaloja las imágenes de los JSON generados: `npm run images`.
 * También se ejecuta al final de `npm run data`.
 *
 * Cada URL remota de valorant-api.com se convierte en /img/<tipo>/<id>.webp (public/img/).
 * Si una imagen no se puede obtener, se conserva la URL remota como respaldo y se avisa.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Ability, Agent, Skin, TierInfo } from "../src/data/schema";
import {
  localize,
  mapLimit,
  pruneUnused,
  readManifest,
  writeManifest,
  type ImageKind,
  type LocalizeReport,
} from "./lib/images";

const GEN = path.resolve(import.meta.dirname, "../src/data/generated");
const read = async <T>(f: string): Promise<T> =>
  JSON.parse(await readFile(path.join(GEN, f), "utf8"));
const write = (f: string, data: unknown) =>
  writeFile(path.join(GEN, f), JSON.stringify(data, null, 2) + "\n");

export async function localizeGenerated() {
  const agents = await read<Agent[]>("agents.json");
  const abilities = await read<Ability[]>("abilities.json");
  const tiers = await read<TierInfo[]>("tiers.json");
  const skins = await read<Skin[]>("skins.json");
  const manifest = await readManifest();
  const report: LocalizeReport = { localized: 0, reused: 0, failed: [] };

  type Job = { kind: ImageKind; id: string; get: () => string; set: (v: string) => void };
  const jobs: Job[] = [
    ...agents.map((a) => ({
      kind: "agents" as const,
      id: a.id,
      get: () => a.icon,
      set: (v: string) => (a.icon = v),
    })),
    ...agents.map((a) => ({
      kind: "roles" as const,
      id: a.role.id,
      get: () => a.role.icon,
      set: (v: string) => (a.role.icon = v),
    })),
    ...abilities.map((a) => ({
      kind: "abilities" as const,
      id: a.id,
      get: () => a.icon,
      set: (v: string) => (a.icon = v),
    })),
    ...tiers.map((t) => ({
      kind: "tiers" as const,
      id: t.name.toLowerCase(),
      get: () => t.icon,
      set: (v: string) => (t.icon = v),
    })),
    ...skins.map((s) => ({
      kind: "skins" as const,
      id: s.id,
      get: () => s.image,
      set: (v: string) => (s.image = v),
    })),
  ];

  // Los roles se repiten entre agentes: procesar cada URL una sola vez.
  const done = new Map<string, Promise<string>>();
  await mapLimit(jobs, 12, async (job) => {
    const src = job.get();
    const key = `${job.kind}/${job.id}|${src}`;
    if (!done.has(key)) done.set(key, localize(src, job.kind, job.id, report, manifest));
    job.set(await done.get(key)!);
  });

  await Promise.all([
    write("agents.json", agents),
    write("abilities.json", abilities),
    write("tiers.json", tiers),
    write("skins.json", skins),
  ]);

  const used = new Set(jobs.map((j) => j.get()).filter((s) => s.startsWith("/img/")));
  for (const rel of Object.keys(manifest)) if (!used.has(rel)) delete manifest[rel];
  await writeManifest(manifest);
  const removed = await pruneUnused(used);

  const remote = jobs.filter((j) => j.get().startsWith("https://")).length;
  console.log(
    `Imágenes: ${used.size} locales (${report.localized} nuevas, ${report.reused} reutilizadas, ${removed} borradas) · ${remote} remotas (respaldo)`,
  );
  if (report.failed.length) {
    const unique = [...new Set(report.failed)];
    console.warn(
      `⚠ ${unique.length} imágenes no se pudieron descargar; se usa la URL remota. Ejemplo:\n  ${unique[0]}`,
    );
    console.warn(
      "  Vuelve a ejecutar `npm run images` desde una red sin bloqueo a media.valorant-api.com.",
    );
  }
  return { remote, failed: report.failed.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  localizeGenerated().catch((err) => {
    console.error(`✖ ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
