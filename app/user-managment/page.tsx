import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'User Management Redirect',
  description: 'Redirect alias for user management.',
  path: '/user-managment',
  noIndex: true,
});

export default function UserManagmentAliasPage() {
  redirect('/user-management');
}
