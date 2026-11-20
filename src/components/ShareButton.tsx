"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/share";
import { useI18n } from "@/i18n/I18nProvider";

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
      className="rounded bg-val-red px-5 py-2 font-display text-xl tracking-wider text-white transition hover:bg-val-red-dark"
    >
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
