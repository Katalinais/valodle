"use client";

import { useMemo } from "react";
import { config } from "@/config";
import { agentById, agents, emojis } from "@/data";
import registry from "@/data/generated/registry/emoji.json";
import { useI18n } from "@/i18n/I18nProvider";
import { agentOptions } from "@/lib/agentFormat";
import { buildShareText, simpleRow } from "@/lib/share";
import { useModeGame } from "@/lib/useModeGame";
import { AgentGuessList } from "../AgentGuessList";
import { GuessInput } from "../GuessInput";
import { ModeShell, challengeLabel } from "../ModeShell";
import { WinPanel } from "../WinPanel";

export const MAX_EMOJIS = 5;

export function EmojiGame() {
  const { t, locale } = useI18n();
  const { today, answerId, yesterdayId, game, submit } = useModeGame("emoji", registry);
  const options = useMemo(() => agentOptions(agents, locale), [locale]);
  const agent = answerId ? agentById.get(answerId) : undefined;
  const list = answerId ? (emojis[answerId] ?? []) : [];
  const misses = game.guesses.filter((g) => g !== answerId).length;
  const revealed = game.won ? MAX_EMOJIS : Math.min(MAX_EMOJIS, 1 + misses);

  const shareText =
    today && game.won
      ? buildShareText({
          siteName: config.siteName,
          modeLabel: t("modes.emoji.title"),
          challengeLabel: challengeLabel(t, today.dayIndex),
          attemptsLabel: t("share.attempts", { n: game.guesses.length }),
          rows: [simpleRow(game.guesses.length)],
          url: `${config.siteUrl}/${locale}/emoji/`,
        })
      : "";

  return (
    <ModeShell
      mode="emoji"
      today={today}
      yesterday={yesterdayId ? agentById.get(yesterdayId)?.name[locale] : null}
    >
      {agent && (
        <>
          <div className="flex flex-col items-center gap-2">
            <ul
              className="flex gap-2"
              data-testid="emoji-list"
              aria-label={t("modes.emoji.prompt")}
            >
              {list.map((e, i) => (
                <li
                  key={i}
                  data-revealed={i < revealed}
                  className="grid h-14 w-14 place-items-center rounded-lg border-2 border-val-ink-3 bg-val-ink-2 text-3xl"
                >
                  {i < revealed ? e : <span className="text-val-muted">?</span>}
                </li>
              ))}
            </ul>
            {!game.won && (
              <p className="text-xs text-val-muted">
                {revealed < MAX_EMOJIS ? t("emoji.revealIn") : t("emoji.allRevealed")}
              </p>
            )}
          </div>
          {!game.won && (
            <GuessInput
              options={options}
              excludeIds={game.guesses}
              onGuess={(id) => submit(id)}
              placeholder={t("guess.agentPlaceholder")}
            />
          )}
          {game.won && (
            <WinPanel
              mode="emoji"
              attempts={game.guesses.length}
              answerName={agent.name[locale]}
              answerImage={agent.icon}
              shareText={shareText}
            />
          )}
          <AgentGuessList guesses={game.guesses} target={agent.id} />
        </>
      )}
    </ModeShell>
  );
}
