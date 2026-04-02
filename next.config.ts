import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['dockerode', 'ssh2'],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
