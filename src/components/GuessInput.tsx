"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchOptions } from "@/lib/normalize";
import { useI18n } from "@/i18n/I18nProvider";
import { ArrowRightIcon, SearchIcon } from "./icons";
import { SafeImg } from "./SafeImg";

export type GuessOption = {
  id: string;
  label: string;
  /** Textos adicionales por los que se puede buscar (p. ej. el nombre en el otro idioma). */
  keywords?: string[];
  sublabel?: string;
  image?: string;
  /** "square" para retratos, "wide" para skins. */
  imageShape?: "square" | "wide";
};

type Props = {
  options: readonly GuessOption[];
  excludeIds: readonly string[];
  onGuess: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  /** Cambia (p. ej. nº de fallos) para hacer temblar la caja tras un intento incorrecto. */
  shakeKey?: number;
};

/** Autocompletado accesible (patrón combobox de ARIA), navegable con ↑ ↓ Enter Esc. */
export function GuessInput({
  options,
  excludeIds,
  onGuess,
  placeholder,
  disabled,
  shakeKey = 0,
}: Props) {
  const { t } = useI18n();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState(false);
  const firstShake = useRef(shakeKey);

  useEffect(() => {
    if (shakeKey === firstShake.current) return;
    setShaking(true);
    const id = setTimeout(() => setShaking(false), 450);
    return () => clearTimeout(id);
  }, [shakeKey]);

  const available = useMemo(() => {
    const excluded = new Set(excludeIds);
    return options.filter((o) => !excluded.has(o.id));
  }, [options, excludeIds]);

  const results = useMemo(
    () => searchOptions(available, query, (o) => [o.label, ...(o.keywords ?? [])], 8),
    [available, query],
  );

  const submit = (option: GuessOption | undefined) => {
    if (!option || disabled) return;
    onGuess(option.id);
    setQuery("");
    setActive(0);
    setOpen(false);
    inputRef.current?.focus();
  };

  const showList = open && results.length > 0;

  return (
    <div className="relative z-20 w-full">
      <form
        className={`flex gap-2 ${shaking ? "animate-shake" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          submit(results[active] ?? results[0]);
        }}
      >
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-val-muted" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList ? `${listId}-${active}` : undefined}
            aria-label={placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setActive((i) => (results.length ? (i + 1) % results.length : 0));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={`w-full rounded-xl border-2 bg-val-ink-2/90 py-3.5 pl-11 pr-3 text-base text-val-cream shadow-inner transition placeholder:text-val-muted/70 focus:border-val-red focus:shadow-[0_0_0_4px_rgb(255_70_85/0.15)] focus:outline-none focus-visible:outline-none disabled:opacity-50 ${
              shaking ? "border-miss" : "border-white/10"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || results.length === 0}
          aria-label={t("guess.submit")}
          className="btn-primary grid w-14 place-items-center rounded-xl text-white transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          <ArrowRightIcon className="h-6 w-6" />
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-white/10 bg-val-ink-2/95 p-1 shadow-2xl shadow-black/60 backdrop-blur"
        >
          {results.map((o, i) => (
            <li
              key={o.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                submit(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                i === active ? "bg-val-red/15 ring-1 ring-val-red/40" : "hover:bg-white/5"
              }`}
            >
              {o.image && (
                <SafeImg
                  src={o.image}
                  alt=""
                  fallback={o.label}
                  loading="lazy"
                  className={
                    o.imageShape === "wide"
                      ? "h-8 w-20 shrink-0 rounded object-contain"
                      : "h-10 w-10 shrink-0 rounded-lg bg-val-ink object-cover text-sm ring-1 ring-white/10"
                  }
                />
              )}
              <span className="min-w-0">
                <span className="block truncate font-semibold">{o.label}</span>
                {o.sublabel && (
                  <span className="block truncate text-xs text-val-muted">{o.sublabel}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
