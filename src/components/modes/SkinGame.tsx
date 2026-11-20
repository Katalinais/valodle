"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { config } from "@/config";
import { tiers } from "@/data";
import { skinById, skins } from "@/data/skins";
import registry from "@/data/generated/registry/skin.json";
import { useI18n } from "@/i18n/I18nProvider";
import { buildShareText, simpleRow } from "@/lib/share";
import { useModeGame } from "@/lib/useModeGame";
import { zoomForMisses } from "@/lib/zoom";
import { useGameStore } from "@/store/gameStore";
import { GuessInput } from "../GuessInput";
import { HintBox } from "../HintBox";
import { CheckIcon, CrossIcon } from "../icons";
import { SafeImg } from "../SafeImg";
import { ModeShell, challengeLabel } from "../ModeShell";
import { Toggle } from "../Toggle";
import { WinPanel } from "../WinPanel";
import { ZoomImage } from "../ZoomImage";

export const WEAPON_HINT_AT = 3;
export const TIER_HINT_AT = 6;

const tierByName = new Map(tiers.map((t) => [t.name, t]));

export function SkinGame() {
  const { t, locale } = useI18n();
  const { today, answerId, yesterdayId, game, submit } = useModeGame("skin", registry);
  const grayscale = useGameStore((s) => s.settings.skinGrayscale);
  const setSetting = useGameStore((s) => s.setSetting);

  const options = useMemo(
    () =>
      skins
        .map((s) => ({
          id: s.id,
          label: s.name[locale],
          keywords: [s.name.en, s.name.es],
          sublabel: `${s.weaponName[locale]} · ${s.tier}`,
          image: s.thumb ?? s.image,
          imageShape: "wide" as const,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [locale],
  );

  const skin = answerId ? skinById.get(answerId) : undefined;
  const misses = game.guesses.filter((g) => g !== answerId).length;
  const zoom = zoomForMisses(misses, game.won);
  const tier = skin ? tierByName.get(skin.tier) : undefined;

  const shareText =
    today && game.won
      ? buildShareText({
          siteName: config.siteName,
          modeLabel: t("modes.skin.title"),
          challengeLabel: challengeLabel(t, today.dayIndex),
          attemptsLabel: t("share.attempts", { n: game.guesses.length }),
          rows: [simpleRow(game.guesses.length)],
          extra: game.hard ? [t("share.hard")] : [],
          url: `${config.siteUrl}/${locale}/skin/`,
        })
      : "";

  return (
    <ModeShell
      mode="skin"
      today={today}
      yesterday={yesterdayId ? skinById.get(yesterdayId)?.name[locale] : null}
    >
      {skin && (
        <>
          <div className="flex flex-col items-center gap-2">
            <ZoomImage
              testId="skin-zoom"
              src={skin.image}
              alt={t("skin.alt")}
              aspect={skin.aspect}
              poi={skin.poi}
              zoom={zoom}
              grayscale={grayscale && !game.won}
            />
            <div className="flex w-full items-center justify-between text-sm text-val-muted">
              <span>{t("skin.zoom", { z: zoom })}</span>
              {!game.won && (
                <Toggle
                  label={t("skin.grayscale")}
                  checked={grayscale}
                  onChange={(v) => setSetting("skinGrayscale", v)}
                />
              )}
            </div>
          </div>

          {!game.won && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <HintBox
                  testId="hint-weapon"
                  unlocked={misses >= WEAPON_HINT_AT}
                  progress={misses}
                  total={WEAPON_HINT_AT}
                  lockedText={t("skin.weaponHintIn", { n: WEAPON_HINT_AT - misses })}
                >
                  {t("skin.weaponHint", { weapon: skin.weaponName[locale] })}
                </HintBox>
                <HintBox
                  testId="hint-tier"
                  unlocked={misses >= TIER_HINT_AT}
                  progress={misses}
                  total={TIER_HINT_AT}
                  lockedText={t("skin.tierHintIn", { n: TIER_HINT_AT - misses })}
                >
                  <span className="inline-flex items-center gap-1">
                    {tier && (
                      <SafeImg
                        src={tier.icon}
                        alt=""
                        fallback={tier.name}
                        className="h-5 w-5 rounded text-[9px]"
                      />
                    )}
                    {t("skin.tierHint", { tier: skin.tier })}
                  </span>
                </HintBox>
              </div>
              <GuessInput
                options={options}
                excludeIds={game.guesses}
                onGuess={(id) => submit(id, { hard: grayscale })}
                shakeKey={misses}
                placeholder={t("guess.skinPlaceholder")}
              />
            </>
          )}

          {game.won && (
            <WinPanel
              mode="skin"
              attempts={game.guesses.length}
              answerName={skin.name[locale]}
              answerImage={skin.image}
              imageShape="wide"
              shareText={shareText}
            >
              {game.hard && <p className="font-semibold text-partial">{t("skin.hardMedal")}</p>}
            </WinPanel>
          )}

          <ul className="flex flex-col gap-2" data-testid="guess-list">
            {[...game.guesses].reverse().map((id) => {
              const s = skinById.get(id);
              const ok = id === answerId;
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
                  {s && (
                    <SafeImg
                      src={s.thumb ?? s.image}
                      alt=""
                      fallback={s.weapon}
                      className="h-10 w-24 shrink-0 rounded-lg bg-black/20 object-contain px-1 text-sm"
                    />
                  )}
                  <span className="flex-1 truncate">{s?.name[locale] ?? id}</span>
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
