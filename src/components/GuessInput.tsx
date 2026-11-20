"use client";

import { useId, useMemo, useRef, useState } from "react";
import { searchOptions } from "@/lib/normalize";
import { useI18n } from "@/i18n/I18nProvider";

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
};

/** Autocompletado accesible (patrón combobox de ARIA), navegable con ↑ ↓ Enter Esc. */
export function GuessInput({ options, excludeIds, onGuess, placeholder, disabled }: Props) {
  const { t } = useI18n();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="relative w-full">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(results[active] ?? results[0]);
        }}
      >
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
          className="min-w-0 flex-1 rounded border-2 border-val-ink-3 bg-val-ink-2 px-3 py-3 text-base text-val-cream placeholder:text-val-muted focus:border-val-red focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || results.length === 0}
          aria-label={t("guess.submit")}
          className="rounded bg-val-red px-4 font-display text-2xl text-white transition hover:bg-val-red-dark disabled:opacity-40"
        >
          ➤
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded border border-val-ink-3 bg-val-ink-2 shadow-xl"
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
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                i === active ? "bg-val-ink-3" : ""
              }`}
            >
              {o.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={o.image}
                  alt=""
                  loading="lazy"
                  className={
                    o.imageShape === "wide"
                      ? "h-8 w-20 shrink-0 object-contain"
                      : "h-10 w-10 shrink-0 rounded bg-val-ink object-cover"
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
