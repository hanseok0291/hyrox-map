import type { NextConfig } from "next";
import path from "path";

/** 프로젝트 폴더만 루트로 고정 (상위 ~/package-lock.json 때문에 전체 홈 감시되는 문제 방지) */
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/prisma/**/*.db",
          "**/prisma/**/*.db-journal",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
