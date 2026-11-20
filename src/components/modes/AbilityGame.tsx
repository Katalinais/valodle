"use client";

import { useMemo } from "react";
import { config } from "@/config";
import { abilities, agentById, agents } from "@/data";
import registry from "@/data/generated/registry/ability.json";
import { useI18n } from "@/i18n/I18nProvider";
import { agentOptions } from "@/lib/agentFormat";
import { KEY_HINT_AT, ROTATIONS, abilityStyle } from "@/lib/abilityDifficulty";
import { daySeed, mulberry32, shuffle } from "@/lib/daily";
import { buildShareText, simpleRow } from "@/lib/share";
import { useModeGame } from "@/lib/useModeGame";
import { useGameStore } from "@/store/gameStore";
import { AgentGuessList } from "../AgentGuessList";
import { GuessInput } from "../GuessInput";
import { HintBox } from "../HintBox";
import { SafeImg } from "../SafeImg";
import { ModeShell, challengeLabel } from "../ModeShell";
import { Toggle } from "../Toggle";
import { WinPanel } from "../WinPanel";

const abilityById = new Map(abilities.map((a) => [a.id, a]));
const toAgent = (abilityId: string) => abilityById.get(abilityId)?.agentId ?? abilityId;

export function AbilityGame() {
  const { t, locale } = useI18n();
  const { today, answerId, target, yesterdayId, game, submit, setBonus } = useModeGame(
    "ability",
    registry,
    toAgent,
  );
  const settings = useGameStore((s) => s.settings);
  const setSetting = useGameStore((s) => s.setSetting);
  const options = useMemo(() => agentOptions(agents, locale), [locale]);

  const ability = answerId ? abilityById.get(answerId) : undefined;
  const agent = target ? agentById.get(target) : undefined;
  const misses = game.guesses.filter((g) => g !== target).length;

  const seed = today ? daySeed(today.dateKey, "ability") : 0;
  const baseRotation = ROTATIONS[seed % ROTATIONS.length];
  const style = game.won
    ? { rotation: 0, gray: 0 }
    : abilityStyle(baseRotation, misses, {
        rotation: settings.abilityRotation,
        grayscale: settings.abilityGrayscale,
      });

  const bonusOptions = useMemo(() => {
    if (!agent) return [];
    return shuffle(
      abilities.filter((a) => a.agentId === agent.id),
      mulberry32(seed),
    );
  }, [agent, seed]);

  const yesterdayAbility = yesterdayId ? abilityById.get(yesterdayId) : undefined;
  const yesterday = yesterdayAbility
    ? `${agentById.get(yesterdayAbility.agentId)?.name[locale]} — ${yesterdayAbility.name[locale]}`
    : null;

  const shareText =
    today && game.won
      ? buildShareText({
          siteName: config.siteName,
          modeLabel: t("modes.ability.title"),
          challengeLabel: challengeLabel(t, today.dayIndex),
          attemptsLabel: t("share.attempts", { n: game.guesses.length }),
          rows: [simpleRow(game.guesses.length)],
          extra: game.bonusCorrect ? [t("share.bonus")] : [],
          url: `${config.siteUrl}/${locale}/habilidad/`,
        })
      : "";

  return (
    <ModeShell mode="ability" today={today} yesterday={yesterday}>
      {ability && agent && (
        <>
          <div className="flex flex-col items-center gap-3">
            <div className="panel corners grid h-48 w-48 place-items-center overflow-hidden bg-[radial-gradient(circle,_rgb(255_70_85/0.18),_transparent_65%)]">
              <SafeImg
                src={ability.icon}
                alt={t("modes.ability.prompt")}
                fallback="?"
                testId="ability-icon"
                className="h-28 w-28 rounded-xl object-contain text-5xl drop-shadow-[0_0_14px_rgb(255_255_255/0.25)] transition-[transform,filter] duration-700"
                style={{
                  transform: `rotate(${style.rotation}deg)`,
                  filter: `grayscale(${style.gray})`,
                }}
              />
            </div>
            {!game.won && (
              <div className="flex gap-4">
                <Toggle
                  label={t("ability.rotation")}
                  checked={settings.abilityRotation}
                  onChange={(v) => setSetting("abilityRotation", v)}
                />
                <Toggle
                  label={t("ability.grayscale")}
                  checked={settings.abilityGrayscale}
                  onChange={(v) => setSetting("abilityGrayscale", v)}
                />
              </div>
            )}
          </div>

          {!game.won && (
            <>
              <HintBox
                testId="hint-key"
                unlocked={misses >= KEY_HINT_AT}
                progress={misses}
                total={KEY_HINT_AT}
                lockedText={t("ability.keyHintIn", { n: KEY_HINT_AT - misses })}
              >
                {t("ability.keyHint", { key: ability.key })}
              </HintBox>
              <GuessInput
                options={options}
                excludeIds={game.guesses}
                onGuess={(id) => submit(id)}
                shakeKey={misses}
                placeholder={t("guess.agentPlaceholder")}
              />
            </>
          )}

          {game.won && (
            <WinPanel
              mode="ability"
              attempts={game.guesses.length}
              answerName={agent.name[locale]}
              answerImage={agent.icon}
              shareText={shareText}
            >
              <div className="w-full" data-testid="bonus">
                <p className="mb-2 font-semibold">{t("ability.bonusTitle")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {bonusOptions.map((opt) => {
                    const picked = game.bonusPick === opt.id;
                    const correct = opt.id === ability.id;
                    const reveal = game.bonusPick !== undefined;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={reveal}
                        onClick={() => setBonus(opt.id, correct)}
                        className={`rounded border-2 px-2 py-2 text-sm font-semibold transition ${
                          reveal && correct
                            ? "border-hit bg-hit text-white"
                            : reveal && picked
                              ? "border-miss bg-miss text-white"
                              : "border-val-ink-3 hover:border-val-cream"
                        }`}
                      >
                        {opt.name[locale]} <span className="opacity-60">({opt.key})</span>
                      </button>
                    );
                  })}
                </div>
                {game.bonusPick !== undefined && (
                  <p className="mt-2 text-sm">
                    {t(game.bonusCorrect ? "ability.bonusRight" : "ability.bonusWrong", {
                      name: ability.name[locale],
                    })}
                  </p>
                )}
              </div>
            </WinPanel>
          )}
          {target && <AgentGuessList guesses={game.guesses} target={target} />}
        </>
      )}
    </ModeShell>
  );
}
