import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} as unknown as NextConfig;

export default nextConfig;
