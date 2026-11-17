import type { Metadata } from 'next';

import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Quản trị DreamTeam — Buồng điều hành & Phân tích',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
