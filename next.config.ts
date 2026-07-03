import type { NextConfig } from "next";

const isCloudflareBuild = process.env.CLOUDFLARE_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isCloudflareBuild
    ? { output: "export" as const, images: { unoptimized: true } }
    : { output: "standalone" as const }),
  serverExternalPackages: ["mssql"],
};

export default nextConfig;
