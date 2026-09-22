import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@codesandbox/sandpack-react"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
