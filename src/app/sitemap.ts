import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.creos-labs.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...["/privacy", "/terms", "/cookies"].map((path) => ({
      url: `https://www.creos-labs.com${path}`,
      lastModified: new Date("2026-10-09"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
