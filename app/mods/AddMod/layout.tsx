import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Add Mod",
  description: "Submit your mod to the Mods Haven library.",
  path: "/mods/AddMod",
});

export default function AddModLayout({ children }: { children: React.ReactNode }) {
  return children;
}
