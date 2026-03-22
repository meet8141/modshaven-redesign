import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import UserManagementClient from './UserManagementClient';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'User Management',
  description: 'Internal user management tools for Mods Haven staff.',
  path: '/user-management',
  noIndex: true,
});

export default async function UserManagementPage() {
  try {
    const user = await requireRole('ADMIN', 'MODERATOR');
    return <UserManagementClient currentRole={user.role} />;
  } catch {
    redirect('/user/login');
  }
}
