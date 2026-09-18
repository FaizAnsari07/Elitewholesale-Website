import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/wp-content/uploads/**",
      },
    ],
    // The image optimizer refuses to fetch from loopback/private IPs by
    // default (SSRF protection). Safe here: this only ever points at our
    // own local WordPress backend (wordpress/docker-compose.yml), never at
    // user-controlled input. A real deployment's WORDPRESS_GRAPHQL_URL
    // would point at a real domain instead, so this flag is a no-op there.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
