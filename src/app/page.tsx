"use client";

import { useEffect } from "react";
import { config } from "@/config";

/** Raíz: redirige al idioma del navegador (export estático → sin redirect de servidor). */
export default function RootRedirect() {
  useEffect(() => {
    const preferred = navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
    window.location.replace(`/${preferred}/`);
  }, []);
  return (
    <main className="grid min-h-dvh place-items-center">
      <a href={`/${config.defaultLocale}/`} className="text-val-red underline">
        {config.siteName}
      </a>
    </main>
  );
}
