import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "Mods Haven - About Us",
  description: "Learn about Mods Haven, our mission to connect gamers with quality mods, and the passionate team behind it all.",
  icons: {
    icon: '/icon/logo_1.ico',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
