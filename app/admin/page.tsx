import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/user/login');
  }

  return <AdminDashboardClient />;
}
