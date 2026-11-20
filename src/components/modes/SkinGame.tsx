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
          image: s.image,
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
                  lockedText={t("skin.weaponHintIn", { n: WEAPON_HINT_AT - misses })}
                >
                  {t("skin.weaponHint", { weapon: skin.weaponName[locale] })}
                </HintBox>
                <HintBox
                  testId="hint-tier"
                  unlocked={misses >= TIER_HINT_AT}
                  lockedText={t("skin.tierHintIn", { n: TIER_HINT_AT - misses })}
                >
                  <span className="inline-flex items-center gap-1">
                    {tier && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tier.icon} alt="" className="h-5 w-5" />
                    )}
                    {t("skin.tierHint", { tier: skin.tier })}
                  </span>
                </HintBox>
              </div>
              <GuessInput
                options={options}
                excludeIds={game.guesses}
                onGuess={(id) => submit(id, { hard: grayscale })}
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
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-status={ok ? "hit" : "miss"}
                  className={`flex items-center gap-3 rounded border-2 px-2 py-1.5 font-semibold text-white ${
                    ok ? "border-hit bg-hit" : "border-miss bg-miss"
                  }`}
                >
                  {s && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt="" className="h-8 w-20 object-contain" />
                  )}
                  <span className="flex-1 truncate">{s?.name[locale] ?? id}</span>
                  <span aria-label={t(ok ? "classic.legend.hit" : "classic.legend.miss")}>
                    {ok ? "✓" : "✗"}
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
