/**
 * Precompila todas las páginas en el `next dev` de los e2e antes de empezar, para que la
 * compilación en frío no agote el tiempo de los primeros tests.
 */
import { MODES } from "../../src/lib/modes";

export default async function globalSetup() {
  const base = "http://localhost:3123";
  const paths = ["/es/", ...MODES.map((m) => `/es/${m.slug}/`)];
  for (const p of paths) {
    const res = await fetch(base + p);
    if (!res.ok) throw new Error(`Precompilación: ${p} → ${res.status}`);
  }
}
