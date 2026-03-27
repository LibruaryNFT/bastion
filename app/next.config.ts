import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle pino-pretty as optional (don't bundle it)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "pino-pretty": false,
        "encoding": false,
      };
    }
    return config;
  },
};

export default nextConfig;
