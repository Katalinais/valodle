/** Genera los iconos PWA y la imagen OG en public/ a partir de los SVG. `npx tsx scripts/make-icons.ts` */
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
  console.log("Iconos y og.png generados en public/");
}

void main();
