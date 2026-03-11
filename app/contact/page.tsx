import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Mods Haven - Contact Us",
  description: "Get in touch with the Mods Haven team for any questions or assistance.",
  icons: {
    icon: '/icon/logo_1.ico',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
