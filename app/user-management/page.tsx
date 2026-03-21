import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import UserManagementClient from './UserManagementClient';

export default async function UserManagementPage() {
  try {
    const user = await requireRole('ADMIN', 'MODERATOR');
    return <UserManagementClient currentRole={user.role} />;
  } catch {
    redirect('/user/login');
  }
}
