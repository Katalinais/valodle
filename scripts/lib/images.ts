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

export type ImageKind =
  "agents" | "roles" | "abilities" | "tiers" | "skins" | "thumbs" | "minimaps" | "mapthumbs";

type Processing = { max: number | null; quality: number; alphaQuality?: number; version: number };

/**
 * Procesado por tipo (lado mayor máximo y calidad WebP). Al cambiar un ajuste, sube `version`
 * y `npm run images` regenera esas imágenes desde la caché local sin volver a descargarlas.
 */
const PROCESSING: Record<ImageKind, Processing> = {
  agents: { max: 256, quality: 90, version: 1 },
  roles: { max: 64, quality: 90, version: 1 },
  abilities: { max: 128, quality: 90, version: 1 },
  tiers: { max: 64, quality: 90, version: 1 },
  // 2048 px sobra para el zoom 4x; algunas imágenes de la API miden 8192 px de ancho.
  skins: { max: 2048, quality: 82, version: 2 },
  // Miniaturas para el autocompletado y la lista de intentos (se muestran a ~80 px de ancho).
  thumbs: { max: 192, quality: 70, alphaQuality: 80, version: 2 },
  // Minimapas: resolución completa (1024 px) para que la silueta se vea nítida a zoom 4x.
  minimaps: { max: 1024, quality: 85, version: 2 },
  mapthumbs: { max: 384, quality: 75, version: 1 },
};

const isRemote = (src: string) => src.startsWith("https://");

export type LocalizeReport = { localized: number; reused: number; failed: string[] };

/** Ruta local → origen y versión de procesado. Se commitea: permite saber si está al día sin red. */
export type ImageManifest = Record<string, { src: string; v: number }>;
export const MANIFEST_FILE = path.join(ROOT, "src/data/generated/images.json");

export async function readManifest(): Promise<ImageManifest> {
  if (!existsSync(MANIFEST_FILE)) return {};
  const raw = JSON.parse(await readFile(MANIFEST_FILE, "utf8")) as Record<
    string,
    string | { src: string; v: number }
  >;
  // Formato antiguo: rel → src (versión 1).
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? { src: v, v: 1 } : v]),
  );
}

export async function writeManifest(manifest: ImageManifest) {
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(MANIFEST_FILE, JSON.stringify(sorted, null, 2) + "\n");
}

/**
 * Devuelve la ruta local `/img/<kind>/<id>.webp` de la imagen, generándola si falta o si cambió
 * el origen o el procesado. `src` puede ser la URL remota o una ruta local ya generada (se busca
 * su origen en el manifiesto). Si no se puede obtener, devuelve `src` y lo anota en `report`.
 */
export async function localize(
  src: string,
  kind: ImageKind,
  id: string,
  report: LocalizeReport,
  manifest: ImageManifest,
): Promise<string> {
  const origin = isRemote(src) ? src : manifest[src]?.src;
  if (!origin) {
    report.reused++;
    return src;
  }
  const rel = `/img/${kind}/${id}.webp`;
  const out = path.join(ROOT, "public", rel);
  const { max, quality, alphaQuality = 100, version } = PROCESSING[kind];
  const entry = manifest[rel];
  if (existsSync(out) && entry?.src === origin && entry.v === version) {
    report.reused++;
    return rel;
  }
  try {
    const buf = await loadImage(origin);
    await mkdir(path.dirname(out), { recursive: true });
    let img = sharp(buf);
    if (max) img = img.resize(max, max, { fit: "inside", withoutEnlargement: true });
    await img.webp({ quality, alphaQuality, effort: 4 }).toFile(out);
    manifest[rel] = { src: origin, v: version };
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
    // No dejar carpetas vacías de tipos de imagen que ya no se usan.
    if ((await readdir(dir)).length === 0) await rm(dir, { recursive: true });
  }
  return removed;
}
