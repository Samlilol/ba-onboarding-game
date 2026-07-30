import type { NextConfig } from "next";

const pagesBasePath =
  process.env.GITHUB_ACTIONS === "true" ? "/ba-onboarding-game" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath || undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
