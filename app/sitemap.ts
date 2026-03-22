import type { MetadataRoute } from "next";
import { getAllMods } from "@/lib/DB";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const staticRoutes = [
  "/",
  "/about",
  "/contact",
  "/mods",
  "/send",
  "/resources/privacy",
  "/resources/terms",
  "/resources/toc",
  "/resources/safety",
  "/resources/dmca",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));

  try {
    const mods = await getAllMods();

    const modEntries: MetadataRoute.Sitemap = mods
      .filter((mod) => mod?.name)
      .map((mod) => {
        const slug = mod.slug || encodeURIComponent(mod.name);
        const updatedAt = mod.updatedAt || mod.date_added;

        return {
          url: `${SITE_URL}/mods/${slug}`,
          lastModified: updatedAt ? new Date(updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        };
      });

    return [...staticEntries, ...modEntries];
  } catch {
    // Return static entries even if DB is unavailable.
    return staticEntries;
  }
}
