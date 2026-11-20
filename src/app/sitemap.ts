import type { MetadataRoute } from "next";
import { config } from "@/config";
import { MODES } from "@/lib/modes";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...MODES.map((m) => `${m.slug}/`)];
  return config.locales.flatMap((locale) =>
    paths.map((p) => ({
      url: `${config.siteUrl}/${locale}/${p}`,
      changeFrequency: "daily" as const,
      alternates: {
        languages: Object.fromEntries(
          config.locales.map((l) => [l, `${config.siteUrl}/${l}/${p}`]),
        ),
      },
    })),
  );
}
