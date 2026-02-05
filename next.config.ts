import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // distDir: ".next-dev", // Commented out for Vercel deployment
};

export default nextConfig;
