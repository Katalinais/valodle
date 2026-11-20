import type { Metadata } from "next";
import { config, isLocale, type Locale } from "@/config";
import { dictionaries, translate } from "@/i18n";
import { MODES, type ModeId } from "./modes";

type Params = { params: Promise<{ locale: string }> };

/** Metadatos (título, descripción, OG, alternates) de la página de un modo. */
export function modeMetadata(mode: ModeId) {
  return async ({ params }: Params): Promise<Metadata> => {
    const { locale: raw } = await params;
    const locale: Locale = isLocale(raw) ? raw : config.defaultLocale;
    const m = dictionaries[locale];
    const slug = MODES.find((x) => x.id === mode)!.slug;
    const title = translate(m, `modes.${mode}.title`);
    const description = `${translate(m, `modes.${mode}.prompt`)}. ${m.meta.description}`;
    return {
      title,
      description,
      alternates: {
        canonical: `/${locale}/${slug}/`,
        languages: Object.fromEntries(config.locales.map((l) => [l, `/${l}/${slug}/`])),
      },
      openGraph: { title: `${title} · ${config.siteName}`, description, locale },
    };
  };
}
