"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";

/** Sincroniza <html lang> con el idioma de la ruta. */
export function HtmlLang() {
  const { locale } = useI18n();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
