import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import HoverFooter from "./components/footer_setup";
import { NavBar } from "./components/tubelight-navbar"
import PixelBlastClient from "./components/PixelBlastClient";
import PageTransition from '@/app/components/PageTransition';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon/logo_1.png`,
  sameAs: ["https://modshaven.com", "https://www.modshaven.com", "https://discord.com/invite/7zPyFdYK"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/mods?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",

});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Game Modification Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  keywords: [
    "mods",
    "game mods",
    "BeamNG mods",
    "Assetto Corsa mods",
    "mod downloads",
    "Mods Haven",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} - Game Modification Platform`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Game Modification Platform`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/icon/logo_1.ico", type: "image/x-icon" },
      { url: "/icon/logo_1.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/icon/logo_1.ico"],
    apple: [{ url: "/icon/logo_1.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://image.modshaven.com" />
        <link rel="preconnect" href="https://image.modshaven.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} antialiased `}
      >
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NavBar />
        <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
          <PixelBlastClient
      
          />
        </div>
        <div className="relative " style={{ zIndex: 1 }}>
          <PageTransition>{children}</PageTransition>
        </div>
        <HoverFooter />
      </body>
    </html>
  );
}
