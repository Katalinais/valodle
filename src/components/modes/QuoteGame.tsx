"use client";

import { useMemo } from "react";
import { config } from "@/config";
import { agentById, agents, quotes } from "@/data";
import { quoteId } from "@/data/pools";
import registry from "@/data/generated/registry/quote.json";
import { useI18n } from "@/i18n/I18nProvider";
import { agentOptions } from "@/lib/agentFormat";
import { buildShareText, simpleRow } from "@/lib/share";
import { useModeGame } from "@/lib/useModeGame";
import { AgentGuessList } from "../AgentGuessList";
import { GuessInput } from "../GuessInput";
import { HintBox } from "../HintBox";
import { ModeShell, challengeLabel } from "../ModeShell";
import { WinPanel } from "../WinPanel";

export const ROLE_HINT_AT = 4;
export const AUDIO_HINT_AT = 7;

const quoteById = new Map(quotes.map((q) => [quoteId(q), q]));
const toAgent = (id: string) => quoteById.get(id)?.agentId ?? id;

export function QuoteGame() {
  const { t, locale } = useI18n();
  const { today, answerId, target, yesterdayId, game, submit } = useModeGame(
    "quote",
    registry,
    toAgent,
  );
  const options = useMemo(() => agentOptions(agents, locale), [locale]);
  const quote = answerId ? quoteById.get(answerId) : undefined;
  const agent = target ? agentById.get(target) : undefined;
  const misses = game.guesses.filter((g) => g !== target).length;

  const shareText =
    today && game.won
      ? buildShareText({
          siteName: config.siteName,
          modeLabel: t("modes.quote.title"),
          challengeLabel: challengeLabel(t, today.dayIndex),
          attemptsLabel: t("share.attempts", { n: game.guesses.length }),
          rows: [simpleRow(game.guesses.length)],
          url: `${config.siteUrl}/${locale}/frase/`,
        })
      : "";

  return (
    <ModeShell
      mode="quote"
      today={today}
      yesterday={yesterdayId ? agentById.get(toAgent(yesterdayId))?.name[locale] : null}
    >
      {quote && agent && (
        <>
          <figure className="panel corners relative mt-4 px-6 pb-6 pt-9 text-center">
            <span
              aria-hidden
              className="absolute left-1/2 top-0 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-val-red font-display text-4xl leading-none text-white shadow-[0_0_18px_-2px_rgb(255_70_85/0.8)]"
            >
              “
            </span>
            <blockquote
              className="font-display text-4xl leading-tight tracking-wide"
              data-testid="quote-text"
              lang={quote.text[locale] ? locale : "en"}
            >
              {quote.text[locale] ?? quote.text.en}
            </blockquote>
          </figure>
          {!game.won && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <HintBox
                  testId="hint-role"
                  unlocked={misses >= ROLE_HINT_AT}
                  progress={misses}
                  total={ROLE_HINT_AT}
                  lockedText={t("quote.roleHintIn", { n: ROLE_HINT_AT - misses })}
                >
                  {t("quote.roleHint", { role: agent.role.name[locale] })}
                </HintBox>
                {quote.audioUrl && (
                  <HintBox
                    testId="hint-audio"
                    unlocked={misses >= AUDIO_HINT_AT}
                    progress={misses}
                    total={AUDIO_HINT_AT}
                    lockedText={t("quote.audioHintIn", { n: AUDIO_HINT_AT - misses })}
                  >
                    <span className="mb-1 block">{t("quote.audioHint")}</span>
                    <audio
                      controls
                      preload="none"
                      src={quote.audioUrl}
                      className="mx-auto w-full"
                    />
                  </HintBox>
                )}
              </div>
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
              mode="quote"
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
