import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/my-account"],
    },
    sitemap: "https://elitewholesale.online/sitemap.xml",
  };
}
