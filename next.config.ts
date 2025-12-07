import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (PPR) - Core Next.js 16 feature
  cacheComponents: true,
  // React Compiler disabled - conflicts with Cache Components in Next.js 16
  // This causes cache to be disabled and hydration mismatches
  // Can be re-enabled in a future Next.js version when compatibility is fixed
  // reactCompiler: true,
};

export default nextConfig;
