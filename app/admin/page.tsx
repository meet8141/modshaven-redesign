import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import AdminDashboardClient from './AdminDashboardClient';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Admin Dashboard',
  description: 'Admin dashboard for Mods Haven.',
  path: '/admin',
  noIndex: true,
});

export default async function AdminPage() {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/user/login');
  }

  return <AdminDashboardClient />;
}
