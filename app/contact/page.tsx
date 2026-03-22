import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description: "Get in touch with the Mods Haven team for any questions or assistance.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactClient />;
}
