# Valorantdle

Juego diario de adivinanzas de fans sobre VALORANT. Hay seis modos (**Clásico, Habilidad, Frase, Emoji, Skin y Mapa**) y un reto nuevo cada día, igual para todos los jugadores. El reto se reinicia a medianoche en `America/Bogota`.

Es un sitio 100 % estático (Next.js con `output: "export"`): no tiene backend, y el progreso, las rachas y las estadísticas se guardan en `localStorage`.

> Proyecto de fans no oficial y gratuito. Valorantdle no está respaldado por Riot Games y no refleja las opiniones de Riot Games ni de nadie oficialmente involucrado en la producción o gestión de las propiedades de Riot Games. Riot Games y todas las propiedades asociadas son marcas comerciales o registradas de Riot Games, Inc. Los datos y las imágenes provienen de [valorant-api.com](https://valorant-api.com).

## Requisitos

- Node 20 o superior (desarrollado con Node 26)
- npm

## Scripts

| Comando                              | Qué hace                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `npm run dev`                        | Servidor de desarrollo en http://localhost:3000                                  |
| `npm run build`                      | Export estático en `out/`                                                        |
| `npm start`                          | Sirve `out/` en http://localhost:3000                                            |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript                                                              |
| `npm test`                           | Tests unitarios (Vitest)                                                         |
| `npm run e2e`                        | Tests e2e (Playwright, móvil). La primera vez: `npx playwright install chromium` |
| `npm run data`                       | Regenera los datos desde valorant-api.com (ver abajo)                            |
| `npx tsx scripts/make-icons.ts`      | Regenera los iconos PWA y `public/og.png`                                        |

## Actualizar los datos (nuevo agente, bundle o skin)

```bash
npm run data
```

El script `scripts/build-data.ts` hace esto:

1. Descarga agentes, armas/skins, tiers y contratos de valorant-api.com en `en-US` y `es-MX`.
2. Mezcla los agentes con los datos manuales de `src/data/manual/` y lo valida todo con Zod.
3. **Filtra solo las skins de pago**: con tier asignado, sin las _Standard_ ni _Random Favorite_, y **sin las recompensas de contratos** (pases de batalla, contratos de agente y pases de evento). La API ya asigna tier a muchas skins de pase, así que filtrar por tier no basta.
4. Descarga cada imagen de skin (con caché en `.cache/`) y calcula con `sharp` una máscara de opacidad y el **punto de interés** del zoom.
5. Descarga los **mapas competitivos** (los que tienen descripción táctica en la API): minimapa y banner, y calcula las **zonas** de la silueta del minimapa que se pueden mostrar (cada día toca una). Hasta que existan, el modo Mapa aparece como "Próximamente".
6. Actualiza los **registros diarios** (`src/data/generated/registry/*.json`).
7. Imprime un resumen: skins incluidas y descartadas por motivo, y los `TODO` pendientes.

Revisa el diff y commitea los JSON generados: el build no llama a la API.

### Cuando sale un agente nuevo

El script **falla** si un agente de la API no tiene entrada en `src/data/manual/agents.manual.json`, y te dice cuál falta. Añádelo así:

```json
"nuevoagente": {
  "gender": "female",            // male | female | nonbinary | "TODO"
  "species": "radiant",          // human | radiant | radivoid | robot | other | "TODO"
  "origin": ["KR"],              // códigos ISO 3166-1 (o "unknown"); varios = coincidencia parcial
  "releaseYear": 2026,
  "releaseEpisode": "S2026 A6",
  "ultPoints": 8,
  "affiliation": "protocol"      // protocol | kingdom | alpha-omega | independent | "TODO"
}
```

Lo que no puedas verificar déjalo como `"TODO"`: en el Clásico se muestra como "dato pendiente" (gris), nunca como un acierto o un fallo inventado. Un agente con demasiados `TODO` no entra en el pool del Clásico hasta que se completen sus datos. Añade también 5 emojis en `emojis.json` y, si puedes, frases en `quotes.json`.

## Cómo se elige el reto del día (y por qué no cambian los días pasados)

Está en `src/lib/daily.ts`:

- El día _N_ se cuenta desde `EPOCH = 2026-12-01` (en `src/config.ts`). Antes de esa fecha el sitio muestra una "pretemporada" con una baraja aparte.
- Cada modo tiene un registro **append-only** con `id → fecha de alta`. `npm run data` añade los ids nuevos con fecha de alta = **mañana** y nunca borra ni modifica entradas.
- Las respuestas se generan por **ciclos**: cada ciclo es una baraja determinista (mulberry32, sembrada con modo + `SALT` + nº de ciclo) de todos los elementos dados de alta hasta ese momento. No se repite ninguna respuesta hasta recorrer el pool entero.
- Los elementos que entran a mitad de ciclo se añaden **al final del ciclo en curso**, así que ningún día ya jugado cambia de respuesta. Hay un test que lo comprueba (`tests/unit/daily.test.ts`).
- **No cambies** `epoch`, `salt` ni el orden de los ciclos una vez publicado el sitio.

## Despliegue

### Vercel (recomendado)

1. Importa el repositorio en Vercel. `vercel.json` ya configura el build y `out/` como salida.
2. Define la variable `NEXT_PUBLIC_SITE_URL` con tu dominio (por ejemplo `https://valorantdle.vercel.app`). Se usa en el enlace de "Compartir", el sitemap y los metadatos OG.

### GitHub Pages / cualquier hosting estático

`npm run build` y sube la carpeta `out/`. Si se sirve desde un subdirectorio, configura `basePath` en `next.config.ts`.

## Estructura

```
scripts/build-data.ts      # generación de datos (+ scripts/lib: filtro de skins, POI)
src/app/[locale]/…         # páginas por idioma (es/en): inicio y un modo por carpeta
src/components/            # GuessInput, ClassicGrid, ZoomImage, WinPanel, StatsModal…
src/components/modes/      # lógica de cada modo
src/lib/                   # daily, compare, normalize, share, zoom…
src/store/gameStore.ts     # zustand + persist (clave modo:fecha)
src/data/manual/           # datos que no da la API (editar a mano)
src/data/generated/        # JSON generados (no editar a mano)
src/i18n/                  # es.json / en.json
tests/unit, tests/e2e      # Vitest / Playwright
```
