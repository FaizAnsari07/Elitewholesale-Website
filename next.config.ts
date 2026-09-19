import type { NextConfig } from "next";

// Product images uploaded through the admin panel are served by the API host,
// so allow that host for next/image. Migrated images live in /public/uploads.
const apiUrl = process.env.CATALOG_API_URL ? new URL(process.env.CATALOG_API_URL) : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: apiUrl
      ? [
          {
            protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
            hostname: apiUrl.hostname,
            port: apiUrl.port,
            pathname: "/uploads/**",
          },
        ]
      : [],
    // Loopback is only reachable in local development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
