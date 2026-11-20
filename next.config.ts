import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Los e2e compilan en otra carpeta para no pisar la .next de un `next dev` en marcha.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
