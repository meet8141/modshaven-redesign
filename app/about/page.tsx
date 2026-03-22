import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description:
    "Learn about Mods Haven, our mission to connect gamers with quality mods, and the passionate team behind it all.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutClient />;
}
