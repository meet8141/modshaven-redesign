import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://modshaven.com";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || FALLBACK_SITE_URL;

export const SITE_NAME = "Mods Haven";
export const DEFAULT_DESCRIPTION =
  "Discover high-quality game mods, tools, and resources for BeamNG.drive and Assetto Corsa.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon/logo_1.png`;

export function absoluteUrl(path = "/") {
  if (!path.startsWith("/")) {
    return `${SITE_URL}/${path}`;
  }

  return `${SITE_URL}${path}`;
}

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  image?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  image,
}: BuildPageMetadataInput): Metadata {
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
