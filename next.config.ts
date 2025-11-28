import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 👈 enables static site generation for GitHub Pages
  basePath: "/website", // 👈 must match your repo name exactly
  assetPrefix: "/website/", // 👈 ensures assets load correctly
  images: {
    unoptimized: true, // 👈 disables Next.js image optimization (needed for static hosting)
  },
  trailingSlash: true, // 👈 ensures proper routing on GitHub Pages
};

export default nextConfig;

