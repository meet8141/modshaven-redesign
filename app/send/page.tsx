import type { Metadata } from "next";
import SendClient from "./SendClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit a Mod",
  description: "Submit your favorite mods to be added to the Mods Haven library.",
  path: "/send",
});

export default function SendPage() {
  return <SendClient />;
}
