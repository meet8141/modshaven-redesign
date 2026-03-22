import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "ModsHaven",
    description:
      "Discover high-quality game mods, tools, and resources for BeamNG.drive and Assetto Corsa.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#ff6600",
    icons: [
      {
        src: `${SITE_URL}/icon/logo_1.png`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `${SITE_URL}/icon/logo_1.ico`,
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
