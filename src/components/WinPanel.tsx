"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { modeHref, nextMode, type ModeId } from "@/lib/modes";
import { Countdown } from "./Countdown";
import { ShareButton } from "./ShareButton";

type Props = {
  mode: ModeId;
  attempts: number;
  answerName: string;
  answerImage?: string;
  imageShape?: "square" | "wide";
  shareText: string;
  children?: React.ReactNode;
};

export function WinPanel({
  mode,
  attempts,
  answerName,
  answerImage,
  imageShape = "square",
  shareText,
  children,
}: Props) {
  const { t, locale } = useI18n();
  const next = nextMode(mode);
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-live="polite"
      data-testid="win-panel"
      className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border-2 border-hit bg-val-ink-2 p-5 text-center"
    >
      <h2 className="font-display text-4xl tracking-wide text-hit">{t("win.title")}</h2>
      <div className="flex items-center gap-3">
        {answerImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={answerImage}
            alt=""
            className={
              imageShape === "wide"
                ? "h-14 w-36 object-contain"
                : "h-16 w-16 rounded bg-val-ink object-cover"
            }
          />
        )}
        <p className="text-left">
          <span className="block text-sm text-val-muted">{t("win.answerWas")}</span>
          <span className="font-display text-3xl tracking-wide">{answerName}</span>
        </p>
      </div>
      <p>{t("win.attempts", { n: attempts })}</p>
      {children}
      <ShareButton text={shareText} />
      <Countdown />
      {next ? (
        <Link
          href={modeHref(locale, next)}
          className="rounded border-2 border-val-cream px-5 py-2 font-display text-xl tracking-wider hover:border-val-red hover:text-val-red"
        >
          {t("win.nextMode", { mode: t(`modes.${next}.title`) })} →
        </Link>
      ) : (
        <Link href={`/${locale}/`} className="underline hover:text-val-red">
          {t("win.allDone")}
        </Link>
      )}
    </motion.section>
  );
}
