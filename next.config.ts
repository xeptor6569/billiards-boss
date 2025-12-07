import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (PPR)
  cacheComponents: true,
  // React Compiler support
  reactCompiler: true,
};

export default nextConfig;
