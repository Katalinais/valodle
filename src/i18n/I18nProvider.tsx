"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { Locale } from "@/config";
import { dictionaries, translate, type TranslateVars } from "./index";

type I18nValue = {
  locale: Locale;
  t: (key: string, vars?: TranslateVars) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const messages = dictionaries[locale];
  const t = useCallback(
    (key: string, vars?: TranslateVars) => translate(messages, key, vars),
    [messages],
  );
  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
