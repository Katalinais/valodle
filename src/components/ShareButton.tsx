"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/share";
import { useI18n } from "@/i18n/I18nProvider";
import { CheckIcon, ShareIcon } from "./icons";

export function ShareButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(text);
        setState(ok ? "copied" : "error");
        setTimeout(() => setState("idle"), 2000);
      }}
      className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-display text-2xl tracking-wider text-white transition active:scale-95"
    >
      {state === "copied" ? <CheckIcon className="h-5 w-5" /> : <ShareIcon className="h-5 w-5" />}
      <span aria-live="polite">
        {state === "copied"
          ? t("share.copied")
          : state === "error"
            ? t("share.error")
            : t("share.button")}
      </span>
    </button>
  );
}
