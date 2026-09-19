import type { NextConfig } from "next";

// Images migrated from the old site live in /public/uploads. Images uploaded
// later through the admin panel are stored by the API; any /uploads/* request
// with no matching file in /public falls through to the API. CATALOG_API_URL
// must be set at build time.
const apiUrl = process.env.CATALOG_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Loopback is only reachable in local development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: apiUrl ? [{ source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` }] : [],
    };
  },
};

export default nextConfig;
