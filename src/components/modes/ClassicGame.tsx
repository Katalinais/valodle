"use client";

import { useMemo } from "react";
import { config } from "@/config";
import { agentById, agents } from "@/data";
import registry from "@/data/generated/registry/classic.json";
import { useI18n } from "@/i18n/I18nProvider";
import { agentOptions } from "@/lib/agentFormat";
import { CLASSIC_COLUMNS, compareAgents, resultToSquares } from "@/lib/compare";
import { buildShareText } from "@/lib/share";
import { useAnimateFrom, useDelayedTrue } from "@/lib/useAnimateFrom";
import { useModeGame } from "@/lib/useModeGame";
import { ClassicGrid, ClassicLegend } from "../ClassicGrid";
import { GuessInput } from "../GuessInput";
import { ModeShell, challengeLabel } from "../ModeShell";
import { WinPanel } from "../WinPanel";

const FLIP_TOTAL_MS = (CLASSIC_COLUMNS.length + 1) * 300 + 200;

export function ClassicGame() {
  const { t, locale } = useI18n();
  const { today, answerId, yesterdayId, game, submit } = useModeGame("classic", registry);
  const answer = answerId ? agentById.get(answerId) : undefined;
  const guesses = useMemo(
    () => game.guesses.map((id) => agentById.get(id)).filter((a) => a !== undefined),
    [game.guesses],
  );
  const options = useMemo(() => agentOptions(agents, locale), [locale]);
  const animateFrom = useAnimateFrom(today !== null, game.guesses.length);
  const wonBeforeLoad = game.won && animateFrom >= game.guesses.length;
  const showWin = useDelayedTrue(game.won, FLIP_TOTAL_MS, wonBeforeLoad);

  const yesterday = yesterdayId ? agentById.get(yesterdayId)?.name[locale] : null;

  const shareText =
    answer && today
      ? buildShareText({
          siteName: config.siteName,
          modeLabel: t("modes.classic.title"),
          challengeLabel: challengeLabel(t, today.dayIndex),
          attemptsLabel: t("share.attempts", { n: guesses.length }),
          rows: guesses.map((g) => resultToSquares(compareAgents(g, answer))),
          url: `${config.siteUrl}/${locale}/clasico/`,
        })
      : "";

  return (
    <ModeShell mode="classic" today={today} yesterday={yesterday}>
      {answer && (
        <>
          {!game.won && (
            <GuessInput
              options={options}
              excludeIds={game.guesses}
              onGuess={(id) => submit(id)}
              placeholder={t("guess.agentPlaceholder")}
            />
          )}
          {showWin && (
            <WinPanel
              mode="classic"
              attempts={guesses.length}
              answerName={answer.name[locale]}
              answerImage={answer.icon}
              shareText={shareText}
            />
          )}
          <ClassicGrid guesses={guesses} answer={answer} animateFrom={animateFrom} />
          {guesses.length > 0 && <ClassicLegend />}
        </>
      )}
    </ModeShell>
  );
}
