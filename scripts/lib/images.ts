/**
 * Imágenes autoalojadas: descarga (con caché en .cache/images) las imágenes de valorant-api.com,
 * las convierte a WebP en public/img/ y devuelve la ruta local. Así el sitio no depende del CDN
 * externo (que puede estar bloqueado en la red del jugador, p. ej. por un firewall con
 * inspección TLS).
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
export const CACHE_DIR = path.join(ROOT, ".cache/images");
export const PUBLIC_IMG = path.join(ROOT, "public/img");

export function cacheFile(url: string): string {
  return path.join(CACHE_DIR, createHash("sha1").update(url).digest("hex") + ".png");
}

/** Devuelve los bytes de la imagen (de la caché o descargándola). */
export async function loadImage(url: string): Promise<Buffer> {
  const file = cacheFile(url);
  if (existsSync(file)) return readFile(file);
  await mkdir(CACHE_DIR, { recursive: true });
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf).metadata(); // valida que sea una imagen
      await writeFile(file, buf);
      return buf;
    } catch (err) {
      if (attempt >= 3) {
        const cause = err instanceof Error && err.cause ? ` (${String(err.cause)})` : "";
        throw new Error(`No se pudo descargar ${url}: ${String(err)}${cause}`);
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

export type ImageKind = "agents" | "roles" | "abilities" | "tiers" | "skins";

/** Tamaño máximo (lado mayor) por tipo; las skins conservan su resolución para el zoom. */
const MAX_SIZE: Record<ImageKind, number | null> = {
  agents: 256,
  roles: 64,
  abilities: 128,
  tiers: 64,
  skins: null,
};

const isRemote = (src: string) => src.startsWith("https://");

export type LocalizeReport = { localized: number; reused: number; failed: string[] };

/** Ruta local → URL de origen. Se commitea para saber si una imagen está al día sin red. */
export type ImageManifest = Record<string, string>;
export const MANIFEST_FILE = path.join(ROOT, "src/data/generated/images.json");

export async function readManifest(): Promise<ImageManifest> {
  return existsSync(MANIFEST_FILE) ? JSON.parse(await readFile(MANIFEST_FILE, "utf8")) : {};
}

export async function writeManifest(manifest: ImageManifest) {
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(MANIFEST_FILE, JSON.stringify(sorted, null, 2) + "\n");
}

/**
 * Convierte `src` en una ruta local `/img/<kind>/<id>.webp`. Si ya es local, la deja igual.
 * Si no se puede obtener la imagen, conserva la URL remota (respaldo) y lo anota en `report`.
 */
export async function localize(
  src: string,
  kind: ImageKind,
  id: string,
  report: LocalizeReport,
  manifest: ImageManifest,
): Promise<string> {
  if (!isRemote(src)) return src;
  const rel = `/img/${kind}/${id}.webp`;
  const out = path.join(ROOT, "public", rel);
  // Si la API cambia la URL de origen, la imagen se regenera.
  if (existsSync(out) && manifest[rel] === src) {
    report.reused++;
    return rel;
  }
  try {
    const buf = await loadImage(src);
    await mkdir(path.dirname(out), { recursive: true });
    let img = sharp(buf);
    const max = MAX_SIZE[kind];
    if (max) img = img.resize(max, max, { fit: "inside", withoutEnlargement: true });
    await img.webp({ quality: kind === "skins" ? 82 : 90, alphaQuality: 100 }).toFile(out);
    manifest[rel] = src;
    report.localized++;
    return rel;
  } catch (err) {
    report.failed.push(err instanceof Error ? err.message : String(err));
    return src;
  }
}

/** Ejecuta `fn` sobre `items` con concurrencia limitada. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

/** Borra de public/img los archivos que ya no usa ningún dato. */
export async function pruneUnused(used: Set<string>) {
  if (!existsSync(PUBLIC_IMG)) return 0;
  let removed = 0;
  for (const kind of await readdir(PUBLIC_IMG)) {
    const dir = path.join(PUBLIC_IMG, kind);
    for (const f of await readdir(dir)) {
      const rel = `/img/${kind}/${f}`;
      if (!used.has(rel)) {
        await rm(path.join(dir, f));
        removed++;
      }
    }
  }
  return removed;
}
