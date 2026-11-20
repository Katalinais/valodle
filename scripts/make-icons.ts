/** Genera los iconos PWA y la imagen OG en public/ a partir de los SVG. `npx tsx scripts/make-icons.ts` */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const icon = path.join(ROOT, "src/app/icon.svg");
const out = (f: string) => path.join(ROOT, "public", f);

async function main() {
  for (const [size, name] of [
    [192, "icon-192.png"],
    [512, "icon-512.png"],
    [180, "apple-touch-icon.png"],
  ] as const)
    await sharp(icon, { density: 600 }).resize(size, size).png().toFile(out(name));

  await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0f1923" } })
    .composite([{ input: await sharp(icon, { density: 600 }).resize(360, 360).png().toBuffer() }])
    .png()
    .toFile(out("icon-maskable.png"));

  await sharp(path.join(ROOT, "assets/og.svg")).png().toFile(out("og.png"));

  // favicon.ico (PNG embebido en un contenedor ICO). Sin él, en `next dev` la petición
  // automática a /favicon.ico cae en la ruta [locale] y da error 500.
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) => sharp(icon, { density: 600 }).resize(s, s).png().toBuffer()),
  );
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: icono
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(s, e);
    header.writeUInt8(s, e + 1);
    header.writeUInt16LE(1, e + 4); // planos
    header.writeUInt16LE(32, e + 6); // bits por píxel
    header.writeUInt32LE(pngs[i].length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  await writeFile(out("favicon.ico"), Buffer.concat([header, ...pngs]));
  console.log("Iconos, favicon.ico y og.png generados en public/");
}

void main();
