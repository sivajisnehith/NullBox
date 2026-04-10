import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Fix for Prisma engine and other binary dependencies during build
  serverExternalPackages: ['dockerode', 'ssh2', '@prisma/client', 'prisma'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
