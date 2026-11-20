"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { config } from "@/config";
import { maps as allMaps } from "@/data/maps";
import registryJson from "@/data/generated/registry/map.json";
import type { GameMap } from "@/data/schema";
import type { Registry } from "@/lib/daily";
import { useI18n } from "@/i18n/I18nProvider";
import { mapZone } from "@/lib/mapZone";
import { buildShareText, simpleRow } from "@/lib/share";
import { useModeGame } from "@/lib/useModeGame";
import { zoomForMisses } from "@/lib/zoom";
import { GuessInput } from "../GuessInput";
import { HintBox } from "../HintBox";
import { CheckIcon, CrossIcon, MapIcon } from "../icons";
import { ModeShell, challengeLabel } from "../ModeShell";
import { SafeImg } from "../SafeImg";
import { WinPanel } from "../WinPanel";
import { ZoomImage } from "../ZoomImage";

export const COORDS_HINT_AT = 3;
/** A partir de aquí se revelan los colores del minimapa (deja de ser silueta). */
export const COLORS_HINT_AT = 5;

export function MapGame() {
  return <MapGameView maps={allMaps} registry={registryJson as Registry} />;
}

/** Vista del modo Mapa con los datos inyectados (testeable sin la API). */
export function MapGameView({ maps, registry }: { maps: GameMap[]; registry: Registry }) {
  const { t, locale } = useI18n();
  const mapById = useMemo(() => new Map(maps.map((m) => [m.id, m])), [maps]);
  const { today, available, answerId, yesterdayId, game, submit } = useModeGame("map", registry);

  const options = useMemo(
    () =>
      maps
        .map((m) => ({
          id: m.id,
          label: m.name[locale],
          keywords: [m.name.en, m.name.es],
          image: m.thumb ?? undefined,
          imageShape: "wide" as const,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [maps, locale],
  );

  const map = answerId ? mapById.get(answerId) : undefined;
  const misses = game.guesses.filter((g) => g !== answerId).length;
  const zoom = zoomForMisses(misses, game.won);
  const zone = map && today ? mapZone(map.zones, today.dateKey) : { x: 0.5, y: 0.5 };
  const silhouette = !game.won && misses < COLORS_HINT_AT;

  const shareText =
    today && game.won
      ? buildShareText({
          siteName: config.siteName,
          modeLabel: t("modes.map.title"),
          challengeLabel: challengeLabel(t, today.dayIndex),
          attemptsLabel: t("share.attempts", { n: game.guesses.length }),
          rows: [simpleRow(game.guesses.length)],
          url: `${config.siteUrl}/${locale}/mapa/`,
        })
      : "";

  return (
    <ModeShell
      mode="map"
      today={today}
      yesterday={yesterdayId ? mapById.get(yesterdayId)?.name[locale] : null}
    >
      {!available && (
        <div
          className="panel corners flex flex-col items-center gap-3 p-8 text-center"
          data-testid="map-soon"
        >
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-val-red/15 text-val-red">
            <MapIcon className="h-7 w-7" />
          </span>
          <h2 className="font-display text-4xl tracking-wide">{t("map.soonTitle")}</h2>
          <p className="max-w-xs text-sm text-val-muted">{t("map.soonText")}</p>
        </div>
      )}

      {map && (
        <>
          <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
            <ZoomImage
              testId="map-zoom"
              src={map.minimap}
              alt={t("map.alt")}
              aspect={map.aspect}
              containerAspect={1}
              poi={zone}
              zoom={zoom}
              silhouette={silhouette}
            />
            <p className="text-sm text-val-muted">{t("skin.zoom", { z: zoom })}</p>
          </div>

          {!game.won && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <HintBox
                  testId="hint-coords"
                  unlocked={misses >= COORDS_HINT_AT}
                  progress={misses}
                  total={COORDS_HINT_AT}
                  lockedText={t("map.coordsHintIn", { n: COORDS_HINT_AT - misses })}
                >
                  {t("map.coordsHint", { coords: map.coordinates?.[locale] ?? "—" })}
                </HintBox>
                <HintBox
                  testId="hint-colors"
                  unlocked={misses >= COLORS_HINT_AT}
                  progress={misses}
                  total={COLORS_HINT_AT}
                  lockedText={t("map.colorsHintIn", { n: COLORS_HINT_AT - misses })}
                >
                  {t("map.colorsHint")}
                </HintBox>
              </div>
              <GuessInput
                options={options}
                excludeIds={game.guesses}
                onGuess={(id) => submit(id)}
                shakeKey={misses}
                placeholder={t("map.placeholder")}
              />
            </>
          )}

          {game.won && (
            <WinPanel
              mode="map"
              attempts={game.guesses.length}
              answerName={map.name[locale]}
              answerImage={map.thumb ?? map.minimap}
              imageShape="wide"
              shareText={shareText}
            />
          )}

          <ul className="flex flex-col gap-2" data-testid="guess-list">
            {[...game.guesses].reverse().map((id) => {
              const m = mapById.get(id);
              const ok = id === answerId;
              const name = m?.name[locale] ?? id;
              return (
                <motion.li
                  key={id}
                  layout
                  initial={{ opacity: 0, x: ok ? 0 : -16, scale: ok ? 0.9 : 1 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  data-status={ok ? "hit" : "miss"}
                  className={`flex items-center gap-3 rounded-xl border p-1.5 pr-3 font-semibold ${
                    ok
                      ? "border-hit/60 bg-gradient-to-r from-hit/35 to-hit/10 text-white"
                      : "border-miss/40 bg-gradient-to-r from-miss/25 to-transparent text-val-cream"
                  }`}
                >
                  {m?.thumb && (
                    <SafeImg
                      src={m.thumb}
                      alt=""
                      fallback={name}
                      className="h-10 w-24 shrink-0 rounded-lg object-cover text-sm"
                    />
                  )}
                  <span className="flex-1 truncate">{name}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${ok ? "bg-hit" : "bg-miss/80"} text-white`}
                    aria-label={t(ok ? "classic.legend.hit" : "classic.legend.miss")}
                  >
                    {ok ? <CheckIcon className="h-4 w-4" /> : <CrossIcon className="h-3.5 w-3.5" />}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </>
      )}
    </ModeShell>
  );
}
