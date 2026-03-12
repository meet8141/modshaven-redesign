import { notFound } from 'next/navigation';
import { getModById } from '@/lib/DB';
import DownloadClient from './DownloadClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) return { title: 'Download - Mods Haven' };
  const mod = await getModById(id);
  return {
    title: mod ? `Download ${mod.name} - Mods Haven` : 'Download - Mods Haven',
    icons: { icon: '/icon/logo_1.ico' },
  };
}

export default async function DownloadPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) return notFound();

  const mod = await getModById(id);
  if (!mod) return notFound();

  return <DownloadClient mod={mod} />;
}
