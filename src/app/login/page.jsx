import { redirect } from 'next/navigation';

export default function RootAdminLoginRedirect() {
  redirect('/admin/login');
}
