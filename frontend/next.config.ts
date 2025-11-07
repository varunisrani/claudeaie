import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Web app config - supports API routes and SSR */
  distDir: '.next',
  images: {
    unoptimized: true, // Disable Image Optimization for development
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Enable trailing slashes for consistency
  trailingSlash: true,
  // Skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;