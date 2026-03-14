import type { Metadata } from "next";
import SendClient from "./SendClient";

export const metadata: Metadata = {
  title: "Mods Haven - Submit a Mod",
  description: "Submit your favorite mods to be added to the Mods Haven library.",
  icons: {
    icon: "/icon/logo_1.ico",
  },
};

export default function SendPage() {
  return <SendClient />;
}
