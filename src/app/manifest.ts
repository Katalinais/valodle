import type { MetadataRoute } from "next";
import { config } from "@/config";
import { dictionaries } from "@/i18n";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.siteName,
    short_name: config.siteName,
    description: dictionaries[config.defaultLocale].meta.description,
    start_url: `/${config.defaultLocale}/`,
    display: "standalone",
    background_color: "#0f1923",
    theme_color: "#0f1923",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
