import type { Locale } from "@/config";
import { TODO, type Agent } from "@/data/schema";
import type { ClassicColumn } from "./compare";

type T = (key: string, vars?: Record<string, string | number>) => string;

const regionNames = new Map<Locale, Intl.DisplayNames>();
function region(locale: Locale, code: string, t: T): string {
  if (code === "unknown") return t("values.origin.unknown");
  let dn = regionNames.get(locale);
  if (!dn) {
    dn = new Intl.DisplayNames([locale === "es" ? "es-419" : "en"], { type: "region" });
    regionNames.set(locale, dn);
  }
  return dn.of(code) ?? code;
}

/** Texto localizado de un atributo del Clásico ("?" si es TODO). */
export function formatAgentValue(
  agent: Agent,
  column: ClassicColumn,
  locale: Locale,
  t: T,
): string {
  const unknown = t("classic.unknown");
  switch (column) {
    case "role":
      return agent.role.name[locale];
    case "origin":
      return agent.origin === TODO
        ? unknown
        : agent.origin.map((c) => region(locale, c, t)).join(", ");
    case "gender":
    case "species":
    case "affiliation": {
      const v = agent[column];
      return v === TODO ? unknown : t(`values.${column}.${v}`);
    }
    case "ultPoints":
    case "releaseYear": {
      const v = agent[column];
      return v === TODO ? unknown : String(v);
    }
  }
}

export function agentOptions(agents: Agent[], locale: Locale) {
  return agents
    .map((a) => ({
      id: a.id,
      label: a.name[locale],
      keywords: [a.name.en, a.name.es],
      sublabel: a.role.name[locale],
      image: a.icon,
    }))
    .sort((x, y) => x.label.localeCompare(y.label));
}
