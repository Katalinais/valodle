"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { modeHref, nextMode, type ModeId } from "@/lib/modes";
import { Celebration } from "./Celebration";
import { Countdown } from "./Countdown";
import { ArrowRightIcon, CheckIcon, ModeIcon } from "./icons";
import { SafeImg } from "./SafeImg";
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
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      aria-live="polite"
      data-testid="win-panel"
      className="panel corners relative mx-auto flex w-full max-w-md flex-col items-center gap-4 overflow-visible p-6 text-center"
    >
      <Celebration />
      <motion.span
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
        className="grid h-14 w-14 place-items-center rounded-full bg-hit text-white shadow-[0_0_30px_-4px_rgb(63_163_77/0.9)]"
      >
        <CheckIcon className="h-8 w-8" />
      </motion.span>
      <div>
        <h2 className="font-display text-5xl leading-none tracking-wide text-hit">
          {t("win.title")}
        </h2>
        <p className="mt-1 text-sm text-val-muted">{t("win.attempts", { n: attempts })}</p>
      </div>

      <div className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-3 text-left">
        {answerImage && (
          <SafeImg
            src={answerImage}
            alt=""
            fallback={answerName}
            className={
              imageShape === "wide"
                ? "h-16 w-36 shrink-0 object-contain"
                : "h-16 w-16 shrink-0 rounded-lg bg-val-ink object-cover text-xl ring-2 ring-hit/60"
            }
          />
        )}
        <p className="min-w-0">
          <span className="tag">{t("win.answerWas")}</span>
          <span className="block truncate font-display text-3xl leading-tight tracking-wide">
            {answerName}
          </span>
        </p>
      </div>

      {children}
      <ShareButton text={shareText} />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <Countdown />
      {next ? (
        <Link
          href={modeHref(locale, next)}
          className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-val-red/60 hover:bg-val-red/10"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-val-red/15 text-val-red">
            <ModeIcon mode={next} className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="tag">{t("win.next")}</span>
            <span className="block font-display text-2xl leading-none tracking-wide">
              {t(`modes.${next}.title`)}
            </span>
          </span>
          <ArrowRightIcon className="h-5 w-5 text-val-muted transition group-hover:translate-x-1 group-hover:text-val-red" />
        </Link>
      ) : (
        <Link
          href={`/${locale}/`}
          className="text-sm text-val-muted underline-offset-4 hover:text-val-cream hover:underline"
        >
          {t("win.allDone")}
        </Link>
      )}
    </motion.section>
  );
}
