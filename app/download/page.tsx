import { notFound } from 'next/navigation';
import { getModById } from '@/lib/DB';
import DownloadClient from './DownloadClient';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 300;

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) {
    return buildPageMetadata({
      title: 'Download',
      description: 'Download your selected mod from Mods Haven.',
      path: '/download',
      noIndex: true,
    });
  }

  const mod = await getModById(id);

  if (!mod) {
    return buildPageMetadata({
      title: 'Download',
      description: 'The requested download was not found.',
      path: '/download',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `Download ${mod.name}`,
    description: `Download ${mod.name} safely from Mods Haven.`,
    path: `/download?id=${encodeURIComponent(id)}`,
    noIndex: true,
    image: mod.mod_image || undefined,
  });
}

export default async function DownloadPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) return notFound();

  const mod = await getModById(id);
  if (!mod) return notFound();

  return <DownloadClient mod={mod} />;
}
